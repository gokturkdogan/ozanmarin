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
import { useLanguage } from '@/lib/language'

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
  const { language, t } = useLanguage()

  // Dil bazlı içerik
  const content = {
    tr: {
      loading: "Adresler yükleniyor...",
      loginRequired: "Giriş yapmanız gerekiyor",
      loginButton: "Giriş Yap",
      backToProfile: "Profilim",
      pageTitle: "Adreslerim",
      pageDesc: "Teslimat adreslerinizi yönetin.",
      newAddress: "Yeni Adres",
      editAddress: "Adres Düzenle",
      addAddress: "Yeni Adres Ekle",
      editDesc: "Adres bilgilerinizi güncelleyin.",
      addDesc: "Yeni teslimat adresi ekleyin.",
      addressTitle: "Adres Başlığı",
      addressTitlePlaceholder: "Ev, İş, vb.",
      fullName: "Ad Soyad",
      fullNamePlaceholder: "Ad Soyad",
      phone: "Telefon",
      phonePlaceholder: "0555 123 45 67",
      country: "Ülke",
      countryPlaceholder: "Ülke seçiniz",
      city: "Şehir",
      cityPlaceholder: "İstanbul",
      district: "İlçe",
      districtPlaceholder: "Kadıköy",
      address: "Adres",
      addressPlaceholder: "Mahalle, sokak, bina no, daire no",
      setDefault: "Varsayılan adres olarak ayarla",
      save: "Kaydet",
      update: "Güncelle",
      saving: "Kaydediliyor...",
      cancel: "İptal",
      noAddresses: "Henüz adres eklenmemiş",
      noAddressesDesc: "İlk adresinizi ekleyerek başlayın.",
      addAddressButton: "Adres Ekle",
      default: "Varsayılan",
      setAsDefault: "Varsayılan Yap",
      deleteAddress: "Adresi Sil",
      deleteConfirm: "Bu adresi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      deleteButton: "Sil",
      cancelButton: "İptal",
      error: "Hata",
      userError: "Kullanıcı bilgileri yüklenirken bir hata oluştu.",
      addressesError: "Adresler yüklenirken bir hata oluştu.",
      success: "Başarılı",
      addressUpdated: "Adres başarıyla güncellendi.",
      addressAdded: "Adres başarıyla eklendi.",
      addressDeleted: "Adres başarıyla silindi.",
      defaultUpdated: "Varsayılan adres başarıyla güncellendi.",
      saveError: "Adres kaydedilirken bir hata oluştu.",
      deleteError: "Adres silinirken bir hata oluştu.",
      defaultError: "Varsayılan adres güncellenirken bir hata oluştu."
    },
    en: {
      loading: "Loading addresses...",
      loginRequired: "You need to log in",
      loginButton: "Log In",
      backToProfile: "My Profile",
      pageTitle: "My Addresses",
      pageDesc: "Manage your delivery addresses.",
      newAddress: "New Address",
      editAddress: "Edit Address",
      addAddress: "Add New Address",
      editDesc: "Update your address information.",
      addDesc: "Add a new delivery address.",
      addressTitle: "Address Title",
      addressTitlePlaceholder: "Home, Work, etc.",
      fullName: "Full Name",
      fullNamePlaceholder: "Full Name",
      phone: "Phone",
      phonePlaceholder: "0555 123 45 67",
      country: "Country",
      countryPlaceholder: "Select country",
      city: "City",
      cityPlaceholder: "Istanbul",
      district: "District",
      districtPlaceholder: "Kadikoy",
      address: "Address",
      addressPlaceholder: "Neighborhood, street, building no, apartment no",
      setDefault: "Set as default address",
      save: "Save",
      update: "Update",
      saving: "Saving...",
      cancel: "Cancel",
      noAddresses: "No addresses added yet",
      noAddressesDesc: "Start by adding your first address.",
      addAddressButton: "Add Address",
      default: "Default",
      setAsDefault: "Set as Default",
      deleteAddress: "Delete Address",
      deleteConfirm: "Are you sure you want to delete this address? This action cannot be undone.",
      deleteButton: "Delete",
      cancelButton: "Cancel",
      error: "Error",
      userError: "An error occurred while loading user information.",
      addressesError: "An error occurred while loading addresses.",
      success: "Success",
      addressUpdated: "Address updated successfully.",
      addressAdded: "Address added successfully.",
      addressDeleted: "Address deleted successfully.",
      defaultUpdated: "Default address updated successfully.",
      saveError: "An error occurred while saving the address.",
      deleteError: "An error occurred while deleting the address.",
      defaultError: "An error occurred while updating the default address."
    }
  }

  const t_content = content[language]

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
        title: t_content.error,
        description: t_content.userError,
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
        title: t_content.error,
        description: t_content.addressesError,
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
          title: t_content.success,
          description: editingAddress ? t_content.addressUpdated : t_content.addressAdded,
          variant: 'default'
        })
        resetForm()
        fetchAddresses()
      } else {
        const error = await response.json()
        toast({
          title: t_content.error,
          description: error.message || t_content.saveError,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error saving address:', error)
      toast({
        title: t_content.error,
        description: t_content.saveError,
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
          title: t_content.success,
          description: t_content.addressDeleted,
          variant: 'default'
        })
        fetchAddresses()
      } else {
        const error = await response.json()
        toast({
          title: t_content.error,
          description: error.message || t_content.deleteError,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      toast({
        title: t_content.error,
        description: t_content.deleteError,
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
          title: t_content.success,
          description: t_content.defaultUpdated,
          variant: 'default'
        })
        fetchAddresses()
      } else {
        const error = await response.json()
        toast({
          title: t_content.error,
          description: error.message || t_content.defaultError,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error setting default address:', error)
      toast({
        title: t_content.error,
        description: t_content.defaultError,
        variant: 'destructive'
      })
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t_content.backToProfile}
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{t_content.pageTitle}</h1>
            </div>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t_content.newAddress}
            </Button>
          </div>
          <p className="text-gray-600">{t_content.pageDesc}</p>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{editingAddress ? t_content.editAddress : t_content.addAddress}</span>
              </CardTitle>
              <CardDescription>
                {editingAddress ? t_content.editDesc : t_content.addDesc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t_content.addressTitle}</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder={t_content.addressTitlePlaceholder}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t_content.fullName}</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder={t_content.fullNamePlaceholder}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t_content.phone}</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder={t_content.phonePlaceholder}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">{t_content.country}</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t_content.countryPlaceholder} />
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
                    <Label htmlFor="city">{t_content.city}</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder={t_content.cityPlaceholder}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">{t_content.district}</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      placeholder={t_content.districtPlaceholder}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t_content.address}</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder={t_content.addressPlaceholder}
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
                  <Label htmlFor="isDefault">{t_content.setDefault}</Label>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="cursor-pointer"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? t_content.saving : (editingAddress ? t_content.update : t_content.save)}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    className="cursor-pointer"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {t_content.cancel}
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t_content.noAddresses}</h3>
              <p className="text-gray-600 mb-4">{t_content.noAddressesDesc}</p>
              <Button onClick={() => setShowAddForm(true)} className="cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                {t_content.addAddressButton}
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
                          {t_content.default}
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
                        {t_content.setAsDefault}
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
          title={t_content.deleteAddress}
          message={t_content.deleteConfirm}
          confirmText={t_content.deleteButton}
          cancelText={t_content.cancelButton}
          variant="destructive"
          isLoading={isDeleting}
        />
      </div>
    </div>
  )
}
