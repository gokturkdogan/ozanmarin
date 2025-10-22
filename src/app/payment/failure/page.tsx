'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Failure Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ödeme Başarısız
          </h1>
          <p className="text-gray-600">
            Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Olası Nedenler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  Kart bilgilerinizde hata olabilir
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  Kart limitiniz yetersiz olabilir
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  İnternet bağlantınızda sorun olabilir
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  Bankanızın güvenlik önlemleri devreye girmiş olabilir
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ne Yapabilirsiniz?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Kart Bilgilerinizi Kontrol Edin</p>
                  <p className="text-xs text-gray-600">Kart numarası, son kullanma tarihi ve CVV kodunu kontrol edin</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Farklı Kart Deneyin</p>
                  <p className="text-xs text-gray-600">Başka bir kredi kartı veya banka kartı kullanabilirsiniz</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Bankanızla İletişime Geçin</p>
                  <p className="text-xs text-gray-600">Online alışverişlerinizin engellenip engellenmediğini kontrol edin</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/checkout" className="flex-1 sm:flex-none">
            <Button className="w-full cursor-pointer">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tekrar Dene
            </Button>
          </Link>
          
          <Link href="/products" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ürünlere Dön
            </Button>
          </Link>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Sorun devam ederse{' '}
            <Link href="/contact" className="text-primary hover:underline">
              bizimle iletişime geçin
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
