'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CustomToastProps {
  title?: string
  description?: string
  message?: string
  show?: boolean
  onClose: () => void
  duration?: number
  type?: 'success' | 'error' | 'info'
}

export function CustomToast({ title, description, message, show = true, onClose, duration = 3000, type = 'info' }: CustomToastProps) {
  const [isVisible, setIsVisible] = useState(show)

  useEffect(() => {
    setIsVisible(show)
  }, [show])

  useEffect(() => {
    if (!isVisible) return
    
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Animation için delay
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose, isVisible])

  if (!isVisible) return null

  // Eğer message varsa, onu kullan; yoksa title ve description kullan
  const displayTitle = message ? 'Bilgi' : title
  const displayDescription = message || description

  // Type'a göre renk ve icon belirle
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          borderColor: 'border-green-200',
          iconColor: 'text-green-500',
          icon: CheckCircle,
          progressBg: 'bg-green-100',
          progressBar: 'bg-green-500'
        }
      case 'error':
        return {
          borderColor: 'border-red-200',
          iconColor: 'text-red-500',
          icon: AlertCircle,
          progressBg: 'bg-red-100',
          progressBar: 'bg-red-500'
        }
      default:
        return {
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-500',
          icon: CheckCircle,
          progressBg: 'bg-blue-100',
          progressBar: 'bg-blue-500'
        }
    }
  }

  const styles = getToastStyles()
  const IconComponent = styles.icon

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <div className={`bg-white border ${styles.borderColor} rounded-lg shadow-lg p-4 min-w-80 max-w-96`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <IconComponent className={`w-6 h-6 ${styles.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {displayTitle}
            </h4>
            <p className="text-sm text-gray-600">
              {displayDescription}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsVisible(false)
                setTimeout(onClose, 300)
              }}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className={`mt-3 ${styles.progressBg} rounded-full h-1 overflow-hidden`}>
          <div 
            className={`${styles.progressBar} h-1 rounded-full animate-progress`}
            style={{
              animationDuration: `${duration}ms`
            }}
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress {
          animation: progress linear forwards;
        }
      `}</style>
    </div>
  )
}
