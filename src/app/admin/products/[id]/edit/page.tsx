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
import { useToast } from '@/hooks/use-toast'

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
  nameEn?: string
  slug: string
  slugEn?: string
  stock: number
  description: string
  descriptionEn?: string
  images: string[]
  sizePrices: { size: string; price: number }[]
  colors: { tr: string; en: string }[] // Updated colors interface
  category: {
    id: string
    name: string
    nameEn?: string
    slug: string
    slugEn?: string
  }
  brand: {
    id: string
    name: string
    nameEn?: string
    slug: string
    slugEn?: string
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
  const [images, setImages] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    slug: '',
    slugEn: '',
    categoryId: '',
    brandId: '',
    description: '',
    descriptionEn: '',
    stock: '',
    images: '',
    sizePrices: [] as { size: string; price: number }[],
    colors: [] as { tr: string; en: string }[] // Updated colors interface
  })

  const { toast } = useToast()

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
          nameEn: product.nameEn || '',
          slug: product.slug,
          slugEn: product.slugEn || '',
          categoryId: product.category.id,
          brandId: product.brand?.id || '',
          description: product.description || '',
          descriptionEn: product.descriptionEn || '',
          stock: product.stock.toString(),
          images: product.images.join(', '),
          sizePrices: product.sizePrices,
          colors: product.colors // Already in correct format
        })
        
        setImages(product.images)
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
      setImages(prev => [...prev, ...uploadedUrls])
      setFormData(prev => ({
        ...prev,
        images: [...images, ...uploadedUrls].join(', ')
      }))
    } catch (error) {
      console.error('Image upload error:', error)
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    setFormData(prev => ({
      ...prev,
      images: newImages.join(', ')
    }))
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

  const addColor = (trColor: string, enColor: string) => {
    if (trColor.trim() && enColor.trim()) {
      const newColor = { tr: trColor.trim(), en: enColor.trim() }
      const colorExists = formData.colors.some(color => 
        color.tr === newColor.tr || color.en === newColor.en
      )
      
      if (!colorExists) {
        setFormData(prev => ({
          ...prev,
          colors: [...prev.colors, newColor]
        }))
      }
    }
  }

  const removeColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }))
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
      const productData = {
        ...formData,
        stock: parseInt(formData.stock),
        images,
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
        toast({
          title: "Başarılı",
          description: `${formData.name} başarıyla güncellendi.`,
          variant: "success",
        })
        router.push('/admin/products')
      } else {
        throw new Error(data.error || 'Ürün güncellenirken hata oluştu')
      }
    } catch (error: any) {
      setError(error.message || 'Sunucu hatası')
      toast({
        title: "Hata",
        description: error.message || 'Ürün güncellenirken hata oluştu',
        variant: "destructive",
      })
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
                <Label htmlFor="name">Türkçe Ürün Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Örn: Yat Koltuk Kılıfı Premium"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameEn">English Product Name</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => handleInputChange('nameEn', e.target.value)}
                  placeholder="e.g. Yacht Seat Cover Premium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Türkçe URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="yat-koltuk-kilifi-premium"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slugEn">English URL Slug</Label>
                <Input
                  id="slugEn"
                  value={formData.slugEn}
                  onChange={(e) => handleInputChange('slugEn', e.target.value)}
                  placeholder="yacht-seat-cover-premium"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Türkçe Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Ürün açıklaması..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionEn">English Description</Label>
                <Textarea
                  id="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                  placeholder="Product description..."
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Ürün Görselleri</Label>
              
              {/* Image Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                  disabled={uploadingImages}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-600">
                    {uploadingImages ? 'Yükleniyor...' : 'Görsel eklemek için tıklayın'}
                  </div>
                  <div className="text-xs text-gray-500">
                    PNG, JPG, GIF formatları desteklenir
                  </div>
                </label>
              </div>

              {/* Current Images */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Ürün görseli ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label>Boyut ve Fiyat Seçenekleri</Label>
              
              {/* Add Size Price Form */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="size-input">Boyut</Label>
                    <Input
                      id="size-input"
                      placeholder="S, M, L, XL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price-input">Fiyat ($)</Label>
                    <Input
                      id="price-input"
                      type="number"
                      step="0.01"
                      placeholder="1250.00"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const sizeInput = document.getElementById('size-input') as HTMLInputElement
                    const priceInput = document.getElementById('price-input') as HTMLInputElement
                    if (sizeInput.value && priceInput.value) {
                      const newSizePrice = { size: sizeInput.value, price: parseFloat(priceInput.value) }
                      setFormData(prev => ({
                        ...prev,
                        sizePrices: [...prev.sizePrices, newSizePrice]
                      }))
                      sizeInput.value = ''
                      priceInput.value = ''
                    }
                  }}
                >
                  Boyut Ekle
                </Button>
              </div>

              {/* Size Prices List */}
              {formData.sizePrices.length > 0 && (
                <div className="space-y-2">
                  <Label>Eklenen Boyutlar:</Label>
                  <div className="space-y-2">
                    {formData.sizePrices.map((sizePrice, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                        <Input
                          value={sizePrice.size}
                          onChange={(e) => {
                            const newSizePrices = [...formData.sizePrices]
                            newSizePrices[index] = { ...newSizePrices[index], size: e.target.value }
                            setFormData(prev => ({ ...prev, sizePrices: newSizePrices }))
                          }}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={sizePrice.price}
                          onChange={(e) => {
                            const newSizePrices = [...formData.sizePrices]
                            newSizePrices[index] = { ...newSizePrices[index], price: parseFloat(e.target.value) || 0 }
                            setFormData(prev => ({ ...prev, sizePrices: newSizePrices }))
                          }}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-500">$</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newSizePrices = formData.sizePrices.filter((_, i) => i !== index)
                            setFormData(prev => ({ ...prev, sizePrices: newSizePrices }))
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Renk Seçenekleri</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Türkçe Renk (örn: Kırmızı)"
                  id="color-tr"
                />
                <Input
                  placeholder="English Color (e.g. Red)"
                  id="color-en"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const trInput = document.getElementById('color-tr') as HTMLInputElement
                  const enInput = document.getElementById('color-en') as HTMLInputElement
                  if (trInput && enInput) {
                    addColor(trInput.value, enInput.value)
                    trInput.value = ''
                    enInput.value = ''
                  }
                }}
              >
                Renk Ekle
              </Button>
              
              {formData.colors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.colors.map((color, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {color.tr} / {color.en}
                      <button
                        type="button"
                        onClick={() => removeColor(index)}
                        className="ml-2 text-green-600 hover:text-green-800"
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
