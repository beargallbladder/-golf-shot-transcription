import React, { useState } from 'react'
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline'
import CleanButton from './CleanButton'

interface SimpleVoiceRecorderProps {
  onTranscription: (text: string) => void
  language: string
  className?: string
}

const SimpleVoiceRecorder: React.FC<SimpleVoiceRecorderProps> = ({
  onTranscription,
  language,
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleRecord = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false)
      setIsProcessing(true)
      
      // Simulate processing
      setTimeout(() => {
        const sampleText = language === 'spanish' 
          ? 'Driver Titleist, 280 yardas, buen golpe'
          : language === 'japanese'
          ? 'ドライバー、280ヤード、良いショット'
          : 'Driver Titleist, 280 yards, good shot'
        
        onTranscription(sampleText)
        setIsProcessing(false)
      }, 2000)
    } else {
      // Start recording
      setIsRecording(true)
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
          <span>Recording...</span>
        </div>
      )}
      
      {isProcessing && (
        <div className="text-sm text-gray-500">
          Processing voice...
        </div>
      )}
    </div>
  )
}

export default SimpleVoiceRecorder 