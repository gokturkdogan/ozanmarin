'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { useCartStore } from '@/lib/cart'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'success' | 'failed' | 'loading'>('loading')
  const { clearCart } = useCartStore()

  useEffect(() => {
    const paymentId = searchParams.get('paymentId')
    const method = searchParams.get('method')

    if (paymentId) {
      setStatus('success')
      // Clear cart when payment is successful
      clearCart()
    } else {
      setStatus('failed')
    }
  }, [searchParams, clearCart])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p>Ödeme durumu kontrol ediliyor...</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sipariş Başarılı!</h1>
          <p className="text-gray-600 mb-8">
            Siparişiniz başarıyla alındı. En kısa sürede hazırlanacaktır.
            Sipariş detayları e-postanıza gönderilmiştir.
          </p>
          <div className="space-y-4">
            <Link href="/products">
              <Button size="lg" className="w-full">
                Alışverişe Devam Et
              </Button>
            </Link>
            <Link href="/orders">
              <Button size="lg" variant="outline" className="w-full">
                Siparişlerimi Görüntüle
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-red-500 text-4xl">✗</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Ödeme Başarısız</h1>
        <p className="text-gray-600 mb-8">
          Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.
        </p>
        <div className="space-y-4">
          <Link href="/checkout">
            <Button size="lg" className="w-full">
              Tekrar Dene
            </Button>
          </Link>
          <Link href="/products">
            <Button size="lg" variant="outline" className="w-full">
              Alışverişe Devam Et
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}