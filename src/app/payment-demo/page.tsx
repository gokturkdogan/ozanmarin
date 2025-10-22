'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCartStore } from '@/lib/cart'
import { CreditCard, ShoppingCart } from 'lucide-react'
import { countries } from '@/lib/countries'

export default function PaymentDemoPage() {
  const { items, getTotalPrice, getTotalItems } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Demo form data
  const [formData, setFormData] = useState({
    fullName: 'Göktürk Doğan',
    email: 'gokturk@example.com',
    phone: '5398226918',
    country: 'Türkiye',
    city: 'İstanbul',
    district: 'Kadıköy',
    address: 'Yenişehir Mahallesi Millet Caddesi Alp Sitesi B Blok'
  })

  const getShippingCost = () => {
    return formData.country === 'Türkiye' ? 200 : 1000
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      const paymentData = {
        cartItems: items,
        shippingAddress: formData,
        guestUser: formData,
        totalPrice: getTotalPrice() + getShippingCost()
      }

      const response = await fetch('/api/payment/iyzico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()

      if (result.success) {
        // Redirect to Iyzico payment page
        if (result.paymentUrl) {
          // Real Iyzico payment URL
          window.location.href = result.paymentUrl
        } else if (result.htmlContent) {
          // Iyzico payment form URL
          window.location.href = result.htmlContent
        } else {
          alert('Ödeme URL\'si alınamadı. Lütfen tekrar deneyin.')
        }
      } else {
        alert(result.error || 'Ödeme oluşturulurken bir hata oluştu.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Ödeme sırasında bir hata oluştu.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sepetiniz Boş</h1>
          <p className="text-gray-600 mb-4">Ödeme testi için önce sepete ürün ekleyin.</p>
          <Button onClick={() => window.location.href = '/products'}>
            Ürünleri İncele
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ödeme Test Sayfası</h1>
          <p className="text-gray-600">Iyzico ödeme entegrasyonunu test edin.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Teslimat Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Ad Soyad</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
                
                <div>
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
                
                <div>
                  <Label htmlFor="city">Şehir</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="district">İlçe</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Adres</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
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
                  <span>₺{getShippingCost().toLocaleString()}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Toplam:</span>
                    <span>₺{(getTotalPrice() + getShippingCost()).toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full mt-6 cursor-pointer"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {isProcessing ? 'İşleniyor...' : 'Ödemeyi Test Et'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
