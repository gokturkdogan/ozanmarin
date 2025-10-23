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
import { useLanguage } from '@/lib/language'

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
  const { language, t } = useLanguage()

  // Dil bazlı içerik
  const content = {
    tr: {
      loading: "Profil yükleniyor...",
      loginRequired: "Giriş yapmanız gerekiyor",
      loginButton: "Giriş Yap",
      backToHome: "Ana Sayfa",
      pageTitle: "Profilim",
      pageDesc: "Hesap bilgilerinizi ve şifrenizi yönetin.",
      profileInfo: "Profil Bilgileri",
      profileDesc: "Kişisel bilgilerinizi güncelleyin.",
      fullName: "Ad Soyad",
      fullNamePlaceholder: "Adınızı ve soyadınızı girin",
      email: "E-posta",
      emailPlaceholder: "E-posta adresinizi girin",
      saveProfile: "Bilgileri Kaydet",
      saving: "Kaydediliyor...",
      changePassword: "Şifre Değiştir",
      passwordDesc: "Hesap güvenliğiniz için şifrenizi güncelleyin.",
      currentPassword: "Mevcut Şifre",
      currentPasswordPlaceholder: "Mevcut şifrenizi girin",
      newPassword: "Yeni Şifre",
      newPasswordPlaceholder: "Yeni şifrenizi girin",
      confirmPassword: "Yeni Şifre Tekrar",
      confirmPasswordPlaceholder: "Yeni şifrenizi tekrar girin",
      changePasswordButton: "Şifreyi Değiştir",
      changing: "Değiştiriliyor...",
      accountInfo: "Hesap Bilgileri",
      userId: "Kullanıcı ID",
      accountType: "Hesap Türü",
      error: "Hata",
      success: "Başarılı",
      userError: "Kullanıcı bilgileri yüklenirken bir hata oluştu.",
      profileUpdated: "Profil bilgileriniz güncellendi.",
      profileUpdateError: "Profil güncellenirken bir hata oluştu.",
      passwordMismatch: "Yeni şifreler eşleşmiyor.",
      passwordTooShort: "Yeni şifre en az 6 karakter olmalıdır.",
      passwordChanged: "Şifreniz başarıyla değiştirildi.",
      passwordChangeError: "Şifre değiştirilirken bir hata oluştu."
    },
    en: {
      loading: "Loading profile...",
      loginRequired: "You need to log in",
      loginButton: "Log In",
      backToHome: "Home",
      pageTitle: "My Profile",
      pageDesc: "Manage your account information and password.",
      profileInfo: "Profile Information",
      profileDesc: "Update your personal information.",
      fullName: "Full Name",
      fullNamePlaceholder: "Enter your first and last name",
      email: "Email",
      emailPlaceholder: "Enter your email address",
      saveProfile: "Save Information",
      saving: "Saving...",
      changePassword: "Change Password",
      passwordDesc: "Update your password for account security.",
      currentPassword: "Current Password",
      currentPasswordPlaceholder: "Enter your current password",
      newPassword: "New Password",
      newPasswordPlaceholder: "Enter your new password",
      confirmPassword: "Confirm New Password",
      confirmPasswordPlaceholder: "Enter your new password again",
      changePasswordButton: "Change Password",
      changing: "Changing...",
      accountInfo: "Account Information",
      userId: "User ID",
      accountType: "Account Type",
      error: "Error",
      success: "Success",
      userError: "An error occurred while loading user information.",
      profileUpdated: "Your profile information has been updated.",
      profileUpdateError: "An error occurred while updating the profile.",
      passwordMismatch: "New passwords do not match.",
      passwordTooShort: "New password must be at least 6 characters.",
      passwordChanged: "Your password has been changed successfully.",
      passwordChangeError: "An error occurred while changing the password."
    }
  }

  const t_content = content[language]

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
          title: t_content.error,
          description: t_content.userError,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      toast({
        title: t_content.error,
        description: t_content.userError,
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
          name: formData.name
        }),
      })

      if (response.ok) {
        toast({
          title: t_content.success,
          description: t_content.profileUpdated,
          variant: 'default'
        })
        // Update local user state
        if (user) {
          setUser({
            ...user,
            name: formData.name
          })
        }
      } else {
        const error = await response.json()
        toast({
          title: t_content.error,
          description: error.message || t_content.profileUpdateError,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: t_content.error,
        description: t_content.profileUpdateError,
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
        title: t_content.error,
        description: t_content.passwordMismatch,
        variant: 'destructive'
      })
      return
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: t_content.error,
        description: t_content.passwordTooShort,
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
          title: t_content.success,
          description: t_content.passwordChanged,
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
          title: t_content.error,
          description: error.message || t_content.passwordChangeError,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast({
        title: t_content.error,
        description: t_content.passwordChangeError,
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
          <p className="mt-4 text-gray-600">{t_content.loading}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t_content.loginRequired}</h1>
          <Link href="/login">
            <Button>{t_content.loginButton}</Button>
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
                {t_content.backToHome}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{t_content.pageTitle}</h1>
          </div>
          <p className="text-gray-600">{t_content.pageDesc}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-primary" />
                <span>{t_content.profileInfo}</span>
              </CardTitle>
              <CardDescription>
                {t_content.profileDesc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t_content.fullName}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={t_content.fullNamePlaceholder}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t_content.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={t_content.emailPlaceholder}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full cursor-pointer"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? t_content.saving : t_content.saveProfile}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-primary" />
                <span>{t_content.changePassword}</span>
              </CardTitle>
              <CardDescription>
                {t_content.passwordDesc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t_content.currentPassword}</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    placeholder={t_content.currentPasswordPlaceholder}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t_content.newPassword}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder={t_content.newPasswordPlaceholder}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t_content.confirmPassword}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder={t_content.confirmPasswordPlaceholder}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full cursor-pointer"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isSaving ? t_content.changing : t_content.changePasswordButton}
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
              <span>{t_content.accountInfo}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">{t_content.userId}</Label>
                <p className="text-sm text-gray-900">{user.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t_content.accountType}</Label>
                <p className="text-sm text-gray-900 capitalize">{user.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
