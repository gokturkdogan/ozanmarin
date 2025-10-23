'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Anchor } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import { CustomToast } from '@/components/custom-toast'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const router = useRouter()
  const { language } = useLanguage()

  // Dil bazlı içerik
  const content = {
    tr: {
      title: 'Hesap Oluşturun',
      subtitle: 'Zaten hesabınız var mı?',
      loginLink: 'Giriş yapın',
      cardTitle: 'Kayıt Ol',
      cardDescription: 'Yeni hesap oluşturmak için bilgilerinizi girin',
      nameLabel: 'Ad Soyad',
      namePlaceholder: 'Adınız ve soyadınız',
      emailLabel: 'Email Adresi',
      emailPlaceholder: 'ornek@email.com',
      passwordLabel: 'Şifre',
      passwordPlaceholder: 'En az 6 karakter',
      confirmPasswordLabel: 'Şifre Tekrar',
      confirmPasswordPlaceholder: 'Şifrenizi tekrar girin',
      registerButton: 'Kayıt Ol',
      registeringButton: 'Kayıt olunuyor...',
      passwordsNotMatch: 'Şifreler eşleşmiyor',
      registerError: 'Kayıt olurken bir hata oluştu',
      serverError: 'Sunucu hatası',
      successMessage: 'Kayıt başarılı! Hoş geldiniz emaili gönderildi.',
      redirectingMessage: 'Giriş sayfasına yönlendiriliyorsunuz...'
    },
    en: {
      title: 'Create Account',
      subtitle: 'Already have an account?',
      loginLink: 'Sign in',
      cardTitle: 'Register',
      cardDescription: 'Enter your information to create a new account',
      nameLabel: 'Full Name',
      namePlaceholder: 'Your first and last name',
      emailLabel: 'Email Address',
      emailPlaceholder: 'example@email.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'At least 6 characters',
      confirmPasswordLabel: 'Confirm Password',
      confirmPasswordPlaceholder: 'Re-enter your password',
      registerButton: 'Register',
      registeringButton: 'Registering...',
      passwordsNotMatch: 'Passwords do not match',
      registerError: 'An error occurred while registering',
      serverError: 'Server error',
      successMessage: 'Registration successful! Welcome email sent.',
      redirectingMessage: 'Redirecting to login page...'
    }
  }

  const t = content[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Password confirmation check
    if (formData.password !== formData.confirmPassword) {
      setError(t.passwordsNotMatch)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          name: formData.name,
          email: formData.email,
          password: formData.password,
          language: language
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setToastMessage(t.successMessage)
        setShowToast(true)
        
        // 2 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          setToastMessage(t.redirectingMessage)
          setTimeout(() => {
            router.push('/login')
          }, 1000)
        }, 2000)
      } else {
        setError(data.error || t.registerError)
      }
    } catch (error) {
      setError(t.serverError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Anchor className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">Ozan Marin</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {t.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t.subtitle}{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              {t.loginLink}
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t.cardTitle}</CardTitle>
            <CardDescription>
              {t.cardDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">{t.nameLabel}</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t.namePlaceholder}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t.emailLabel}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t.emailPlaceholder}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t.passwordLabel}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t.passwordPlaceholder}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.confirmPasswordLabel}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t.confirmPasswordPlaceholder}
                />
              </div>
              
              <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                {isLoading ? t.registeringButton : t.registerButton}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <CustomToast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
        duration={5000}
        type="success"
      />
    </div>
  )
}
