'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Package, Truck, Home, ShoppingCart, ChevronDown, ChevronUp, MapPin, CreditCard, Calendar, User, Phone, Mail } from 'lucide-react'

interface OrderItem {
  id: string
  productId: string
  productName: string
  productPrice: number
  productImage?: string
  quantity: number
  size?: string
  color?: string
  hasEmbroidery?: boolean
  embroideryPrice?: number
  categoryName?: string
  brandName?: string
  isShipping?: boolean
  shippingCost?: number
  // Legacy fields for backward compatibility
  name?: string
  price?: number
}

interface Order {
  id: string
  totalPrice: number
  status: string
  paymentStatus: string
  paymentMethod?: string
  createdAt: string
  items: OrderItem[]
  shippingAddress?: any
  user?: {
    id: string
    name: string
    email: string
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

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

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received':
        return 'Alındı'
      case 'processing':
        return 'Hazırlanıyor'
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

  const getPaymentStatusText = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'pending':
        return 'Ödeme Bekliyor'
      case 'paid':
        return 'Ödendi'
      case 'failed':
        return 'Ödeme Başarısız'
      case 'refunded':
        return 'İade Edildi'
      default:
        return paymentStatus
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <Package className="w-5 h-5 text-blue-600" />
      case 'processing':
        return <Truck className="w-5 h-5 text-yellow-600" />
      case 'shipped':
        return <Truck className="w-5 h-5 text-orange-600" />
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'cancelled':
        return <Package className="w-5 h-5 text-red-600" />
      default:
        return <Package className="w-5 h-5 text-gray-600" />
    }
  }

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'failed':
        return 'text-red-600'
      case 'refunded':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Siparişlerim</h1>
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
            {orders.map((order) => {
              const isExpanded = expandedOrders.has(order.id)
              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  {/* Order Header */}
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => toggleOrderExpansion(order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <div>
                            <CardTitle className="text-lg">
                              Sipariş #{order.id.slice(-8)}
                            </CardTitle>
                            <div className="flex items-center space-x-3 mt-2">
                              {/* Sipariş Statüsü Badge */}
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                order.status === 'received' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'shipped' ? 'bg-orange-100 text-orange-800' :
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1">{getStatusText(order.status)}</span>
                              </div>
                              
                              {/* Ödeme Statüsü Badge */}
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                order.paymentStatus === 'refunded' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                <CheckCircle className="w-3 h-3" />
                                <span className="ml-1">{getPaymentStatusText(order.paymentStatus)}</span>
                              </div>
                              
                              {/* Ödeme Yöntemi */}
                              {order.paymentMethod && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {order.paymentMethod === 'iyzico' ? 'Online Ödeme' : 'Havale/EFT'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            ₺{order.totalPrice.toLocaleString('tr-TR')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Order Details (Collapsible) */}
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Order Items */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            Sipariş Detayları
                          </h3>
                          <div className="space-y-3">
                            {order.items && order.items.length > 0 ? (
                              order.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                  <div className="flex items-center space-x-3 flex-1">
                                    {/* Product Image */}
                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                      {item.isShipping ? (
                                        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                          <Truck className="w-8 h-8 text-white opacity-50" />
                                        </div>
                                      ) : item.productImage ? (
                                        <img 
                                          src={item.productImage} 
                                          alt={item.productName || item.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                          <Package className="w-8 h-8 text-white opacity-50" />
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Product Details */}
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900">
                                        {item.productName || item.name}
                                        {item.isShipping && <span className="text-xs text-orange-600 ml-2">(Kargo)</span>}
                                      </h4>
                                      <div className="text-sm text-gray-600 space-y-1 mt-1">
                                        <p>{item.quantity} adet × ₺{(parseFloat(item.productPrice) || parseFloat(item.price) || 0).toLocaleString('tr-TR')}</p>
                                        {item.categoryName && (
                                          <p className="text-xs text-gray-500">Kategori: {item.categoryName}</p>
                                        )}
                                        {item.brandName && (
                                          <p className="text-xs text-gray-500">Marka: {item.brandName}</p>
                                        )}
                                        {item.size && (
                                          <p className="text-xs text-gray-500">Boyut: {item.size}</p>
                                        )}
                                        {item.color && (
                                          <p className="text-xs text-gray-500">Renk: {item.color}</p>
                                        )}
                                        {item.hasEmbroidery && (
                                          <p className="text-xs text-blue-600">✓ Nakışlı (+₺{(parseFloat(item.embroideryPrice) || 0).toLocaleString('tr-TR')})</p>
                                        )}
                                        {item.isShipping && (
                                          <p className="text-xs text-orange-600">🚚 Kargo Ücreti</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Price */}
                                  <div className="text-right ml-4">
                                    <p className="font-semibold text-gray-900">
                                      ₺{(((parseFloat(item.productPrice) || parseFloat(item.price) || 0) + (parseFloat(item.embroideryPrice) || 0)) * item.quantity).toLocaleString('tr-TR')}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>Sipariş detayları yükleniyor...</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2" />
                            Teslimat Adresi
                          </h3>
                          {order.shippingAddress ? (
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                              <p className="font-medium text-gray-900">
                                {order.shippingAddress.fullName || order.shippingAddress.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {order.shippingAddress.address}
                              </p>
                              <p className="text-sm text-gray-600">
                                {order.shippingAddress.district} / {order.shippingAddress.city}
                              </p>
                              <p className="text-sm text-gray-600">
                                {order.shippingAddress.country}
                              </p>
                              <div className="flex items-center space-x-4 mt-3">
                                {order.shippingAddress.phone && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Phone className="w-4 h-4 mr-1" />
                                    {order.shippingAddress.phone}
                                  </div>
                                )}
                                {order.shippingAddress.email && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Mail className="w-4 h-4 mr-1" />
                                    {order.shippingAddress.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>Teslimat adresi bilgisi bulunamadı</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Sipariş Tarihi: {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              Toplam: ₺{order.totalPrice.toLocaleString('tr-TR')}
                            </p>
                            {order.paymentMethod && (
                              <p className="text-sm text-gray-500">
                                Ödeme: {order.paymentMethod === 'iyzico' ? 'Online Ödeme' : 'Havale/EFT'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}