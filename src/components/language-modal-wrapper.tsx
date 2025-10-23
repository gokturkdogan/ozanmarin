'use client'

import { useLanguage } from '@/lib/language'
import { LanguageChangeModal } from '@/components/language-change-modal'

export function LanguageModalWrapper() {
  const { modalState, language } = useLanguage()

  return (
    <LanguageChangeModal
      isOpen={modalState.isOpen}
      onConfirm={modalState.confirmChange}
      onCancel={modalState.cancelChange}
      currentLanguage={language}
      targetLanguage={modalState.targetLanguage}
    />
  )
}




