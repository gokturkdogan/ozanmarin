'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Package } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  stock: number
  images: string[]
  sizes: string[]
  category: {
    name: string
    slug: string
  }
  brand: {
    name: string
    slug: string
  } | null
  createdAt: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      } else {
        setError('Ürünler yüklenirken hata oluştu')
      }
    } catch (error) {
      setError('Sunucu hatası')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== id))
      } else {
        alert('Ürün silinirken hata oluştu')
      }
    } catch (error) {
      alert('Sunucu hatası')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ürün Yönetimi</h1>
          <p className="text-gray-600 mt-2">Tüm ürünleri görüntüleyin ve yönetin</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni Ürün Ekle
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz ürün yok</h3>
            <p className="text-gray-600 mb-4">İlk ürününüzü ekleyerek başlayın</p>
            <Link href="/admin/products/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ürün Ekle
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {product.category.name}
                      {product.brand && ` • ${product.brand.name}`}
                    </CardDescription>
                  </div>
                  <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                    {product.stock} adet
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">
                      ₺{product.price.toLocaleString('tr-TR')}
                    </span>
                  </div>
                  
                  {product.images.length > 0 && (
                    <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {product.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.sizes.map((size) => (
                        <Badge key={size} variant="outline" className="text-xs">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="w-4 h-4 mr-2" />
                        Düzenle
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
