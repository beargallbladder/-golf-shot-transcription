import React, { useState, useRef } from 'react'
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline'
import CleanButton from './CleanButton'
import toast from 'react-hot-toast'

interface RealVoiceRecorderProps {
  onTranscription: (text: string) => void
  language: string
  className?: string
}

const RealVoiceRecorder: React.FC<RealVoiceRecorderProps> = ({
  onTranscription,
  language,
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Language mapping for Web Speech API
  const languageMap: { [key: string]: string } = {
    english: 'en-US',
    japanese: 'ja-JP',
    korean: 'ko-KR',
    spanish: 'es-ES'
  }

  const startRecording = () => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      toast.error('Voice recording not supported in this browser. Try Chrome or Safari.')
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    // Configure recognition
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = languageMap[language] || 'en-US'

    // Event handlers
    recognition.onstart = () => {
      setIsRecording(true)
      toast.success('🎤 Recording started - speak clearly!')
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }

      if (finalTranscript.trim()) {
        console.log('🎯 Transcribed:', finalTranscript)
        onTranscription(finalTranscript.trim())
        toast.success('✅ Voice transcribed successfully!')
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)
      
      switch (event.error) {
        case 'no-speech':
          toast.error('No speech detected. Please try again.')
          break
        case 'audio-capture':
          toast.error('Microphone not accessible. Please check permissions.')
          break
        case 'not-allowed':
          toast.error('Microphone permission denied. Please allow microphone access.')
          break
        default:
          toast.error('Voice recognition failed. Please try again.')
      }
    }

    recognition.onend = () => {
      setIsRecording(false)
      setIsProcessing(false)
    }

    // Start recognition
    recognition.start()
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      setIsProcessing(true)
      recognitionRef.current.stop()
    }
  }

  const handleRecord = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <CleanButton
        onClick={handleRecord}
        variant={isRecording ? 'danger' : 'secondary'}
        size="sm"
        loading={isProcessing}
        className="flex-shrink-0"
      >
        {isRecording ? (
          <StopIcon className="w-4 h-4 mr-1" />
        ) : (
          <MicrophoneIcon className="w-4 h-4 mr-1" />
        )}
        {isRecording ? 'Stop' : 'Record'}
      </CleanButton>
      
      {isRecording && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>Listening...</span>
        </div>
      )}
      
      {isProcessing && (
        <div className="text-sm text-gray-500">
          Processing...
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        {language === 'japanese' ? '日本語' : 
         language === 'korean' ? '한국어' :
         language === 'spanish' ? 'Español' : 'English'}
      </div>
    </div>
  )
}

export default RealVoiceRecorder 