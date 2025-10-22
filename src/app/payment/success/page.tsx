'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, CreditCard, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  id: string
  productName: string
  productPrice: number
  quantity: number
  size?: string
  color?: string
  hasEmbroidery: boolean
  embroideryFile?: string
  embroideryPrice: number
}

interface Order {
  id: string
  totalPrice: number
  status: string
  iyzicoPaymentId: string
  shippingAddress: any
  createdAt: string
  items: OrderItem[]
  user?: {
    id: string
    name: string
    email: string
  }
}

export default function PaymentSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('paymentId')

  useEffect(() => {
    if (!paymentId) {
      setError('Ödeme ID bulunamadı')
      setIsLoading(false)
      return
    }

    // Simple success page - just show payment confirmation
    const mockOrder: Order = {
      id: `order_${Date.now()}`,
      totalPrice: 0, // Will be updated from actual order
      status: 'completed',
      iyzicoPaymentId: paymentId,
      shippingAddress: {},
      createdAt: new Date().toISOString(),
      items: []
    }
    setOrder(mockOrder)
    setIsLoading(false)
  }, [paymentId])


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Sipariş bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Hata</h1>
          <p className="text-gray-600 mb-4">{error || 'Sipariş bulunamadı'}</p>
          <Link href="/products">
            <Button>Ürünlere Dön</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ödemeniz Başarıyla Tamamlandı!
          </h1>
          <p className="text-gray-600">
            Ödeme ID: <span className="font-semibold text-primary">{order.iyzicoPaymentId}</span>
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Ödeme Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Ödeme ID: {order.iyzicoPaymentId}</p>
                <p className="text-sm text-gray-600">Durum: Başarılı</p>
                <p className="text-sm text-gray-600">
                  Tarih: {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 space-y-4">
          <Link href="/products" className="block">
            <Button className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Alışverişe Devam Et
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
