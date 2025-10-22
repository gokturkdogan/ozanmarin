'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'tr' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (tr: string, en?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('tr')

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

  // Translation function
  const t = (tr: string, en?: string) => {
    if (language === 'en' && en) {
      return en
    }
    return tr
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
