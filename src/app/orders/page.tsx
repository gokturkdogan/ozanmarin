'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Package, Truck, Home, ShoppingCart } from 'lucide-react'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  totalPrice: number
  status: string
  createdAt: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
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
          <p className="mt-4 text-gray-600">Siparişler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Siparişlerim</h1>
          <p className="text-lg text-gray-600">
            Tüm siparişlerinizi buradan takip edebilirsiniz
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Henüz siparişiniz yok</h2>
            <p className="text-gray-600 mb-8">
              İlk siparişinizi vermek için ürünlerimizi keşfetmeye başlayın.
            </p>
            <Link href="/products">
              <Button size="lg">
                Ürünleri İncele
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>Sipariş #{order.id.slice(-8)}</span>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(order.status)}
                          <span className="text-sm font-normal text-gray-600">
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ₺{order.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 py-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-white opacity-50" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-600">
                            {item.quantity} adet × ₺{item.price.toLocaleString()}
                          </p>
                        </div>
                        <p className="font-medium">
                          ₺{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline">
                        Detayları Görüntüle
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
