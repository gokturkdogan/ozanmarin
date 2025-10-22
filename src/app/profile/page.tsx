'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { User, Mail, Lock, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setFormData({
          name: data.user.name,
          email: data.user.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else if (response.status === 401) {
        // Token yoksa veya geçersizse login'e yönlendir
        router.push('/login')
        return
      } else {
        toast({
          title: 'Hata',
          description: 'Kullanıcı bilgileri yüklenirken bir hata oluştu.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      toast({
        title: 'Hata',
        description: 'Kullanıcı bilgileri yüklenirken bir hata oluştu.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email
        }),
      })

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Profil bilgileriniz güncellendi.',
          variant: 'default'
        })
        // Update local user state
        if (user) {
          setUser({
            ...user,
            name: formData.name,
            email: formData.email
          })
        }
      } else {
        const error = await response.json()
        toast({
          title: 'Hata',
          description: error.message || 'Profil güncellenirken bir hata oluştu.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Hata',
        description: 'Profil güncellenirken bir hata oluştu.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Hata',
        description: 'Yeni şifreler eşleşmiyor.',
        variant: 'destructive'
      })
      return
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: 'Hata',
        description: 'Yeni şifre en az 6 karakter olmalıdır.',
        variant: 'destructive'
      })
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      })

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Şifreniz başarıyla değiştirildi.',
          variant: 'default'
        })
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        const error = await response.json()
        toast({
          title: 'Hata',
          description: error.message || 'Şifre değiştirilirken bir hata oluştu.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast({
        title: 'Hata',
        description: 'Şifre değiştirilirken bir hata oluştu.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Profil yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Giriş yapmanız gerekiyor</h1>
          <Link href="/login">
            <Button>Giriş Yap</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="cursor-pointer">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ana Sayfa
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Profilim</h1>
          </div>
          <p className="text-gray-600">Hesap bilgilerinizi ve şifrenizi yönetin.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-primary" />
                <span>Profil Bilgileri</span>
              </CardTitle>
              <CardDescription>
                Kişisel bilgilerinizi güncelleyin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Adınızı ve soyadınızı girin"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="E-posta adresinizi girin"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full cursor-pointer"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Kaydediliyor...' : 'Bilgileri Kaydet'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-primary" />
                <span>Şifre Değiştir</span>
              </CardTitle>
              <CardDescription>
                Hesap güvenliğiniz için şifrenizi güncelleyin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    placeholder="Mevcut şifrenizi girin"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="Yeni şifrenizi girin"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Yeni şifrenizi tekrar girin"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full cursor-pointer"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isSaving ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-primary" />
              <span>Hesap Bilgileri</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Kullanıcı ID</Label>
                <p className="text-sm text-gray-900">{user.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Hesap Türü</Label>
                <p className="text-sm text-gray-900 capitalize">{user.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
