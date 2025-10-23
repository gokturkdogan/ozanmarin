'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/lib/language'
import { ArrowLeft, Lock, Mail } from 'lucide-react'
import Link from 'next/link'

function ResetPasswordContent() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isResetMode, setIsResetMode] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { language } = useLanguage()

  const content = {
    tr: {
      title: 'Şifre Sıfırlama',
      emailTitle: 'Email Adresinizi Girin',
      emailDesc: 'Şifrenizi sıfırlamak için email adresinizi girin.',
      emailLabel: 'Email Adresi',
      emailPlaceholder: 'ornek@email.com',
      sendResetLink: 'Sıfırlama Linki Gönder',
      newPasswordTitle: 'Yeni Şifrenizi Girin',
      newPasswordDesc: 'Yeni şifrenizi girin.',
      newPasswordLabel: 'Yeni Şifre',
      confirmPasswordLabel: 'Şifre Tekrar',
      passwordPlaceholder: 'En az 6 karakter',
      updatePassword: 'Şifreyi Güncelle',
      backToLogin: 'Giriş Sayfasına Dön',
      success: 'Şifre sıfırlama linki email adresinize gönderildi.',
      passwordUpdated: 'Şifreniz başarıyla güncellendi.',
      passwordsNotMatch: 'Şifreler eşleşmiyor.',
      invalidToken: 'Geçersiz veya süresi dolmuş token.',
      error: 'Bir hata oluştu. Lütfen tekrar deneyin.'
    },
    en: {
      title: 'Password Reset',
      emailTitle: 'Enter Your Email',
      emailDesc: 'Enter your email address to reset your password.',
      emailLabel: 'Email Address',
      emailPlaceholder: 'example@email.com',
      sendResetLink: 'Send Reset Link',
      newPasswordTitle: 'Enter New Password',
      newPasswordDesc: 'Enter your new password.',
      newPasswordLabel: 'New Password',
      confirmPasswordLabel: 'Confirm Password',
      passwordPlaceholder: 'At least 6 characters',
      updatePassword: 'Update Password',
      backToLogin: 'Back to Login',
      success: 'Password reset link has been sent to your email.',
      passwordUpdated: 'Your password has been updated successfully.',
      passwordsNotMatch: 'Passwords do not match.',
      invalidToken: 'Invalid or expired token.',
      error: 'An error occurred. Please try again.'
    }
  }

  const t = content[language]

  useEffect(() => {
    if (token) {
      setIsResetMode(true)
    }
  }, [token])

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          language
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(t.success)
        setEmail('')
      } else {
        setError(data.error || t.error)
      }
    } catch (error) {
      setError(t.error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    if (newPassword !== confirmPassword) {
      setError(t.passwordsNotMatch)
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError(language === 'tr' ? 'Şifre en az 6 karakter olmalıdır.' : 'Password must be at least 6 characters.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(t.passwordUpdated)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(data.error || t.invalidToken)
      }
    } catch (error) {
      setError(t.error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t.backToLogin}
          </Link>
          <div className="flex justify-center">
            {isResetMode ? (
              <Lock className="w-12 h-12 text-primary" />
            ) : (
              <Mail className="w-12 h-12 text-primary" />
            )}
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isResetMode ? t.newPasswordDesc : t.emailDesc}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isResetMode ? t.newPasswordTitle : t.emailTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isResetMode ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">{t.newPasswordLabel}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">{t.confirmPasswordLabel}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    required
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (language === 'tr' ? 'Güncelleniyor...' : 'Updating...') : t.updatePassword}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSendResetLink} className="space-y-4">
                <div>
                  <Label htmlFor="email">{t.emailLabel}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (language === 'tr' ? 'Gönderiliyor...' : 'Sending...') : t.sendResetLink}
                </Button>
              </form>
            )}

            {message && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {message}
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
