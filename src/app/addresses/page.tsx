'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { ConfirmModal } from '@/components/confirm-modal'
import { MapPin, Plus, Edit, Trash2, ArrowLeft, Save, X } from 'lucide-react'
import Link from 'next/link'
import { countries } from '@/lib/countries'

interface Address {
  id: string
  title: string
  fullName: string
  phone: string
  country: string
  city: string
  district: string
  address: string
  isDefault: boolean
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function AddressesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    phone: '',
    country: '',
    city: '',
    district: '',
    address: '',
    isDefault: false
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchUser()
    fetchAddresses()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else if (response.status === 401) {
        router.push('/login')
        return
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      toast({
        title: 'Hata',
        description: 'Kullanıcı bilgileri yüklenirken bir hata oluştu.',
        variant: 'destructive'
      })
    }
  }

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses')
      
      if (response.ok) {
        const data = await response.json()
        setAddresses(data.addresses || [])
      } else if (response.status === 401) {
        router.push('/login')
        return
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
      toast({
        title: 'Hata',
        description: 'Adresler yüklenirken bir hata oluştu.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      fullName: '',
      phone: '',
      country: '',
      city: '',
      district: '',
      address: '',
      isDefault: false
    })
    setShowAddForm(false)
    setEditingAddress(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = editingAddress ? `/api/addresses/${editingAddress.id}` : '/api/addresses'
      const method = editingAddress ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: editingAddress ? 'Adres başarıyla güncellendi.' : 'Adres başarıyla eklendi.',
          variant: 'default'
        })
        resetForm()
        fetchAddresses()
      } else {
        const error = await response.json()
        toast({
          title: 'Hata',
          description: error.message || 'Adres kaydedilirken bir hata oluştu.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error saving address:', error)
      toast({
        title: 'Hata',
        description: 'Adres kaydedilirken bir hata oluştu.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      title: address.title,
      fullName: address.fullName,
      phone: address.phone,
      country: address.country,
      city: address.city,
      district: address.district,
      address: address.address,
      isDefault: address.isDefault
    })
    setShowAddForm(true)
  }

  const handleDelete = (addressId: string) => {
    setAddressToDelete(addressId)
    setShowConfirmModal(true)
  }

  const confirmDelete = async () => {
    if (!addressToDelete) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/addresses/${addressToDelete}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Adres başarıyla silindi.',
          variant: 'default'
        })
        fetchAddresses()
      } else {
        const error = await response.json()
        toast({
          title: 'Hata',
          description: error.message || 'Adres silinirken bir hata oluştu.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      toast({
        title: 'Hata',
        description: 'Adres silinirken bir hata oluştu.',
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(false)
      setAddressToDelete(null)
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}/default`, {
        method: 'PUT',
      })

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Varsayılan adres başarıyla güncellendi.',
          variant: 'default'
        })
        fetchAddresses()
      } else {
        const error = await response.json()
        toast({
          title: 'Hata',
          description: error.message || 'Varsayılan adres güncellenirken bir hata oluştu.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error setting default address:', error)
      toast({
        title: 'Hata',
        description: 'Varsayılan adres güncellenirken bir hata oluştu.',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Adresler yükleniyor...</p>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Profilim
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Adreslerim</h1>
            </div>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Adres
            </Button>
          </div>
          <p className="text-gray-600">Teslimat adreslerinizi yönetin.</p>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{editingAddress ? 'Adres Düzenle' : 'Yeni Adres Ekle'}</span>
              </CardTitle>
              <CardDescription>
                {editingAddress ? 'Adres bilgilerinizi güncelleyin.' : 'Yeni teslimat adresi ekleyin.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Adres Başlığı</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Ev, İş, vb."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Ad Soyad</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Ad Soyad"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="0555 123 45 67"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Ülke</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ülke seçiniz" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Şehir</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="İstanbul"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">İlçe</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      placeholder="Kadıköy"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Mahalle, sokak, bina no, daire no"
                    required
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isDefault">Varsayılan adres olarak ayarla</Label>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="cursor-pointer"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Kaydediliyor...' : (editingAddress ? 'Güncelle' : 'Kaydet')}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    className="cursor-pointer"
                  >
                    <X className="w-4 h-4 mr-2" />
                    İptal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz adres eklenmemiş</h3>
              <p className="text-gray-600 mb-4">İlk adresinizi ekleyerek başlayın.</p>
              <Button onClick={() => setShowAddForm(true)} className="cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                Adres Ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <Card key={address.id} className={`${address.isDefault ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{address.title}</span>
                      {address.isDefault && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          Varsayılan
                        </span>
                      )}
                    </CardTitle>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(address)}
                        className="cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(address.id)}
                        className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{address.fullName}</p>
                    <p className="text-gray-600">{address.phone}</p>
                    <p className="text-gray-600">
                      {address.district}, {address.city}, {address.country}
                    </p>
                    <p className="text-gray-600">{address.address}</p>
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                        className="mt-2 cursor-pointer"
                      >
                        Varsayılan Yap
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false)
            setAddressToDelete(null)
          }}
          onConfirm={confirmDelete}
          title="Adresi Sil"
          message="Bu adresi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
          confirmText="Sil"
          cancelText="İptal"
          variant="destructive"
          isLoading={isDeleting}
        />
      </div>
    </div>
  )
}
