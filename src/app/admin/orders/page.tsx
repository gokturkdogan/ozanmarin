'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Search, Filter, Eye, Edit, Calendar, User, CreditCard, Package, Truck, Home, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'

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
}

interface Order {
  id: string
  userId?: string
  totalPrice: number
  status: string
  paymentStatus: string
  paymentMethod?: string
  iyzicoPaymentId?: string
  shippingAddress: any
  shippingCompany?: string
  trackingNumber?: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    email: string
  }
  items: OrderItem[]
}

const statusOptions = [
  { value: 'all', label: 'Tüm Durumlar' },
  { value: 'received', label: 'Alındı' },
  { value: 'processing', label: 'Hazırlanıyor' },
  { value: 'shipped', label: 'Kargoya Verildi' },
  { value: 'delivered', label: 'Teslim Edildi' },
  { value: 'cancelled', label: 'İptal Edildi' }
]

const paymentStatusOptions = [
  { value: 'all', label: 'Tüm Ödeme Durumları' },
  { value: 'pending', label: 'Bekliyor' },
  { value: 'paid', label: 'Ödendi' },
  { value: 'failed', label: 'Başarısız' },
  { value: 'refunded', label: 'İade Edildi' }
]

const shippingCompanyOptions = [
  { value: 'none', label: 'Kargo Şirketi Seçin' },
  { value: 'ups', label: 'UPS' },
  { value: 'yurtici', label: 'Yurtiçi Kargo' }
]

const statusColors = {
  received: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const paymentStatusColors = {
  pending: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800'
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter, paymentStatusFilter])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        toast({
          title: "Hata",
          description: "Siparişler yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({
        title: "Hata",
        description: "Siparişler yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.productName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Payment status filter
    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === paymentStatusFilter)
    }

    setFilteredOrders(filtered)
  }

  const updateOrderStatus = async (orderId: string, newStatus: string, field: 'status' | 'paymentStatus') => {
    try {
      setUpdatingStatus(orderId)
      const response = await fetch('/api/admin/orders/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          [field]: newStatus
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update local state
          setOrders(prev => prev.map(order => 
            order.id === orderId ? { ...order, [field]: newStatus } : order
          ))
          toast({
            title: "Başarılı",
            description: `${field === 'status' ? 'Sipariş' : 'Ödeme'} durumu güncellendi.`,
          })
        } else {
          toast({
            title: "Hata",
            description: data.error || "Durum güncellenirken bir hata oluştu.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Hata",
          description: "Durum güncellenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast({
        title: "Hata",
        description: "Durum güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const updateShippingInfo = async (orderId: string, shippingCompany: string, trackingNumber: string) => {
    try {
      setUpdatingStatus(orderId)
      const response = await fetch('/api/admin/orders/update-shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          shippingCompany,
          trackingNumber
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update local state
          setOrders(prev => prev.map(order => 
            order.id === orderId ? { 
              ...order, 
              shippingCompany, 
              trackingNumber 
            } : order
          ))
          toast({
            title: "Başarılı",
            description: "Kargo bilgileri güncellendi.",
          })
        } else {
          toast({
            title: "Hata",
            description: data.error || "Kargo bilgileri güncellenirken bir hata oluştu.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Hata",
          description: "Kargo bilgileri güncellenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating shipping info:', error)
      toast({
        title: "Hata",
        description: "Kargo bilgileri güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received': return <Package className="w-4 h-4" />
      case 'processing': return <RefreshCw className="w-4 h-4" />
      case 'shipped': return <Truck className="w-4 h-4" />
      case 'delivered': return <Home className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'paid': return <CheckCircle className="w-4 h-4" />
      case 'failed': return <XCircle className="w-4 h-4" />
      case 'refunded': return <RefreshCw className="w-4 h-4" />
      default: return <CreditCard className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sipariş Yönetimi</h1>
          <p className="text-gray-600 mt-2">Tüm siparişleri görüntüleyin ve yönetin</p>
        </div>
        <Button onClick={fetchOrders} variant="outline" className="cursor-pointer">
          <RefreshCw className="w-4 h-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Arama</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Sipariş ID, müşteri, ürün..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Sipariş Durumu</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Ödeme Durumu</label>
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Ödeme durumu seçin" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setPaymentStatusFilter('all')
                }}
                className="w-full cursor-pointer"
              >
                Filtreleri Temizle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sipariş Bulunamadı</h3>
              <p className="text-gray-600">
                {orders.length === 0 
                  ? "Henüz hiç sipariş bulunmuyor."
                  : "Arama kriterlerinize uygun sipariş bulunamadı."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Sipariş #{order.id.slice(-8)}
                      </h3>
                      <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{statusOptions.find(s => s.value === order.status)?.label}</span>
                      </Badge>
                      <Badge className={paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors]}>
                        {getPaymentStatusIcon(order.paymentStatus)}
                        <span className="ml-1">{paymentStatusOptions.find(s => s.value === order.paymentStatus)?.label}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span>
                          {order.user ? `${order.user.name} (${order.user.email})` : 'Misafir Müşteri'}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span>
                          {order.paymentMethod === 'iyzico' ? 'Online Ödeme' : 
                           order.paymentMethod === 'bank_transfer' ? 'Havale/EFT' : 
                           'Belirtilmemiş'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-lg font-bold text-primary">
                        ₺{order.totalPrice.toLocaleString('tr-TR')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} ürün, {order.items.reduce((sum, item) => sum + item.quantity, 0)} adet
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order)
                        setShowDetails(true)
                      }}
                      className="cursor-pointer"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detaylar
                    </Button>
                    
                    <div className="flex flex-col space-y-2">
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value, 'status')}
                        disabled={updatingStatus === order.id}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.filter(option => option.value !== 'all').map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={order.paymentStatus}
                        onValueChange={(value) => updateOrderStatus(order.id, value, 'paymentStatus')}
                        disabled={updatingStatus === order.id}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentStatusOptions.filter(option => option.value !== 'all').map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Sipariş Detayları #{selectedOrder.id.slice(-8)}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                  className="cursor-pointer"
                >
                  Kapat
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Info */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sipariş Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sipariş ID:</span>
                        <span className="font-medium">{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tarih:</span>
                        <span className="font-medium">
                          {new Date(selectedOrder.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Durum:</span>
                        <Badge className={statusColors[selectedOrder.status as keyof typeof statusColors]}>
                          {getStatusIcon(selectedOrder.status)}
                          <span className="ml-1">{statusOptions.find(s => s.value === selectedOrder.status)?.label}</span>
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ödeme Durumu:</span>
                        <Badge className={paymentStatusColors[selectedOrder.paymentStatus as keyof typeof paymentStatusColors]}>
                          {getPaymentStatusIcon(selectedOrder.paymentStatus)}
                          <span className="ml-1">{paymentStatusOptions.find(s => s.value === selectedOrder.paymentStatus)?.label}</span>
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ödeme Yöntemi:</span>
                        <span className="font-medium">
                          {selectedOrder.paymentMethod === 'iyzico' ? 'Online Ödeme' : 
                           selectedOrder.paymentMethod === 'bank_transfer' ? 'Havale/EFT' : 
                           'Belirtilmemiş'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Toplam Tutar:</span>
                        <span className="font-bold text-lg text-primary">
                          ₺{selectedOrder.totalPrice.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Customer Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Müşteri Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedOrder.user ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ad Soyad:</span>
                            <span className="font-medium">{selectedOrder.user.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">E-posta:</span>
                            <span className="font-medium">{selectedOrder.user.email}</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          Misafir Müşteri
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* Shipping Address */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Teslimat Adresi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedOrder.shippingAddress ? (
                        <div className="space-y-2">
                          <p><strong>Ad Soyad:</strong> {selectedOrder.shippingAddress.fullName}</p>
                          <p><strong>Telefon:</strong> {selectedOrder.shippingAddress.phone}</p>
                          <p><strong>Ülke:</strong> {selectedOrder.shippingAddress.country}</p>
                          <p><strong>Şehir:</strong> {selectedOrder.shippingAddress.city}</p>
                          <p><strong>İlçe:</strong> {selectedOrder.shippingAddress.district}</p>
                          <p><strong>Adres:</strong> {selectedOrder.shippingAddress.address}</p>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          Adres bilgisi bulunamadı
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Shipping Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Kargo Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Kargo Şirketi</label>
                          <Select
                            value={selectedOrder.shippingCompany || 'none'}
                            onValueChange={(value) => {
                              const newOrder = { ...selectedOrder, shippingCompany: value === 'none' ? null : value }
                              setSelectedOrder(newOrder)
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Kargo şirketi seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {shippingCompanyOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Takip Numarası</label>
                          <Input
                            placeholder="Kargo takip numarası"
                            value={selectedOrder.trackingNumber || ''}
                            onChange={(e) => {
                              const newOrder = { ...selectedOrder, trackingNumber: e.target.value }
                              setSelectedOrder(newOrder)
                            }}
                          />
                        </div>
                        
                        <Button
                          onClick={() => updateShippingInfo(
                            selectedOrder.id, 
                            selectedOrder.shippingCompany || '', 
                            selectedOrder.trackingNumber || ''
                          )}
                          disabled={updatingStatus === selectedOrder.id}
                          className="w-full cursor-pointer"
                        >
                          {updatingStatus === selectedOrder.id ? 'Güncelleniyor...' : 'Kargo Bilgilerini Güncelle'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Order Items */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Sipariş Ürünleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        {item.productImage && !item.isShipping ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                            {item.isShipping ? (
                              <Truck className="w-8 h-8 text-orange-500" />
                            ) : (
                              <Package className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.productName}
                            {item.isShipping && <span className="text-xs text-orange-600 ml-2">(Kargo)</span>}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1 mt-1">
                            <p>{item.quantity} adet × ₺{(parseFloat(item.productPrice.toString()) || 0).toLocaleString('tr-TR')}</p>
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
                              <p className="text-xs text-blue-600">✓ Nakışlı (+₺{(parseFloat(item.embroideryPrice?.toString() || '0')).toLocaleString('tr-TR')})</p>
                            )}
                            {item.isShipping && (
                              <p className="text-xs text-orange-600">🚚 Kargo Ücreti</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₺{(((parseFloat(item.productPrice.toString()) || 0) + (parseFloat(item.embroideryPrice?.toString() || '0'))) * item.quantity).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
