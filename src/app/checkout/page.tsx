'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCartStore } from '@/lib/cart'
import { ShoppingCart, CreditCard, MapPin, User } from 'lucide-react'

export default function CheckoutPage() {
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    notes: ''
  })
  const router = useRouter()

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Create order
      const orderData = {
        items: items,
        totalPrice: getTotalPrice(),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode
        },
        notes: formData.notes
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (response.ok) {
        // Clear cart and redirect to success page
        clearCart()
        router.push(`/orders/${result.order.id}`)
      } else {
        alert('Sipariş oluşturulurken bir hata oluştu: ' + result.error)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Sipariş oluşturulurken bir hata oluştu')
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return null // Will redirect to cart
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sipariş Tamamla</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Teslimat Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Ad *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Soyad *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefon *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Adres *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Şehir *</Label>
                      <Input
                        id="city"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Posta Kodu *</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notlar</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Siparişinizle ilgili özel notlarınız..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Ödeme Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Demo Modu:</strong> Bu demo sitede gerçek ödeme alınmamaktadır. 
                      Siparişiniz test amaçlı olarak kaydedilecektir.
                    </p>
                    <p className="text-blue-700 text-sm mt-2">
                      <strong>Misafir Sipariş:</strong> Hesap oluşturmadan da sipariş verebilirsiniz. 
                      Sipariş takibi için email adresinizi kullanabilirsiniz.
                    </p>
                  </div>
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
                  {/* Order Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ShoppingCart className="w-6 h-6 text-white opacity-50" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} adet × ₺{item.price.toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          ₺{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Ara Toplam:</span>
                      <span>₺{getTotalPrice().toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Kargo:</span>
                      <span className="text-green-600">Ücretsiz</span>
                    </div>
                    
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Toplam:</span>
                      <span>₺{getTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    size="lg" 
                    className="w-full mt-6 cursor-pointer hover:bg-primary/90 transition-colors"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'İşleniyor...' : 'Siparişi Tamamla'}
                  </Button>

                  <div className="text-xs text-gray-500 text-center">
                    <p>Güvenli ödeme ile korunuyorsunuz</p>
                    <p>Kargo ücretsizdir</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
