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
  const [paymentMethod, setPaymentMethod] = useState<string>('online') // Default to online payment
  
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

  const handleProceedToPayment = async () => {
    try {
      // Validate required fields
      if (user) {
        // Logged in user - check if address is selected
        if (!selectedAddressId) {
          alert('Lütfen bir teslimat adresi seçin.')
          return
        }
      } else {
        // Guest user - check if form is filled
        if (!guestForm.fullName || !guestForm.email || !guestForm.phone || 
            !guestForm.city || !guestForm.district || !guestForm.address) {
          alert('Lütfen tüm teslimat bilgilerini doldurun.')
          return
        }
      }

      // Prepare payment data
      const shippingAddress = user 
        ? addresses.find(addr => addr.id === selectedAddressId)
        : guestForm

      if (!shippingAddress) {
        alert('Teslimat adresi bulunamadı.')
        return
      }

      // Check payment method
      if (paymentMethod === 'bank_transfer') {
        // Create order directly for bank transfer
        const orderData = {
          userId: user ? user.id : null,
          totalPrice: getTotalPrice() + getShippingCost(),
          status: 'received',
          paymentStatus: 'pending',
          paymentMethod: 'bank_transfer',
          shippingAddress: shippingAddress,
          items: items.map(item => ({
            productId: item.id,
            productName: item.name,
            productPrice: item.price + (item.embroideryPrice || 0),
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            hasEmbroidery: item.hasEmbroidery || false,
            embroideryFile: item.embroideryFile,
            embroideryPrice: item.embroideryPrice || 0
          }))
        }

        const response = await fetch('/api/orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        })

        const result = await response.json()

        if (result.success) {
          // Clear cart and redirect to success page
          clearCart()
          window.location.href = `/payment/success?paymentId=${result.order.id}&method=bank_transfer`
        } else {
          alert(result.error || 'Sipariş oluşturulurken bir hata oluştu.')
        }
        return
      }

      // Continue with Iyzico for online payment
      // Clean Turkish characters for Iyzico
      const cleanText = (text: string) => {
        return text.replace(/[çğıöşüÇĞIİÖŞÜ]/g, (match) => {
          const map: { [key: string]: string } = {
            'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
            'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
          }
          return map[match] || match
        })
      }

      const totalPrice = getTotalPrice() + getShippingCost()
      const basketId = `basket_${Date.now()}`

      // Prepare Iyzico request
      const iyzicoRequest = {
        locale: 'tr',
        conversationId: basketId,
        price: totalPrice.toFixed(2),
        paidPrice: totalPrice.toFixed(2),
        currency: 'TRY',
        installment: 1,
        paymentChannel: 'WEB',
        paymentGroup: 'PRODUCT',
        callbackUrl: `${window.location.origin}/api/iyzico/callback`,
        enabledInstallments: [1, 2, 3, 6, 9, 12],
        buyer: {
          id: user ? user.id : `guest_${Date.now()}`,
          name: cleanText(user ? user.name.split(' ')[0] : guestForm.fullName.split(' ')[0]),
          surname: cleanText(user ? user.name.split(' ').slice(1).join(' ') : guestForm.fullName.split(' ').slice(1).join(' ')),
          email: user ? user.email : guestForm.email,
          phoneNumber: `+90${(shippingAddress.phone || '').replace(/^0/, '')}`,
          identityNumber: '11111111111',
          address: cleanText(shippingAddress.address),
          city: cleanText(shippingAddress.city),
          country: 'TR',
          zipCode: '34000',
          registrationAddress: cleanText(shippingAddress.address),
          registrationCity: cleanText(shippingAddress.city),
          registrationCountry: 'TR',
          registrationZipCode: '34000'
        },
        shippingAddress: {
          contactName: cleanText(shippingAddress.fullName || `${shippingAddress.name || ''} ${shippingAddress.surname || ''}`),
          city: cleanText(shippingAddress.city),
          country: 'TR',
          address: cleanText(shippingAddress.address),
          zipCode: '34000'
        },
        billingAddress: {
          contactName: cleanText(shippingAddress.fullName || `${shippingAddress.name || ''} ${shippingAddress.surname || ''}`),
          city: cleanText(shippingAddress.city),
          country: 'TR',
          address: cleanText(shippingAddress.address),
          zipCode: '34000'
        },
        basketItems: [
          ...items.map((item: any, index: number) => ({
            id: `item_${index}`,
            name: cleanText(item.name),
            category1: 'Denizcilik Tekstili',
            itemType: 'PHYSICAL',
            price: ((item.price + (item.embroideryPrice || 0)) * item.quantity).toFixed(2)
          })),
          {
            id: 'shipping',
            name: 'Kargo',
            category1: 'Kargo',
            itemType: 'PHYSICAL',
            price: getShippingCost().toFixed(2)
          }
        ]
      }

      console.log('Iyzico Request:', JSON.stringify(iyzicoRequest, null, 2))

      // Create payment with Iyzico
      const response = await fetch('/api/iyzico/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(iyzicoRequest),
      })

      const result = await response.json()

      if (result.status === 'success' && result.paymentPageUrl) {
        // Redirect to Iyzico payment page
        window.location.href = result.paymentPageUrl
      } else {
        console.error('Iyzico Error:', result)
        alert(result.errorMessage || 'Ödeme oluşturulurken bir hata oluştu.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Ödeme sırasında bir hata oluştu. Lütfen tekrar deneyin.')
    }
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Online Ödeme */}
                  <button
                    onClick={() => setPaymentMethod('online')}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      paymentMethod === 'online'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <CreditCard className="w-6 h-6 text-primary mr-3" />
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900">Online Ödeme</h4>
                        <p className="text-sm text-gray-600">Kredi kartı ile güvenli ödeme</p>
                      </div>
                    </div>
                  </button>

                  {/* Havale/EFT */}
                  <button
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900">Havale/EFT</h4>
                        <p className="text-sm text-gray-600">Banka hesabına transfer</p>
                      </div>
                    </div>
                  </button>
                </div>
                
                {paymentMethod === 'bank_transfer' && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Havale/EFT Bilgileri</h5>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>Banka:</strong> Türkiye İş Bankası</p>
                      <p><strong>Hesap Adı:</strong> Ozan Marin Denizcilik</p>
                      <p><strong>IBAN:</strong> TR12 0006 4000 0011 2345 6789 01</p>
                      <p className="text-xs text-blue-600 mt-2">
                        Ödeme yaptıktan sonra dekontu WhatsApp'tan gönderebilirsiniz.
                      </p>
                    </div>
                  </div>
                )}
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