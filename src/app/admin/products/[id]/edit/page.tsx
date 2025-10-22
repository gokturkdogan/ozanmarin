'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
}

interface Brand {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  stock: number
  description: string
  images: string[]
  sizes: string[]
  category: {
    id: string
    name: string
    slug: string
  }
  brand: {
    id: string
    name: string
    slug: string
  } | null
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [productId, setProductId] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: '',
    brandId: '',
    price: '',
    description: '',
    stock: '',
    images: '',
    sizes: ''
  })

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setProductId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchCategories()
    }
  }, [productId])

  useEffect(() => {
    if (selectedCategory) {
      fetchBrands(selectedCategory)
    } else {
      setBrands([])
    }
  }, [selectedCategory])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`)
      if (response.ok) {
        const data = await response.json()
        const product: Product = data.product
        
        setFormData({
          name: product.name,
          slug: product.slug,
          categoryId: product.category.id,
          brandId: product.brand?.id || '',
          price: product.price.toString(),
          description: product.description || '',
          stock: product.stock.toString(),
          images: product.images.join(', '),
          sizes: product.sizes.join(', ')
        })
        
        setSelectedCategory(product.category.slug)
      } else {
        setError('Ürün bulunamadı')
      }
    } catch (error) {
      setError('Sunucu hatası')
    } finally {
      setFetching(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Categories fetch error:', error)
    }
  }

  const fetchBrands = async (categorySlug: string) => {
    try {
      const response = await fetch(`/api/brands?category=${categorySlug}`)
      if (response.ok) {
        const data = await response.json()
        setBrands(data.brands)
      }
    } catch (error) {
      console.error('Brands fetch error:', error)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-generate slug from name
    if (field === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }
  }

  const handleCategoryChange = (categorySlug: string) => {
    const category = categories.find(c => c.slug === categorySlug)
    setSelectedCategory(categorySlug)
    setFormData(prev => ({
      ...prev,
      categoryId: category?.id || '',
      brandId: '' // Reset brand when category changes
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Parse arrays from strings
      const images = formData.images.split(',').map(img => img.trim()).filter(img => img)
      const sizes = formData.sizes.split(',').map(size => size.trim()).filter(size => size)

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images,
        sizes,
        brandId: formData.brandId || null
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/admin/products')
      } else {
        setError(data.error || 'Ürün güncellenirken hata oluştu')
      }
    } catch (error) {
      setError('Sunucu hatası')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
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
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ürün Düzenle</h1>
          <p className="text-gray-600 mt-2">Ürün bilgilerini güncelleyin</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Ürün Bilgileri</CardTitle>
          <CardDescription>
            Ürününüzün tüm detaylarını güncelleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ürün Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Örn: Yat Koltuk Kılıfı Premium"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="yat-koltuk-kilifi-premium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <Select onValueChange={handleCategoryChange} value={selectedCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Marka</Label>
                <Select 
                  onValueChange={(value) => handleInputChange('brandId', value)}
                  value={formData.brandId}
                  disabled={!selectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Marka seçin (opsiyonel)" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Fiyat (₺) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="1250.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stok Miktarı *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  placeholder="15"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Ürün açıklaması..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Resim URL'leri</Label>
              <Input
                id="images"
                value={formData.images}
                onChange={(e) => handleInputChange('images', e.target.value)}
                placeholder="/images/urun1.jpg, /images/urun2.jpg"
              />
              <p className="text-sm text-gray-500">
                Virgülle ayırarak birden fazla resim URL'si ekleyebilirsiniz
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sizes">Boyutlar</Label>
              <Input
                id="sizes"
                value={formData.sizes}
                onChange={(e) => handleInputChange('sizes', e.target.value)}
                placeholder="S, M, L, XL"
              />
              <p className="text-sm text-gray-500">
                Virgülle ayırarak boyutları ekleyebilirsiniz
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
              </Button>
              <Link href="/admin/products">
                <Button type="button" variant="outline">
                  İptal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
