'use client'

import { useLanguage } from '@/lib/language'
import { Globe, Loader2 } from 'lucide-react'

export function LanguageLoader() {
  const { isChangingLanguage, language } = useLanguage()

  if (!isChangingLanguage) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
        <div className="text-center space-y-6">
          {/* Globe Icon with Animation */}
          <div className="relative">
            <Globe className="w-16 h-16 text-primary mx-auto" />
            <Loader2 className="w-8 h-8 text-primary absolute -top-2 -right-2 animate-spin" />
          </div>
          
          {/* Loading Text */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {language === 'tr' ? 'Dil Değiştiriliyor...' : 'Changing Language...'}
            </h3>
            <p className="text-gray-600 text-sm">
              {language === 'tr' 
                ? 'Sepetiniz temizleniyor ve sayfa yenileniyor' 
                : 'Clearing cart and refreshing page'
              }
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          
          {/* Language Indicator */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <span>{language === 'tr' ? 'Türkçe' : 'English'}</span>
            <span>→</span>
            <span className="font-medium text-primary">
              {language === 'tr' ? 'English' : 'Türkçe'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
