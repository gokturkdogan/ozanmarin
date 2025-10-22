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
  description: string | null
  descriptionEn?: string | null
  categoryId: string
  category: {
    name: string
    slug: string
  }
}

export default function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [brand, setBrand] = useState<Brand | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    descriptionEn: '',
    categoryId: ''
  })

  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = await params
        
        // Fetch brand and categories in parallel
        const [brandResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/brands/${id}`),
          fetch('/api/categories')
        ])

        if (brandResponse.ok) {
          const brandData = await brandResponse.json()
          setBrand(brandData.brand)
          setFormData({
            name: brandData.brand.name,
            slug: brandData.brand.slug,
            description: brandData.brand.description || '',
            descriptionEn: brandData.brand.descriptionEn || '',
            categoryId: brandData.brand.categoryId
          })
        } else {
          setError('Marka bulunamadı')
        }

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.categories)
        }
      } catch (error) {
        setError('Veriler yüklenirken hata oluştu')
      }
    }
    
    fetchData()
  }, [params])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { id } = await params
      const response = await fetch(`/api/admin/brands/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: `${formData.name} markası başarıyla güncellendi.`,
          variant: "success",
        })
        router.push('/admin/brands')
      } else {
        throw new Error(data.error || 'Marka güncellenirken hata oluştu')
      }
    } catch (error: any) {
      setError(error.message || 'Sunucu hatası')
      toast({
        title: "Hata",
        description: error.message || 'Marka güncellenirken hata oluştu',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!brand) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/brands">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marka Düzenle</h1>
            <p className="text-gray-600 mt-2">Marka bilgilerini güncelleyin</p>
          </div>
        </div>
        <p>{error || 'Marka yükleniyor...'}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/brands">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marka Düzenle</h1>
          <p className="text-gray-600 mt-2">"{brand.name}" markasını düzenleyin</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Marka Bilgileri</CardTitle>
          <CardDescription>
            Marka bilgilerini güncelleyin
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
                <Label htmlFor="name">Marka Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Örn: Marin Premium"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="marin-premium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Kategori *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => handleInputChange('categoryId', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Türkçe Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Marka açıklaması..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionEn">English Description</Label>
                <Textarea
                  id="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                  placeholder="Brand description..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
              </Button>
              <Link href="/admin/brands">
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
