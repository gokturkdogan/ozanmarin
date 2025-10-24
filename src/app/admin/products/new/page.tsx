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

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    slug: '',
    categoryId: '',
    brandId: '',
    description: '',
    descriptionEn: '',
    images: [] as string[],
    sizePrices: [] as { size: string; price: number; stock: number }[],
    colors: [] as { tr: string; en: string }[], // Updated colors interface
    stockType: 'piece' as 'piece' | 'meter', // Stok türü
    hasEmbroidery: false // Nakış özelliği
  })
  const [uploadingImages, setUploadingImages] = useState(false)
  
  const { toast } = useToast()

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
      } else {
        throw new Error('Kategoriler yüklenirken hata oluştu')
      }
    } catch (error: any) {
      console.error('Categories fetch error:', error)
      toast({
        title: "Hata",
        description: error.message || 'Kategoriler yüklenirken hata oluştu',
        variant: "destructive",
      })
    }
  }

  const fetchBrands = async (categorySlug: string) => {
    try {
      const response = await fetch(`/api/brands?category=${categorySlug}`)
      if (response.ok) {
        const data = await response.json()
        setBrands(data.brands)
      } else {
        throw new Error('Markalar yüklenirken hata oluştu')
      }
    } catch (error: any) {
      console.error('Brands fetch error:', error)
      toast({
        title: "Hata",
        description: error.message || 'Markalar yüklenirken hata oluştu',
        variant: "destructive",
      })
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

  const addSizePrice = (size: string, price: number, stock: number) => {
    if (size.trim() && price > 0 && stock >= 0 && !formData.sizePrices.some(sp => sp.size === size.trim())) {
      setFormData(prev => ({
        ...prev,
        sizePrices: [...prev.sizePrices, { size: size.trim(), price, stock }]
      }))
    }
  }

  const removeSizePrice = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sizePrices: prev.sizePrices.filter((_, i) => i !== index)
    }))
  }

  const updateSizePrice = (index: number, field: 'size' | 'price' | 'stock', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      sizePrices: prev.sizePrices.map((sp, i) => 
        i === index ? { ...sp, [field]: value } : sp
      )
    }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const productData = {
        ...formData,
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
        toast({
          title: "Başarılı",
          description: `${formData.name} başarıyla eklendi.`,
          variant: "success",
        })
        router.push('/admin/products')
      } else {
        throw new Error(data.error || 'Ürün oluşturulurken hata oluştu')
      }
    } catch (error: any) {
      setError(error.message || 'Sunucu hatası')
      toast({
        title: "Hata",
        description: error.message || 'Ürün eklenirken hata oluştu',
        variant: "destructive",
      })
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
              <Label>Boyut, Fiyat ve Stok Seçenekleri</Label>
              
              {/* Add Size Price Form */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      placeholder="100.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock-input">Stok</Label>
                    <Input
                      id="stock-input"
                      type="number"
                      min="0"
                      placeholder="50"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const sizeInput = document.getElementById('size-input') as HTMLInputElement
                    const priceInput = document.getElementById('price-input') as HTMLInputElement
                    const stockInput = document.getElementById('stock-input') as HTMLInputElement
                    if (sizeInput.value && priceInput.value && stockInput.value) {
                      addSizePrice(sizeInput.value, parseFloat(priceInput.value), parseInt(stockInput.value))
                      sizeInput.value = ''
                      priceInput.value = ''
                      stockInput.value = ''
                    }
                  }}
                >
                  Boyut Ekle
                </Button>
              </div>

              {/* Size Prices List */}
              {formData.sizePrices.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Eklenen Boyutlar ({formData.sizePrices.length} adet):</Label>
                  <div className="space-y-2">
                    {formData.sizePrices.map((sizePrice, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                        <div className="flex-1">
                          <Label className="text-sm text-gray-600">Boyut:</Label>
                          <Input
                            value={sizePrice.size || ''}
                            onChange={(e) => updateSizePrice(index, 'size', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-sm text-gray-600">Fiyat:</Label>
                          <div className="flex items-center mt-1">
                            <Input
                              type="number"
                              step="0.01"
                              value={sizePrice.price || 0}
                              onChange={(e) => updateSizePrice(index, 'price', parseFloat(e.target.value) || 0)}
                              className="flex-1"
                            />
                            <span className="ml-2 text-sm text-gray-500 font-medium">$</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <Label className="text-sm text-gray-600">Stok:</Label>
                          <Input
                            type="number"
                            min="0"
                            value={sizePrice.stock || 0}
                            onChange={(e) => updateSizePrice(index, 'stock', parseInt(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSizePrice(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-6"
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

            {/* Stok Türü */}
            <div className="space-y-2">
              <Label>Stok Türü</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="stockType-piece"
                    name="stockType"
                    value="piece"
                    checked={formData.stockType === 'piece'}
                    onChange={(e) => setFormData({ ...formData, stockType: e.target.value as 'piece' | 'meter' })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="stockType-piece" className="text-sm">
                    Adet (Piece)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="stockType-meter"
                    name="stockType"
                    value="meter"
                    checked={formData.stockType === 'meter'}
                    onChange={(e) => setFormData({ ...formData, stockType: e.target.value as 'piece' | 'meter' })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="stockType-meter" className="text-sm">
                    Metre (Meter)
                  </Label>
                </div>
              </div>
            </div>

            {/* Nakış Özelliği */}
            <div className="space-y-2">
              <Label>Nakış Özelliği</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasEmbroidery"
                  checked={formData.hasEmbroidery}
                  onChange={(e) => setFormData({ ...formData, hasEmbroidery: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="hasEmbroidery" className="text-sm text-gray-600">
                  Bu ürüne nakış eklenebilir
                </Label>
              </div>
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
