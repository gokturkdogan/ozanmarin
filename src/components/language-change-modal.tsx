'use client'

import { useLanguage } from '@/lib/language'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, AlertTriangle, ShoppingCart } from 'lucide-react'

interface LanguageChangeModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  currentLanguage: 'tr' | 'en'
  targetLanguage: 'tr' | 'en'
}

export function LanguageChangeModal({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  currentLanguage, 
  targetLanguage 
}: LanguageChangeModalProps) {
  if (!isOpen) return null

  const content = {
    tr: {
      title: "Dil Değiştir",
      warning: "Emin misiniz?",
      description: "Dil değiştirirken sepetiniz boşaltılacaktır.",
      currentLang: "Mevcut Dil:",
      targetLang: "Hedef Dil:",
      confirm: "Evet, Değiştir",
      cancel: "İptal",
      cartWarning: "Sepetinizdeki ürünler silinecek"
    },
    en: {
      title: "Change Language",
      warning: "Are you sure?",
      description: "Your cart will be cleared when changing language.",
      currentLang: "Current Language:",
      targetLang: "Target Language:",
      confirm: "Yes, Change",
      cancel: "Cancel",
      cartWarning: "Items in your cart will be removed"
    }
  }

  const t = content[currentLanguage]

  const getLanguageName = (lang: 'tr' | 'en') => {
    return lang === 'tr' ? 'Türkçe' : 'English'
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Globe className="w-6 h-6 text-primary" />
            <CardTitle className="text-xl">{t.title}</CardTitle>
          </div>
          <div className="flex items-center justify-center space-x-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{t.warning}</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Language Change Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t.currentLang}</span>
              <span className="font-medium">{getLanguageName(currentLanguage)}</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-2xl text-gray-400">→</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t.targetLang}</span>
              <span className="font-medium text-primary">{getLanguageName(targetLanguage)}</span>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ShoppingCart className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-orange-800 font-medium text-sm">{t.cartWarning}</p>
                <p className="text-orange-700 text-sm mt-1">{t.description}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              {t.cancel}
            </Button>
            <Button 
              onClick={onConfirm}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {t.confirm}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




