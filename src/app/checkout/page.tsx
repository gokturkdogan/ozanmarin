'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCartStore } from '@/lib/cart'
import { ArrowLeft, Plus, CreditCard, MapPin, Edit } from 'lucide-react'
import Link from 'next/link'
import { countries } from '@/lib/countries'
import { AddressModal } from '@/components/address-modal'

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
}

export default function CheckoutPage() {
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore()
  const [user, setUser] = useState<User | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  
  // Guest form data
  const [guestForm, setGuestForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: 'Türkiye',
    city: '',
    district: '',
    address: ''
  })

  // Calculate shipping cost based on country
  const getShippingCost = () => {
    if (user) {
      // Login user - check selected address
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId)
      if (selectedAddress) {
        return selectedAddress.country === 'Türkiye' ? 200 : 1000
      }
    } else {
      // Guest user - check form country
      return guestForm.country === 'Türkiye' ? 200 : 1000
    }
    return 200 // Default to Turkey shipping
  }

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
          
          // Fetch user addresses
          const addressesResponse = await fetch('/api/addresses')
          if (addressesResponse.ok) {
            const addressesData = await addressesResponse.json()
            setAddresses(addressesData.addresses)
            
            // Select default address if exists
            const defaultAddress = addressesData.addresses.find((addr: Address) => addr.isDefault)
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id)
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleGuestInputChange = (field: string, value: string) => {
    setGuestForm(prev => ({ ...prev, [field]: value }))
  }

  const handleAddressModalSubmit = async (formData: any) => {
    try {
      if (editingAddress) {
        // Update existing address
        const response = await fetch(`/api/addresses/${editingAddress.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          const updatedAddress = await response.json()
          setAddresses(prev => prev.map(addr => 
            addr.id === editingAddress.id ? updatedAddress.address : addr
          ))
          setEditingAddress(null)
          setShowAddressModal(false)
        } else {
          const errorData = await response.json()
          console.error('Address update failed:', errorData.message)
          alert('Adres güncellenirken bir hata oluştu: ' + errorData.message)
        }
      } else {
        // Create new address
        const response = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          const newAddress = await response.json()
          setAddresses(prev => [...prev, newAddress.address])
          setSelectedAddressId(newAddress.address.id)
          setShowAddressModal(false)
        } else {
          const errorData = await response.json()
          console.error('Address creation failed:', errorData.message)
          alert('Adres oluşturulurken bir hata oluştu: ' + errorData.message)
        }
      }
    } catch (error) {
      console.error('Address operation failed:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setShowAddressModal(true)
  }

  const handleProceedToPayment = () => {
    // TODO: Implement payment processing
    console.log('Proceeding to payment...')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sepetiniz Boş</h1>
            <p className="text-gray-600 mb-8">
              Önce sepetinize ürün eklemeniz gerekiyor.
            </p>
            <Link href="/products">
              <Button size="lg">
                Ürünleri İncele
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/cart">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Sepete Dön
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Siparişi Tamamla</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Teslimat Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user ? (
                  // Logged in user - address selection
                  <div className="space-y-4">
                    {addresses.length > 0 ? (
                      <>
                        <div className="space-y-3">
                          {addresses.map((address) => (
                            <div
                              key={address.id}
                              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                selectedAddressId === address.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedAddressId(address.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{address.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {address.fullName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {address.address}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {address.district}, {address.city}, {address.country}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {address.phone}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                  {address.isDefault && (
                                    <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                                      Varsayılan
                                    </span>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditAddress(address)
                                    }}
                                    className="h-8 px-2"
                                  >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Düzenle
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <Button
                          variant="outline"
                          onClick={() => setShowAddressModal(true)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Yeni Adres Ekle
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">Henüz kayıtlı adresiniz yok.</p>
                        <Button onClick={() => setShowAddressModal(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          İlk Adresinizi Ekleyin
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  // Guest user - address form
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="guest-fullName">Ad Soyad *</Label>
                        <Input
                          id="guest-fullName"
                          value={guestForm.fullName}
                          onChange={(e) => handleGuestInputChange('fullName', e.target.value)}
                          placeholder="Ad Soyad"
                        />
                      </div>
                      <div>
                        <Label htmlFor="guest-email">E-posta *</Label>
                        <Input
                          id="guest-email"
                          type="email"
                          value={guestForm.email}
                          onChange={(e) => handleGuestInputChange('email', e.target.value)}
                          placeholder="ornek@email.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="guest-phone">Telefon *</Label>
                      <Input
                        id="guest-phone"
                        value={guestForm.phone}
                        onChange={(e) => handleGuestInputChange('phone', e.target.value)}
                        placeholder="0555 123 45 67"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="guest-country">Ülke *</Label>
                        <Select value={guestForm.country} onValueChange={(value) => handleGuestInputChange('country', value)}>
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
                      <div>
                        <Label htmlFor="guest-city">Şehir *</Label>
                        <Input
                          id="guest-city"
                          value={guestForm.city}
                          onChange={(e) => handleGuestInputChange('city', e.target.value)}
                          placeholder="Şehir"
                        />
                      </div>
                      <div>
                        <Label htmlFor="guest-district">İlçe *</Label>
                        <Input
                          id="guest-district"
                          value={guestForm.district}
                          onChange={(e) => handleGuestInputChange('district', e.target.value)}
                          placeholder="İlçe"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="guest-address">Adres *</Label>
                      <Input
                        id="guest-address"
                        value={guestForm.address}
                        onChange={(e) => handleGuestInputChange('address', e.target.value)}
                        placeholder="Mahalle, sokak, bina no, daire no"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Ödeme Yöntemi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center">
                    <CreditCard className="w-6 h-6 text-primary mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">Kredi Kartı ile Ödeme</h4>
                      <p className="text-sm text-gray-600">Güvenli ödeme işlemi</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Ödeme detayları bir sonraki adımda girilecektir.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Sipariş Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Ürün Sayısı:</span>
                  <span>{getTotalItems()} adet</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Ara Toplam:</span>
                  <span>₺{getTotalPrice().toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Kargo:</span>
                  <div className="text-right">
                    <div>₺{getShippingCost().toLocaleString()}</div>
                    <div className="text-gray-500 text-xs">
                      {getShippingCost() === 200 
                        ? '(teslimat adresine göre değişiklik gösterebilir)'
                        : '(uluslararası kargo)'
                      }
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Toplam:</span>
                    <span>₺{(getTotalPrice() + getShippingCost()).toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full mt-6 cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={handleProceedToPayment}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Ödemeye Devam Et
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false)
          setEditingAddress(null)
        }}
        onSubmit={handleAddressModalSubmit}
        editingAddress={editingAddress}
      />
    </div>
  )
}