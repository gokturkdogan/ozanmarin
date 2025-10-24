'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Package, Truck, Home, ArrowLeft } from 'lucide-react'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  stockType?: 'piece' | 'meter'
}

interface Order {
  id: string
  totalPrice: number
  status: string
  createdAt: string
  items: OrderItem[]
  shippingAddress: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    zipCode: string
  }
}

interface OrderPageProps {
  params: Promise<{
    id: string
  }>
}

export default function OrderPage({ params }: OrderPageProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [orderId, setOrderId] = useState<string>('')

  useEffect(() => {
    const getId = async () => {
      const resolvedParams = await params
      setOrderId(resolvedParams.id)
    }
    getId()
  }, [params])

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      const data = await response.json()
      setOrder(data.order)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede'
      case 'paid':
        return 'Ödendi'
      case 'shipped':
        return 'Kargoya Verildi'
      case 'delivered':
        return 'Teslim Edildi'
      case 'cancelled':
        return 'İptal Edildi'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Package className="w-5 h-5" />
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />
      case 'delivered':
        return <Home className="w-5 h-5 text-green-600" />
      case 'cancelled':
        return <Package className="w-5 h-5 text-red-500" />
      default:
        return <Package className="w-5 h-5" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Sipariş yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sipariş bulunamadı</h1>
          <Link href="/orders">
            <Button>Siparişlerime Dön</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Siparişlerime Dön
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Sipariş #{order.id.slice(-8)}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(order.status)}
            <span className="text-lg font-medium">{getStatusText(order.status)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Sipariş Detayları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-white opacity-50" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-gray-600">
                          {String(item.stockType).toLowerCase().includes('meter')
                            ? `${item.quantity} metre × ₺${item.price.toLocaleString()}`
                            : `${item.quantity} adet × ₺${item.price.toLocaleString()}`
                          }
                        </p>
                        <div className="bg-red-100 p-2 rounded text-red-800 text-sm">
                          DEBUG: stockType = "{item.stockType}" (type: {typeof item.stockType})
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          ₺{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Teslimat Adresi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.zipCode} {order.shippingAddress.city}
                  </p>
                  <p>{order.shippingAddress.phone}</p>
                  <p>{order.shippingAddress.email}</p>
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
                <div className="flex justify-between text-sm">
                  <span>Sipariş Tarihi:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Sipariş No:</span>
                  <span className="font-mono">#{order.id.slice(-8)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Durum:</span>
                  <span className="flex items-center space-x-1">
                    {getStatusIcon(order.status)}
                    <span>{getStatusText(order.status)}</span>
                  </span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Toplam:</span>
                    <span>₺{order.totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/products">
                    <Button className="w-full">
                      Alışverişe Devam Et
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
