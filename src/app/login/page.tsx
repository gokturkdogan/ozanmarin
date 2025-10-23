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

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { language } = useLanguage()

  // Dil bazlı içerik
  const content = {
    tr: {
      title: 'Hesabınıza Giriş Yapın',
      subtitle: 'Hesabınız yok mu?',
      registerLink: 'Kayıt olun',
      cardTitle: 'Giriş Yap',
      cardDescription: 'Email adresiniz ve şifrenizle giriş yapın',
      emailLabel: 'Email Adresi',
      emailPlaceholder: 'ornek@email.com',
      passwordLabel: 'Şifre',
      passwordPlaceholder: 'Şifrenizi girin',
      forgotPasswordLink: 'Şifremi Unuttum',
      loginButton: 'Giriş Yap',
      loggingInButton: 'Giriş yapılıyor...',
      loginError: 'Giriş yapılırken bir hata oluştu',
      serverError: 'Sunucu hatası'
    },
    en: {
      title: 'Sign in to your account',
      subtitle: "Don't have an account?",
      registerLink: 'Sign up',
      cardTitle: 'Sign In',
      cardDescription: 'Sign in with your email and password',
      emailLabel: 'Email Address',
      emailPlaceholder: 'example@email.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      forgotPasswordLink: 'Forgot Password',
      loginButton: 'Sign In',
      loggingInButton: 'Signing in...',
      loginError: 'An error occurred while signing in',
      serverError: 'Server error'
    }
  }

  const t = content[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          ...formData
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Admin kullanıcısı için özel yönlendirme
        if (data.isAdmin) {
          window.location.href = '/admin'
        } else {
          window.location.href = '/'
        }
      } else {
        setError(data.error || t.loginError)
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
            <Link href="/register" className="font-medium text-primary hover:text-primary/80">
              {t.registerLink}
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
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">{t.passwordLabel}</Label>
                  <Link href="/reset-password" className="text-sm text-primary hover:text-primary/80">
                    {t.forgotPasswordLink}
                  </Link>
                </div>
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
              
              <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                {isLoading ? t.loggingInButton : t.loginButton}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
