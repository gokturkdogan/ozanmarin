'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useCartStore } from './cart'

type Language = 'tr' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (tr: string, en?: string) => string
  isChangingLanguage: boolean
  showLanguageModal: (targetLanguage: Language) => void
  modalState: {
    isOpen: boolean
    targetLanguage: Language
    confirmChange: () => void
    cancelChange: () => void
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('tr')
  const [isChangingLanguage, setIsChangingLanguage] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [targetLanguage, setTargetLanguage] = useState<Language>('en')
  const { clearCart } = useCartStore()

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  // Show language change modal
  const showLanguageModal = (newLanguage: Language) => {
    if (newLanguage !== language) {
      setTargetLanguage(newLanguage)
      setShowModal(true)
    }
  }

  // Confirm language change
  const confirmLanguageChange = () => {
    setShowModal(false)
    setIsChangingLanguage(true)
    
    // Clear cart to avoid price confusion
    clearCart()
    
    // Set new language
    setLanguage(targetLanguage)
    
    // Refresh page to ensure all components use new language
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  // Cancel language change
  const cancelLanguageChange = () => {
    setShowModal(false)
  }

  // Translation function
  const t = (tr: string, en?: string) => {
    if (language === 'en' && en) {
      return en
    }
    return tr
  }

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: showLanguageModal, 
      t, 
      isChangingLanguage,
      showLanguageModal,
      modalState: {
        isOpen: showModal,
        targetLanguage,
        confirmChange: confirmLanguageChange,
        cancelChange: cancelLanguageChange
      }
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Helper function to get translated text from database fields
export function getTranslatedText(tr: string | null, en: string | null, language: Language): string {
  if (language === 'en' && en) {
    return en
  }
  return tr || ''
}

// Helper function to get translated colors array
export function getTranslatedColors(colors: { tr: string; en: string }[], language: Language): string[] {
  return colors.map(color => {
    if (language === 'en' && color.en) {
      return color.en
    }
    return color.tr
  })
}
