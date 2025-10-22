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

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
    images: [] as string[],
    sizes: [] as string[]
  })
  const [uploadingImages, setUploadingImages] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchBrands(selectedCategory)
    } else {
      setBrands([])
    }
  }, [selectedCategory])

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

  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true)
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.url
      }
      throw new Error('Upload failed')
    })

    try {
      const uploadedUrls = await Promise.all(uploadPromises)
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))
    } catch (error) {
      setError('Görsel yüklenirken hata oluştu')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const addSize = (size: string) => {
    if (size.trim() && !formData.sizes.includes(size.trim())) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, size.trim()]
      }))
    }
  }

  const removeSize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        brandId: formData.brandId || null
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/admin/products')
      } else {
        setError(data.error || 'Ürün oluşturulurken hata oluştu')
      }
    } catch (error) {
      setError('Sunucu hatası')
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
          <p className="text-gray-600 mt-2">Yeni bir ürün oluşturun</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Ürün Bilgileri</CardTitle>
          <CardDescription>
            Ürününüzün tüm detaylarını girin
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
                <Select onValueChange={handleCategoryChange} required>
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
              <Label>Ürün Görselleri</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="text-gray-600">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2">
                      {uploadingImages ? 'Yükleniyor...' : 'Görselleri yüklemek için tıklayın'}
                    </p>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF (Max 5MB)</p>
                  </div>
                </label>
              </div>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Ürün görseli ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Ürün Boyutları</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Boyut ekle (örn: S, M, L)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSize((e.target as HTMLInputElement).value)
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Boyut ekle (örn: S, M, L)"]') as HTMLInputElement
                    if (input) {
                      addSize(input.value)
                      input.value = ''
                    }
                  }}
                >
                  Ekle
                </Button>
              </div>
              
              {formData.sizes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.sizes.map((size, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
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
