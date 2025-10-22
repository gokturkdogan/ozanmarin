'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// AdminLayout is now handled by the layout.tsx file
import { Package, Tag, ShoppingCart, Users, TrendingUp, DollarSign } from 'lucide-react'

interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalBrands: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const [productsRes, categoriesRes, brandsRes, ordersRes, usersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/brands'),
        fetch('/api/orders'),
        fetch('/api/admin/users')
      ])

      const [productsData, categoriesData, brandsData, ordersData, usersData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        brandsRes.json(),
        ordersRes.json(),
        usersRes.json()
      ])

      const totalRevenue = ordersData.orders?.reduce((sum: number, order: any) => 
        sum + parseFloat(order.totalPrice), 0) || 0

      setStats({
        totalProducts: productsData.products?.length || 0,
        totalCategories: categoriesData.categories?.length || 0,
        totalBrands: brandsData.brands?.length || 0,
        totalOrders: ordersData.orders?.length || 0,
        totalUsers: usersData.users?.length || 0,
        totalRevenue
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Toplam Ürün',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Kategoriler',
      value: stats.totalCategories,
      icon: Tag,
      color: 'text-green-600'
    },
    {
      title: 'Markalar',
      value: stats.totalBrands,
      icon: Tag,
      color: 'text-purple-600'
    },
    {
      title: 'Siparişler',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-orange-600'
    },
    {
      title: 'Kullanıcılar',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-indigo-600'
    },
    {
      title: 'Toplam Gelir',
      value: `₺${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600'
    }
  ]

  return (
    <div className="container mx-auto px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Ozan Marin Admin Paneli</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Hızlı İşlemler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="/admin/products/new"
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-sm font-medium">Yeni Ürün</div>
                </a>
                <a
                  href="/admin/categories/new"
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <Tag className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-sm font-medium">Yeni Kategori</div>
                </a>
                <a
                  href="/admin/brands/new"
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <Tag className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-sm font-medium">Yeni Marka</div>
                </a>
                <a
                  href="/admin/orders"
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-sm font-medium">Siparişleri Gör</div>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Son Aktiviteler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Admin paneli başarıyla kuruldu ve çalışıyor.
                </div>
                <div className="text-sm text-gray-600">
                  Sistem istatistikleri yükleniyor...
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
