import React, { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { MicrophoneIcon, StopIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline'
import apiClient from '../config/axios'

interface VoiceTranscriptionProps {
  onTranscription: (text: string, originalLanguage: string, translatedText?: string) => void
  targetLanguage?: 'english' | 'japanese' | 'korean' | 'spanish'
  placeholder?: string
  className?: string
}

interface TranscriptionResult {
  originalText: string
  originalLanguage: string
  translatedText?: string
  confidence: number
}

const VoiceTranscription: React.FC<VoiceTranscriptionProps> = ({
  onTranscription,
  targetLanguage = 'english',
  placeholder = "Click to record voice notes...",
  className = ""
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [recordingTime, setRecordingTime] = useState(0)
  const [lastTranscription, setLastTranscription] = useState<TranscriptionResult | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Language configurations
  const languages = {
    english: { code: 'en-US', name: 'English', flag: '🇺🇸' },
    japanese: { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    korean: { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
    spanish: { code: 'es-ES', name: 'Español', flag: '🇪🇸' }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
      if (audioLevelIntervalRef.current) clearInterval(audioLevelIntervalRef.current)
      if (audioContextRef.current) audioContextRef.current.close()
    }
  }, [])

  // Audio level monitoring
  const startAudioLevelMonitoring = (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      
      audioLevelIntervalRef.current = setInterval(() => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setAudioLevel(Math.min(100, (average / 128) * 100))
        }
      }, 100)
    } catch (error) {
      console.warn('Audio level monitoring failed:', error)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      audioChunksRef.current = []
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = handleRecordingStop
      
      mediaRecorderRef.current.start(1000) // Collect data every second
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start audio level monitoring
      startAudioLevelMonitoring(stream)
      
      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      toast.success('🎤 Recording started! Speak clearly...')
      
    } catch (error) {
      console.error('Failed to start recording:', error)
      toast.error('Failed to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      setAudioLevel(0)
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
      
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current)
        audioLevelIntervalRef.current = null
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }

  const handleRecordingStop = async () => {
    if (audioChunksRef.current.length === 0) {
      toast.error('No audio recorded. Please try again.')
      return
    }

    setIsProcessing(true)
    
    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' })
      
      // Convert to base64 for API
      const base64Audio = await blobToBase64(audioBlob)
      
      // Send to backend for transcription
      const response = await apiClient.post('/api/voice/transcribe', {
        audioData: base64Audio,
        sourceLanguage: 'auto', // Auto-detect source language
        targetLanguage: targetLanguage,
        context: 'golf_fitting' // Helps with golf-specific terminology
      })
      
      const result: TranscriptionResult = response.data
      setLastTranscription(result)
      
      // Call the callback with transcription results
      onTranscription(
        result.translatedText || result.originalText,
        result.originalLanguage,
        result.translatedText
      )
      
      // Show success message
      const sourceLanguage = Object.values(languages).find(lang => 
        lang.code.startsWith(result.originalLanguage.split('-')[0])
      )?.name || result.originalLanguage
      
      if (result.translatedText && result.originalLanguage !== targetLanguage) {
        toast.success(
          `🎯 Transcribed from ${sourceLanguage} and translated!`,
          { duration: 4000 }
        )
      } else {
        toast.success(`✅ Transcribed in ${sourceLanguage}!`)
      }
      
    } catch (error: any) {
      console.error('Transcription failed:', error)
      const errorMessage = error.response?.data?.message || 'Failed to transcribe audio. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const playLastTranscription = () => {
    if (lastTranscription) {
      const utterance = new SpeechSynthesisUtterance(
        lastTranscription.translatedText || lastTranscription.originalText
      )
      
      // Set language for speech synthesis
      const targetLang = languages[targetLanguage]
      utterance.lang = targetLang.code
      utterance.rate = 0.9
      utterance.pitch = 1
      
      speechSynthesis.speak(utterance)
      toast.success('🔊 Playing transcription...')
    }
  }

  return (
    <div className={`bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 ${className}`}>
      <div className="text-center">
        <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center justify-center">
          <MicrophoneIcon className="w-5 h-5 mr-2" />
          Voice Transcription
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Speak in {Object.values(languages).map(lang => `${lang.flag} ${lang.name}`).join(', ')}
        </p>
        
        {/* Recording Button */}
        <div className="mb-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isProcessing ? (
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isRecording ? (
              <StopIcon className="w-8 h-8 text-white" />
            ) : (
              <MicrophoneIcon className="w-8 h-8 text-white" />
            )}
            
            {/* Audio level indicator */}
            {isRecording && (
              <div 
                className="absolute inset-0 rounded-full border-4 border-white opacity-60"
                style={{
                  transform: `scale(${1 + (audioLevel / 100) * 0.3})`
                }}
              />
            )}
          </button>
        </div>
        
        {/* Recording Status */}
        {isRecording && (
          <div className="mb-4">
            <div className="text-red-600 font-semibold">
              🔴 Recording: {formatTime(recordingTime)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-150"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Processing Status */}
        {isProcessing && (
          <div className="mb-4 text-blue-600 font-semibold">
            🤖 Processing audio...
          </div>
        )}
        
        {/* Last Transcription */}
        {lastTranscription && !isRecording && !isProcessing && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">
                Last Transcription:
              </span>
              <button
                onClick={playLastTranscription}
                className="p-1 text-green-600 hover:text-green-800 transition-colors"
                title="Play transcription"
              >
                <SpeakerWaveIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="text-gray-800 text-left">
              {lastTranscription.translatedText || lastTranscription.originalText}
            </div>
            {lastTranscription.translatedText && (
              <div className="text-xs text-gray-500 mt-2">
                Original ({lastTranscription.originalLanguage}): {lastTranscription.originalText}
              </div>
            )}
            <div className="text-xs text-green-600 mt-1">
              Confidence: {Math.round(lastTranscription.confidence * 100)}%
            </div>
          </div>
        )}
        
        {/* Instructions */}
        <div className="text-xs text-gray-500 mt-4">
          <p>• Click to start/stop recording</p>
          <p>• Speak clearly for best results</p>
          <p>• Golf terminology is automatically recognized</p>
          {targetLanguage !== 'english' && (
            <p>• Auto-translates to {languages[targetLanguage].name}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default VoiceTranscription 