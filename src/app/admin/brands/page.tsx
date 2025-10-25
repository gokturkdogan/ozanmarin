'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlusCircle, Edit, Trash2, Tag, Search, Filter, X } from 'lucide-react'
import { DeleteConfirmationModal } from '@/components/admin/confirmation-modal'
import { useToast } from '@/hooks/use-toast'

interface Brand {
  id: string
  name: string
  slug: string
  description: string | null
  categoryId: string
  createdAt: string
  category: {
    name: string
    slug: string
  }
  _count: {
    products: number
  }
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  
  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [brands, searchTerm, selectedCategory])

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [brandsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/admin/brands'),
        fetch('/api/categories')
      ])

      if (brandsResponse.ok) {
        const brandsData = await brandsResponse.json()
        setBrands(brandsData.brands)
      } else {
        throw new Error('Markalar getirilirken bir hata oluştu.')
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.categories)
      }
    } catch (err: any) {
      setError(err.message || 'Veriler yüklenemedi.')
      toast({
        title: "Hata",
        description: err.message || 'Veriler yüklenemedi.',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...brands]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(brand => brand.category.slug === selectedCategory)
    }

    setFilteredBrands(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
  }

  const handleDeleteClick = (brand: Brand) => {
    setBrandToDelete(brand)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/brands/${brandToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Marka silinemedi')
      }

      toast({
        title: "Başarılı",
        description: `${brandToDelete.name} başarıyla silindi.`,
        variant: "success",
      })
      fetchData() // Refresh the list
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteModalOpen(false)
      setBrandToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setBrandToDelete(null)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Marka Yönetimi</h1>
        <p>Markalar yükleniyor...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Marka Yönetimi</h1>
        <p className="text-red-500">Hata: {error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Marka Yönetimi</h1>
        <Link href="/admin/brands/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Marka Ekle
          </Button>
        </Link>
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Marka adı, kategori veya açıklama ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtreler
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="ml-1">1</Badge>
              )}
            </Button>

            {/* Clear Filters */}
            {(selectedCategory !== 'all' || searchTerm) && (
              <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Temizle
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="max-w-xs">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Kategori</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    {categories.sort((a, b) => a.name.localeCompare(b.name, 'tr')).map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {filteredBrands.length} marka bulundu
          {(searchTerm || selectedCategory !== 'all') && (
            <span className="text-gray-500"> (filtrelenmiş)</span>
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="mr-2 h-5 w-5" />
            Tüm Markalar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBrands.length === 0 ? (
            <p className="text-gray-600">
              {brands.length === 0 
                ? "Henüz hiç marka bulunmuyor. Yeni bir marka ekleyin." 
                : "Filtrelere uygun marka bulunamadı."
              }
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adı</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Ürün Sayısı</TableHead>
                    <TableHead>Oluşturulma Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBrands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{brand.slug}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{brand.category.name}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {brand.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{brand._count.products}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(brand.createdAt).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/brands/${brand.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(brand)}
                            disabled={brand._count.products > 0}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={brandToDelete?.name || ''}
        isLoading={isDeleting}
      />
    </div>
  )
}
