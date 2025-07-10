import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CameraIcon, PhotoIcon, MicrophoneIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'
import { CameraIcon as CameraIconSolid } from '@heroicons/react/24/solid'
import LoadingSpinner from './LoadingSpinner'
import RealTimeVoiceTranscription from './RealTimeVoiceTranscription'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface ShotData {
  id: number
  speed: number
  distance: number
  spin: number
  launchAngle: number
  club: string
  createdAt: string
  enhancedData?: {
    clubBrand?: string
    clubModel?: string
    shaftType?: string
    shaftFlex?: string
    recommendations?: string
  }
}

interface MobileShotUploadProps {
  onShotAnalyzed?: (shot: ShotData) => void
  mode?: 'photo' | 'video' | 'voice'
}

const MobileShotUpload: React.FC<MobileShotUploadProps> = ({ 
  onShotAnalyzed, 
  mode = 'photo' 
}) => {
  const { user } = useAuth()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzedShot, setAnalyzedShot] = useState<ShotData | null>(null)
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null)
  const [currentMode, setCurrentMode] = useState(mode)
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Quick club selection
  const commonClubs = [
    'Driver', '3-wood', '5-wood', '3-iron', '4-iron', '5-iron', 
    '6-iron', '7-iron', '8-iron', '9-iron', 'PW', 'SW', 'Putter'
  ]

  // Haptic feedback helper
  const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [50], 
        heavy: [100]
      }
      navigator.vibrate(patterns[intensity])
    }
  }

  // Start camera for photo/video capture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: currentMode === 'video'
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setShowCamera(true)
      triggerHaptic('medium')
    } catch (error) {
      console.error('Camera access failed:', error)
      toast.error('Camera access denied. Please check permissions.')
    }
  }

  // Stop camera and cleanup
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas size to video size
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0)
    
    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        setCapturedMedia(url)
        stopCamera()
        triggerHaptic('heavy')
        toast.success('📸 Photo captured!')
      }
    }, 'image/jpeg', 0.8)
  }

  // Handle file upload from gallery
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File too large. Please select a smaller image.')
      return
    }

    const url = URL.createObjectURL(file)
    setCapturedMedia(url)
    triggerHaptic('medium')
    toast.success('📁 Image uploaded!')
  }

  // Analyze shot using AI
  const analyzeShot = async () => {
    if (!capturedMedia || !user) return

    setIsAnalyzing(true)
    
    try {
      // Convert captured media to blob for upload
      const response = await fetch(capturedMedia)
      const blob = await response.blob()
      
      const formData = new FormData()
      formData.append('image', blob, 'shot.jpg')
      formData.append('userId', user.id.toString())
      
      // Simulate AI analysis (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockShot: ShotData = {
        id: Date.now(),
        speed: Math.floor(Math.random() * 50) + 100,
        distance: Math.floor(Math.random() * 100) + 200,
        spin: Math.floor(Math.random() * 2000) + 2000,
        launchAngle: Math.floor(Math.random() * 10) + 10,
        club: '7-iron',
        createdAt: new Date().toISOString(),
        enhancedData: {
          recommendations: 'Great shot! Try adjusting your stance for more distance.'
        }
      }
      
      setAnalyzedShot(mockShot)
      onShotAnalyzed?.(mockShot)
      triggerHaptic('heavy')
      toast.success('🎯 Shot analyzed successfully!')
      
    } catch (error) {
      console.error('Analysis failed:', error)
      toast.error('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Handle voice transcription
  const handleVoiceTranscription = (text: string) => {
    // Extract golf data from voice
    const extractedData = extractGolfDataFromText(text)
    if (extractedData) {
      setAnalyzedShot(extractedData)
      onShotAnalyzed?.(extractedData)
      toast.success('🎤 Voice data captured!')
    }
  }

  // Extract golf data from transcribed text
  const extractGolfDataFromText = (text: string): ShotData | null => {
    // Simple extraction logic (can be enhanced with AI)
    const distanceMatch = text.match(/(\d+)\s*(yard|meter)/i)
    const clubMatch = text.match(/(driver|iron|wood|wedge|putter|\d-iron)/i)
    
    if (distanceMatch) {
      return {
        id: Date.now(),
        speed: 0,
        distance: parseInt(distanceMatch[1]),
        spin: 0,
        launchAngle: 0,
        club: clubMatch?.[1] || 'Unknown',
        createdAt: new Date().toISOString()
      }
    }
    
    return null
  }

  // Reset state
  const resetCapture = () => {
    setCapturedMedia(null)
    setAnalyzedShot(null)
    stopCamera()
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Mode selector */}
      <div className="flex gap-2 mb-6">
        {(['photo', 'video', 'voice'] as const).map((modeOption) => (
          <motion.button
            key={modeOption}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCurrentMode(modeOption)
              triggerHaptic('light')
              resetCapture()
            }}
            className={`flex-1 p-3 rounded-xl font-medium transition-all ${
              currentMode === modeOption
                ? 'bg-golf-green text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {modeOption === 'photo' && <CameraIcon className="w-5 h-5 mx-auto mb-1" />}
            {modeOption === 'video' && <div className="w-5 h-5 bg-current rounded mx-auto mb-1" />}
            {modeOption === 'voice' && <MicrophoneIcon className="w-5 h-5 mx-auto mb-1" />}
            {modeOption.charAt(0).toUpperCase() + modeOption.slice(1)}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Camera view */}
        {showCamera && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Camera controls */}
            <div className="absolute bottom-safe-bottom left-0 right-0 p-6">
              <div className="flex items-center justify-center gap-8">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={stopCamera}
                  className="w-12 h-12 bg-gray-800/80 rounded-full flex items-center justify-center"
                >
                  <XMarkIcon className="w-6 h-6 text-white" />
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={capturePhoto}
                  className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center shadow-lg"
                >
                  <CameraIconSolid className="w-8 h-8 text-gray-700" />
                </motion.button>
                
                <div className="w-12 h-12" /> {/* Spacer */}
              </div>
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        )}

        {/* Voice transcription mode */}
        {currentMode === 'voice' && !analyzedShot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <RealTimeVoiceTranscription onTranscription={handleVoiceTranscription} />
          </motion.div>
        )}

        {/* Photo/Video capture mode */}
        {(currentMode === 'photo' || currentMode === 'video') && !capturedMedia && !showCamera && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Camera button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startCamera}
              className="w-full h-32 bg-golf-green hover:bg-golf-lightgreen text-white rounded-2xl flex flex-col items-center justify-center shadow-lg transition-colors"
            >
              <CameraIcon className="w-12 h-12 mb-2" />
              <span className="font-semibold">Take {currentMode}</span>
            </motion.button>
            
            {/* Gallery upload */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="w-full h-20 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <PhotoIcon className="w-8 h-8 text-gray-600 mr-3" />
                <span className="text-gray-700 font-medium">Choose from Gallery</span>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Captured media preview */}
        {capturedMedia && !analyzedShot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-4"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img src={capturedMedia} alt="Captured shot" className="w-full h-64 object-cover" />
              <button
                onClick={resetCapture}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={analyzeShot}
              disabled={isAnalyzing}
              className="w-full h-14 bg-golf-green hover:bg-golf-lightgreen text-white rounded-2xl font-semibold shadow-lg disabled:opacity-50 transition-colors"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner />
                  <span className="ml-2">Analyzing Shot...</span>
                </div>
              ) : (
                '🎯 Analyze Shot'
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Analysis results */}
        {analyzedShot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Shot Analysis</h3>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-golf-green">{analyzedShot.distance}</div>
                  <div className="text-sm text-gray-500">yards</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-golf-green">{analyzedShot.club}</div>
                  <div className="text-sm text-gray-500">club</div>
                </div>
              </div>
              
              {analyzedShot.enhancedData?.recommendations && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    💡 {analyzedShot.enhancedData.recommendations}
                  </p>
                </div>
              )}
            </div>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={resetCapture}
              className="w-full h-12 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors"
            >
              Capture Another Shot
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MobileShotUpload