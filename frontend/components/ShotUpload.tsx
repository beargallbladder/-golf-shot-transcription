import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import toast from 'react-hot-toast'
import { CameraIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://golf-shot-transcription.onrender.com'

interface ShotData {
  id: number
  speed: number
  distance: number
  spin: number
  launchAngle: number
  club: string
  createdAt: string
}

interface ShotUploadProps {
  onShotAnalyzed?: (shot: ShotData) => void
}

const ShotUpload: React.FC<ShotUploadProps> = ({ onShotAnalyzed }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzedShot, setAnalyzedShot] = useState<ShotData | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [editingClub, setEditingClub] = useState(false)
  const [tempClub, setTempClub] = useState('')

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Compress image before upload
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        const maxWidth = 1920
        const maxHeight = 1080
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file) // Fallback to original
          }
        }, 'image/jpeg', 0.8) // 80% quality
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return

    const file = files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WebP)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    try {
      setIsAnalyzing(true)
      setAnalyzedShot(null)

      // Compress image for better performance
      const compressedFile = await compressImage(file)
      
      // Convert to base64
      const base64 = await convertToBase64(compressedFile)
      setUploadedImage(base64)

      // Send to backend for analysis
      const response = await axios.post(`${API_URL}/api/shots`, {
        imageBase64: base64
      })

      const { shot, personalBest } = response.data
      setAnalyzedShot(shot)
      onShotAnalyzed?.(shot)
      
      // Show personal best notification if applicable
      if (personalBest?.isPersonalBest) {
        if (personalBest.previousBest) {
          toast.success(
            `🔥 NEW PERSONAL BEST! ${personalBest.club}: ${personalBest.newBest} yards (+${personalBest.improvement} yards improvement!)`,
            { duration: 6000 }
          )
        } else {
          toast.success(
            `🎉 FIRST ${personalBest.club.toUpperCase()} SHOT! ${personalBest.newBest} yards - now beat it!`,
            { duration: 6000 }
          )
        }
      } else {
        toast.success('Shot analyzed successfully!')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to analyze shot. Please try again.'
      toast.error(errorMessage)
      
      // Handle rate limiting gracefully
      if (error.response?.status === 429) {
        const resetTime = error.response?.data?.resetTime
        if (resetTime) {
          const resetDate = new Date(resetTime)
          toast.error(`Daily limit reached. Resets at ${resetDate.toLocaleTimeString()}`, {
            duration: 8000
          })
        }
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleFileUpload(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  })

  const resetUpload = () => {
    setAnalyzedShot(null)
    setUploadedImage(null)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 relative overflow-hidden">
        {/* Golf Course Background */}
        <div 
          className="absolute inset-0 opacity-5 -z-10"
          style={{
            backgroundImage: 'url(/images/golf/585AF507-959E-4DEB-80ED-29B39004DFCC_1_105_c.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Upload Golf Shot</h2>
          <p className="text-gray-600">
            Take a photo or upload a screenshot of your golf simulator display
          </p>
        </div>

        {!analyzedShot && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-golf-green bg-golf-green bg-opacity-5'
                : 'border-gray-300 hover:border-golf-green hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            
            {isAnalyzing ? (
              <LoadingSpinner 
                size="lg" 
                text="AI is analyzing your shot..."
              />
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-golf-green rounded-full flex items-center justify-center">
                  {isDragActive ? (
                    <ArrowUpTrayIcon className="w-8 h-8 text-white" />
                  ) : (
                    <PhotoIcon className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {isDragActive ? 'Drop your image here' : 'Upload Shot Image'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop an image here, or click to select a file
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <span>📱 Camera</span>
                    <span>•</span>
                    <span>🖼️ Screenshot</span>
                    <span>•</span>
                    <span>📁 File Upload</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Max file size: 5MB • Supports JPG, PNG, WebP
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {analyzedShot && (
          <div className="space-y-6">
            {/* Uploaded Image Preview */}
            {uploadedImage && (
              <div className="text-center">
                <img
                  src={uploadedImage}
                  alt="Uploaded shot"
                  className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Shot Analysis Results */}
            <div className="bg-gradient-to-r from-golf-green to-golf-lightgreen rounded-xl p-6 text-white">
              <h3 className="text-2xl font-bold mb-6 text-center">Shot Analysis Results</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">
                    {analyzedShot.speed ? `${analyzedShot.speed.toFixed(1)}` : 'N/A'}
                  </div>
                  <div className="text-sm opacity-90">Speed (mph)</div>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">
                    {analyzedShot.distance ? `${analyzedShot.distance}` : 'N/A'}
                  </div>
                  <div className="text-sm opacity-90">Distance (yards)</div>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">
                    {analyzedShot.spin ? `${analyzedShot.spin}` : 'N/A'}
                  </div>
                  <div className="text-sm opacity-90">Spin (rpm)</div>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">
                    {analyzedShot.launchAngle ? `${analyzedShot.launchAngle.toFixed(1)}°` : 'N/A'}
                  </div>
                  <div className="text-sm opacity-90">Launch Angle</div>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="space-y-4">
              {/* Share Message */}
              <div className="text-center p-4 bg-white bg-opacity-30 rounded-lg">
                <p className="text-white font-bold text-lg mb-2">
                  🔥 {analyzedShot.distance} yards! Still pounding it! 💪
                </p>
                <p className="text-white text-sm opacity-90">Ready to share this shot?</p>
              </div>

              {/* Quick Share Buttons */}
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/share/shot/${analyzedShot.id}`
                    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
                    window.open(facebookUrl, '_blank')
                  }}
                  className="px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors font-semibold"
                >
                  Facebook
                </button>
                
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/share/shot/${analyzedShot.id}`
                    const shareText = `🔥 ${analyzedShot.distance} yards! Still pounding it! 💪 beatmybag.com 🏌️‍♂️ #golf #beatmybag`
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
                    window.open(twitterUrl, '_blank')
                  }}
                  className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                >
                  𝕏
                </button>
                
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/share/shot/${analyzedShot.id}`
                    navigator.clipboard.writeText(shareUrl)
                    toast.success('Share link copied to clipboard!')
                  }}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  Copy
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetUpload}
                  className="px-6 py-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  Upload Another Shot
                </button>
                <button
                  onClick={() => {
                    const sharePageUrl = `${window.location.origin}/share/shot/${analyzedShot.id}`
                    window.open(sharePageUrl, '_blank')
                  }}
                  className="px-6 py-3 bg-white text-golf-green rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                >
                  View Full Share Page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShotUpload