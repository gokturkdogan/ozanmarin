'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Package, Truck, Home, ShoppingCart, ChevronDown, ChevronUp, MapPin, CreditCard, Calendar, User, Phone, Mail, Copy, Check } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import { formatPrice } from '@/lib/exchangeRate'

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
  language?: string
  items: OrderItem[]
  shippingAddress?: any
  shippingCompany?: string
  trackingNumber?: string
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
  const [copiedIban, setCopiedIban] = useState<string | null>(null)

  const { language, t } = useLanguage()

  // Dil bazlı içerik
  const content = {
    tr: {
      loading: "Siparişler yükleniyor...",
      pageTitle: "Siparişlerim",
      pageDesc: "Tüm siparişlerinizi buradan takip edebilirsiniz",
      noOrders: "Henüz siparişiniz yok",
      noOrdersDesc: "İlk siparişinizi vermek için ürünlerimizi keşfetmeye başlayın.",
      viewProducts: "Ürünleri İncele",
      orderNumber: "Sipariş #",
      received: "Alındı",
      processing: "Hazırlanıyor",
      shipped: "Kargoya Verildi",
      delivered: "Teslim Edildi",
      cancelled: "İptal Edildi",
      paymentPending: "Ödeme Bekliyor",
      paymentPaid: "Ödendi",
      paymentFailed: "Ödeme Başarısız",
      paymentRefunded: "İade Edildi",
      onlinePayment: "Online Ödeme",
      bankTransfer: "Havale/EFT",
      orderDetails: "Sipariş Detayları",
      shippingAddress: "Teslimat Adresi",
      shippingInfo: "Kargo Bilgileri",
      shippingCompany: "Kargo Şirketi:",
      trackingNumber: "Takip Numarası:",
      trackPackage: "Kargom Nerede? - Yurtiçi Kargo'da Takip Et",
      orderDate: "Sipariş Tarihi:",
      total: "Toplam:",
      payment: "Ödeme:",
      items: "adet",
      category: "Kategori:",
      brand: "Marka:",
      size: "Boyut:",
      color: "Renk:",
      embroidery: "✓ Nakışlı",
      shippingCost: "🚚 Kargo Ücreti",
      shipping: "(Kargo)",
      loadingDetails: "Sipariş detayları yükleniyor...",
      addressNotFound: "Teslimat adresi bilgisi bulunamadı",
      paymentPending: "Ödeme Bekliyor",
      paymentPendingDesc: "Halen ödeme yapmadıysanız, aşağıdaki hesap bilgilerine ödemenizi yapabilirsiniz:",
      bankTransferInfo: "Banka Havalesi Bilgileri",
      bank: "Banka:",
      accountName: "Hesap Adı:",
      tryAccount: "Türk Lirası Hesabı:",
      usdAccount: "Dolar Hesabı:",
      copyButton: "Kopyala",
      copiedText: "Kopyalandı!",
      bankNote: "Ödeme yaptıktan sonra dekontu WhatsApp'tan gönderebilirsiniz."
    },
    en: {
      loading: "Loading orders...",
      pageTitle: "My Orders",
      pageDesc: "Track all your orders from here",
      noOrders: "No orders yet",
      noOrdersDesc: "Start exploring our products to place your first order.",
      viewProducts: "View Products",
      orderNumber: "Order #",
      received: "Received",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      paymentPending: "Payment Pending",
      paymentPaid: "Paid",
      paymentFailed: "Payment Failed",
      paymentRefunded: "Refunded",
      onlinePayment: "Online Payment",
      bankTransfer: "Bank Transfer",
      orderDetails: "Order Details",
      shippingAddress: "Shipping Address",
      shippingInfo: "Shipping Information",
      shippingCompany: "Shipping Company:",
      trackingNumber: "Tracking Number:",
      trackPackage: "Track Package - Yurtiçi Cargo",
      orderDate: "Order Date:",
      total: "Total:",
      payment: "Payment:",
      items: "items",
      category: "Category:",
      brand: "Brand:",
      size: "Size:",
      color: "Color:",
      embroidery: "✓ Embroidered",
      shippingCost: "🚚 Shipping Cost",
      shipping: "(Shipping)",
      loadingDetails: "Loading order details...",
      addressNotFound: "Shipping address information not found",
      paymentPending: "Payment Pending",
      paymentPendingDesc: "If you haven't made the payment yet, you can make your payment to the following account details:",
      bankTransferInfo: "Bank Transfer Information",
      bank: "Bank:",
      accountName: "Account Name:",
      tryAccount: "Turkish Lira Account:",
      usdAccount: "US Dollar Account:",
      copyButton: "Copy",
      copiedText: "Copied!",
      bankNote: "You can send the receipt via WhatsApp after payment."
    }
  }

  const t_content = content[language]

  useEffect(() => {
    console.log('OrdersPage useEffect triggered')
    fetchOrders()
  }, [])

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const fetchOrders = async () => {
    console.log('fetchOrders function called')
    try {
      console.log('Starting fetch to /api/orders')
      const response = await fetch('/api/orders')
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Orders data:', data)
      setOrders(data.orders || [])
      console.log('Orders set successfully')
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      console.log('Setting isLoading to false')
      setIsLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received':
        return t_content.received
      case 'processing':
        return t_content.processing
      case 'shipped':
        return t_content.shipped
      case 'delivered':
        return t_content.delivered
      case 'cancelled':
        return t_content.cancelled
      default:
        return status
    }
  }

  const getPaymentStatusText = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'pending':
        return t_content.paymentPending
      case 'paid':
        return t_content.paymentPaid
      case 'failed':
        return t_content.paymentFailed
      case 'refunded':
        return t_content.paymentRefunded
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

  // IBAN kopyalama fonksiyonu
  const handleCopyIban = async (iban: string) => {
    try {
      await navigator.clipboard.writeText(iban)
      setCopiedIban(iban)
      setTimeout(() => setCopiedIban(null), 2000) // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy IBAN:', error)
    }
  }

  // OrderItem'ları toplayarak sipariş toplamını hesapla
  const calculateOrderTotal = (order: Order) => {
    if (!order.items || order.items.length === 0) {
      return order.totalPrice // Fallback olarak totalPrice kullan
    }
    
    return order.items.reduce((total, item) => {
      const itemPrice = parseFloat(item.productPrice) || parseFloat(item.price) || 0
      const embroideryPrice = parseFloat(item.embroideryPrice) || 0
      const itemTotal = (itemPrice + embroideryPrice) * item.quantity
      return total + itemTotal
    }, 0)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">{t_content.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t_content.pageTitle}</h1>
          <p className="text-lg text-gray-600">
            {t_content.pageDesc}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t_content.noOrders}</h2>
            <p className="text-gray-600 mb-8">
              {t_content.noOrdersDesc}
            </p>
            <Link href="/products">
              <Button size="lg">
                {t_content.viewProducts}
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
                              {t_content.orderNumber}{order.id.slice(-8)}
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
                                  {order.paymentMethod === 'iyzico' ? t_content.onlinePayment : t_content.bankTransfer}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {order.language === 'en' 
                              ? `$${calculateOrderTotal(order).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : `₺${order.totalPrice.toLocaleString('tr-TR')}`
                            }
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString(order.language === 'en' ? 'en-US' : 'tr-TR')}
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
                                        {item.isShipping && <span className="text-xs text-orange-600 ml-2">{t_content.shipping}</span>}
                                      </h4>
                                      <div className="text-sm text-gray-600 space-y-1 mt-1">
                                        <p>{item.quantity} {t_content.items} × {formatPrice(parseFloat(item.productPrice) || parseFloat(item.price) || 0, order.language || language)}</p>
                                        {item.categoryName && (
                                          <p className="text-xs text-gray-500">{t_content.category} {item.categoryName}</p>
                                        )}
                                        {item.brandName && (
                                          <p className="text-xs text-gray-500">{t_content.brand} {item.brandName}</p>
                                        )}
                                        {item.size && (
                                          <p className="text-xs text-gray-500">{t_content.size} {item.size}</p>
                                        )}
                                        {item.color && (
                                          <p className="text-xs text-gray-500">{t_content.color} {item.color}</p>
                                        )}
                                        {item.hasEmbroidery && (
                                          <p className="text-xs text-blue-600">{t_content.embroidery} (+{formatPrice(parseFloat(item.embroideryPrice) || 0, order.language || language)})</p>
                                        )}
                                        {item.isShipping && (
                                          <p className="text-xs text-orange-600">{t_content.shippingCost}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Price */}
                                  <div className="text-right ml-4">
                                    <p className="font-semibold text-gray-900">
                                      {formatPrice(((parseFloat(item.productPrice) || parseFloat(item.price) || 0) + (parseFloat(item.embroideryPrice) || 0)) * item.quantity, order.language || language)}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>{t_content.loadingDetails}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2" />
                            {t_content.shippingAddress}
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
                              <p>{t_content.addressNotFound}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Shipping Info */}
                        {(order.shippingCompany || order.trackingNumber) && (
                          <div className="mt-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                              <Truck className="w-5 h-5 mr-2" />
                              {t_content.shippingInfo}
                            </h3>
                            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                              {order.shippingCompany && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">{t_content.shippingCompany}</span>
                                  <span className="text-sm text-gray-900">
                                    {order.shippingCompany === 'ups' ? 'UPS' : 
                                     order.shippingCompany === 'yurtici' ? 'Yurtiçi Kargo' : 
                                     order.shippingCompany}
                                  </span>
                                </div>
                              )}
                              {order.trackingNumber && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">{t_content.trackingNumber}</span>
                                  <span className="text-sm text-gray-900 font-mono">{order.trackingNumber}</span>
                                </div>
                              )}
                              
                              {/* Kargo Takip Linki */}
                              {order.trackingNumber && order.shippingCompany === 'yurtici' && (
                                <div className="mt-4 pt-3 border-t border-blue-200">
                                  <a
                                    href={`https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${order.trackingNumber}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                  >
                                    <Truck className="w-4 h-4 mr-2" />
                                    {t_content.trackPackage}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Order Summary */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{t_content.orderDate} {new Date(order.createdAt).toLocaleDateString(order.language === 'en' ? 'en-US' : 'tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {t_content.total} {order.language === 'en' 
                                ? `$${calculateOrderTotal(order).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : `₺${order.totalPrice.toLocaleString('tr-TR')}`
                              }
                            </p>
                            {order.paymentMethod && (
                              <p className="text-sm text-gray-500">
                                {t_content.payment} {order.paymentMethod === 'iyzico' ? t_content.onlinePayment : t_content.bankTransfer}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bank Transfer Information for Pending Payments */}
                      {order.paymentMethod === 'bank_transfer' && order.paymentStatus === 'pending' && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="font-medium text-yellow-900 mb-2 flex items-center">
                              <CreditCard className="w-5 h-5 mr-2" />
                              {t_content.paymentPending}
                            </h3>
                            <p className="text-sm text-yellow-800 mb-4">
                              {t_content.paymentPendingDesc}
                            </p>
                            
                            <div className="bg-white rounded-lg p-4 space-y-3">
                              <h4 className="font-medium text-gray-900">{t_content.bankTransferInfo}</h4>
                              
                              <div className="text-sm text-gray-800 space-y-2">
                                <p><strong>{t_content.bank}</strong> Ziraat Bankası</p>
                                <p><strong>{t_content.accountName}</strong> Abdulkadir Ozan</p>
                                
                                <div className="space-y-2">
                                  <div className="p-3 bg-gray-50 rounded border">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="font-medium text-gray-900">{t_content.tryAccount}</p>
                                      <button
                                        onClick={() => handleCopyIban('TR24 0001 0025 7668 8660 7650 05')}
                                        className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                      >
                                        {copiedIban === 'TR24 0001 0025 7668 8660 7650 05' ? (
                                          <>
                                            <Check className="w-3 h-3" />
                                            <span>{t_content.copiedText}</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3" />
                                            <span>{t_content.copyButton}</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <p className="font-mono text-sm">TR24 0001 0025 7668 8660 7650 05</p>
                                  </div>
                                  
                                  <div className="p-3 bg-gray-50 rounded border">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="font-medium text-gray-900">{t_content.usdAccount}</p>
                                      <button
                                        onClick={() => handleCopyIban('TR94 0001 0025 7668 8660 7650 06')}
                                        className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                      >
                                        {copiedIban === 'TR94 0001 0025 7668 8660 7650 06' ? (
                                          <>
                                            <Check className="w-3 h-3" />
                                            <span>{t_content.copiedText}</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3" />
                                            <span>{t_content.copyButton}</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <p className="font-mono text-sm">TR94 0001 0025 7668 8660 7650 06</p>
                                  </div>
                                </div>
                                
                                <p className="text-xs text-gray-600 mt-2">
                                  {t_content.bankNote}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
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