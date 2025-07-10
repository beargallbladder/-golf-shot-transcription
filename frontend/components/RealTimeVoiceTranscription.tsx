import React, { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { MicrophoneIcon, StopIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline'

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
  isFinal: boolean
}

const RealTimeVoiceTranscription: React.FC<VoiceTranscriptionProps> = ({
  onTranscription,
  targetLanguage = 'english',
  placeholder = "Click to record voice notes...",
  className = ""
}) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [listeningTime, setListeningTime] = useState(0)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const listeningIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Language configurations for Web Speech API
  const languages = {
    english: { code: 'en-US', name: 'English', flag: '🇺🇸' },
    japanese: { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    korean: { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
    spanish: { code: 'es-ES', name: 'Español', flag: '🇪🇸' }
  }

  // Initialize Speech Recognition
  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = languages[targetLanguage].code
    recognition.maxAlternatives = 1

    // Handle results in real-time
    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''
      let totalConfidence = 0
      let resultCount = 0

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcriptText = result[0].transcript

        if (result.isFinal) {
          finalTranscript += transcriptText + ' '
          totalConfidence += result[0].confidence || 0.95
          resultCount++
          
          // Debounce final results to avoid spam
          if (debounceRef.current) clearTimeout(debounceRef.current)
          debounceRef.current = setTimeout(() => {
            const avgConfidence = resultCount > 0 ? totalConfidence / resultCount : 0.95
            handleFinalResult(transcriptText, avgConfidence)
          }, 500)
        } else {
          interimTranscript += transcriptText
        }
      }

      setTranscript(interimTranscript)
      if (finalTranscript) {
        setFinalTranscript(prev => prev + finalTranscript)
      }
    }

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started')
      setIsListening(true)
      setListeningTime(0)
      toast.success('🎤 Listening... Speak now!')
      
      // Start timer
      listeningIntervalRef.current = setInterval(() => {
        setListeningTime(prev => prev + 1)
      }, 1000)
    }

    recognition.onend = () => {
      console.log('🛑 Speech recognition ended')
      setIsListening(false)
      setTranscript('')
      
      if (listeningIntervalRef.current) {
        clearInterval(listeningIntervalRef.current)
        listeningIntervalRef.current = null
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      
      switch (event.error) {
        case 'no-speech':
          toast.error('No speech detected. Please try again.')
          break
        case 'audio-capture':
          toast.error('Microphone not accessible. Check permissions.')
          break
        case 'not-allowed':
          toast.error('Microphone permission denied.')
          break
        case 'network':
          toast.error('Network error. Check your connection.')
          break
        default:
          toast.error(`Speech recognition error: ${event.error}`)
      }
      
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognition) {
        recognition.stop()
      }
      if (listeningIntervalRef.current) {
        clearInterval(listeningIntervalRef.current)
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [targetLanguage])

  const handleFinalResult = (text: string, confidence: number) => {
    console.log('📝 Final transcription:', text, 'Confidence:', confidence)
    
    setConfidence(confidence)
    
    // Enhanced golf terminology processing
    const processedText = enhanceGolfTerminology(text)
    
    // Call the callback immediately with results
    onTranscription(processedText, languages[targetLanguage].code, undefined)
    
    // Show success toast
    toast.success(`✅ Transcribed: "${processedText}"`, { 
      duration: 3000,
      icon: confidence > 0.8 ? '🎯' : '📝'
    })
  }

  // Enhanced golf terminology recognition
  const enhanceGolfTerminology = (text: string): string => {
    const golfTerms = {
      // Distance corrections
      'tree thirty': '330',
      'two fifty': '250',
      'two seventy': '270',
      'too fifty': '250',
      'to fifty': '250',
      
      // Club corrections
      'seven iron': '7-iron',
      'driver': 'driver',
      'pitching wedge': 'PW',
      'sand wedge': 'SW',
      'putter': 'putter',
      
      // Shot types
      'fade': 'fade',
      'draw': 'draw',
      'slice': 'slice',
      'hook': 'hook',
      'straight': 'straight',
      
      // Course features
      'fairway': 'fairway',
      'rough': 'rough',
      'bunker': 'bunker',
      'green': 'green',
      'tee': 'tee'
    }

    let processed = text.toLowerCase()
    
    Object.entries(golfTerms).forEach(([spoken, written]) => {
      const regex = new RegExp(`\\b${spoken}\\b`, 'gi')
      processed = processed.replace(regex, written)
    })
    
    return processed
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      setFinalTranscript('')
      setConfidence(0)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const playTranscription = () => {
    if (finalTranscript) {
      const utterance = new SpeechSynthesisUtterance(finalTranscript)
      utterance.lang = languages[targetLanguage].code
      utterance.rate = 0.9
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
      toast.success('🔊 Playing transcription...')
    }
  }

  const currentText = transcript || finalTranscript

  return (
    <div className={`bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 ${className}`}>
      <div className="text-center">
        <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center justify-center">
          <MicrophoneIcon className="w-5 h-5 mr-2" />
          Real-Time Voice Transcription
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            ⚡ LIVE
          </span>
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Speak in {languages[targetLanguage].flag} {languages[targetLanguage].name} - transcribed instantly!
        </p>
        
        {/* Listening Button */}
        <div className="mb-4">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-200'
                : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200'
            }`}
          >
            {isListening ? (
              <StopIcon className="w-8 h-8 text-white" />
            ) : (
              <MicrophoneIcon className="w-8 h-8 text-white" />
            )}
            
            {/* Listening indicator */}
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-white opacity-60 animate-ping" />
                <div className="absolute inset-0 rounded-full border-4 border-red-300 opacity-40 animate-pulse" />
              </>
            )}
          </button>
        </div>
        
        {/* Listening Status */}
        {isListening && (
          <div className="mb-4">
            <div className="text-red-600 font-semibold flex items-center justify-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
              LIVE: {formatTime(listeningTime)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Speak clearly for best results
            </div>
          </div>
        )}
        
        {/* Real-time Transcript */}
        {currentText && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 min-h-[80px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">
                {transcript ? 'Listening...' : 'Final Transcript:'}
              </span>
              {finalTranscript && (
                <button
                  onClick={playTranscription}
                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Play transcription"
                >
                  <SpeakerWaveIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className={`text-gray-800 text-left ${transcript ? 'italic opacity-75' : 'font-medium'}`}>
              {currentText || 'Waiting for speech...'}
              {transcript && <span className="animate-pulse">|</span>}
            </div>
            {confidence > 0 && (
              <div className="flex items-center mt-2">
                <span className="text-xs text-blue-600">
                  Confidence: {Math.round(confidence * 100)}%
                </span>
                <div className="flex ml-2">
                  {confidence > 0.8 && <span>🎯</span>}
                  {confidence > 0.6 && confidence <= 0.8 && <span>👍</span>}
                  {confidence <= 0.6 && <span>🤔</span>}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Instructions */}
        <div className="text-xs text-gray-500 mt-4 space-y-1">
          <p>• Real-time transcription with Web Speech API</p>
          <p>• No file uploads or API delays</p>
          <p>• Golf terminology automatically enhanced</p>
          <p>• Works offline after initial load</p>
        </div>
      </div>
    </div>
  )
}

export default RealTimeVoiceTranscription