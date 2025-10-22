'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { countries } from '@/lib/countries'
import { useLanguage } from '@/lib/language'

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  editingAddress?: any
}

export function AddressModal({ isOpen, onClose, onSubmit, editingAddress }: AddressModalProps) {
  const { language, t } = useLanguage()
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

  // Dil bazlı içerik
  const content = {
    tr: {
      editAddress: "Adresi Düzenle",
      addAddress: "Yeni Adres Ekle",
      addressTitle: "Adres Başlığı",
      addressTitlePlaceholder: "Ev, İş, vb.",
      fullName: "Ad Soyad",
      fullNamePlaceholder: "Ad Soyad",
      phone: "Telefon",
      phonePlaceholder: "0555 123 45 67",
      country: "Ülke",
      selectCountry: "Ülke seçiniz",
      city: "Şehir",
      cityPlaceholder: "Şehir",
      district: "İlçe",
      districtPlaceholder: "İlçe",
      address: "Adres",
      addressPlaceholder: "Mahalle, sokak, bina no, daire no",
      setAsDefault: "Bu adresi varsayılan adres olarak ayarla",
      cancel: "İptal",
      saveAddress: "Adresi Kaydet"
    },
    en: {
      editAddress: "Edit Address",
      addAddress: "Add New Address",
      addressTitle: "Address Title",
      addressTitlePlaceholder: "Home, Work, etc.",
      fullName: "Full Name",
      fullNamePlaceholder: "Full Name",
      phone: "Phone",
      phonePlaceholder: "0555 123 45 67",
      country: "Country",
      selectCountry: "Select country",
      city: "City",
      cityPlaceholder: "City",
      district: "District",
      districtPlaceholder: "District",
      address: "Address",
      addressPlaceholder: "Neighborhood, street, building no, apartment no",
      setAsDefault: "Set this address as default address",
      cancel: "Cancel",
      saveAddress: "Save Address"
    }
  }

  const t_content = content[language]

  // Update form data when editingAddress changes
  useEffect(() => {
    if (isOpen && editingAddress) {
      setFormData({
        title: editingAddress.title || '',
        fullName: editingAddress.fullName || '',
        phone: editingAddress.phone || '',
        country: editingAddress.country || '',
        city: editingAddress.city || '',
        district: editingAddress.district || '',
        address: editingAddress.address || '',
        isDefault: editingAddress.isDefault || false
      })
    } else if (isOpen && !editingAddress) {
      // Reset form for new address
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
    }
  }, [editingAddress, isOpen])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    // Reset form
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
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {editingAddress ? t_content.editAddress : t_content.addAddress}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="title">{t_content.addressTitle} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={t_content.addressTitlePlaceholder}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">{t_content.fullName} *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder={t_content.fullNamePlaceholder}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">{t_content.phone} *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={t_content.phonePlaceholder}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="country">{t_content.country} *</Label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t_content.selectCountry} />
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
            <div>
              <Label htmlFor="city">{t_content.city} *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder={t_content.cityPlaceholder}
                required
              />
            </div>
            <div>
              <Label htmlFor="district">{t_content.district} *</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                placeholder={t_content.districtPlaceholder}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">{t_content.address} *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder={t_content.addressPlaceholder}
              required
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
            <Label htmlFor="isDefault" className="text-sm">
              {t_content.setAsDefault}
            </Label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t_content.cancel}
            </Button>
            <Button type="submit">
              {t_content.saveAddress}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
