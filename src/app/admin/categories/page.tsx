'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { PlusCircle, Edit, Trash2, FolderOpen, Search, X } from 'lucide-react'
import { DeleteConfirmationModal } from '@/components/admin/confirmation-modal'
import { useToast } from '@/hooks/use-toast'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: string
  _count: {
    products: number
    brands: number
  }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [categories, searchTerm])

  const fetchCategories = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) {
        throw new Error('Kategoriler getirilirken bir hata oluştu.')
      }
      const data = await response.json()
      setCategories(data.categories)
    } catch (err: any) {
      setError(err.message || 'Kategoriler yüklenemedi.')
      toast({
        title: "Hata",
        description: err.message || 'Kategoriler yüklenemedi.',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...categories]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredCategories(filtered)
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Kategori silinemedi')
      }

      toast({
        title: "Başarılı",
        description: `${categoryToDelete.name} başarıyla silindi.`,
        variant: "success",
      })
      fetchCategories() // Refresh the list
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteModalOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setCategoryToDelete(null)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Kategori Yönetimi</h1>
        <p>Kategoriler yükleniyor...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Kategori Yönetimi</h1>
        <p className="text-red-500">Hata: {error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kategori Yönetimi</h1>
        <Link href="/admin/categories/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Kategori Ekle
          </Button>
        </Link>
      </div>

      {/* Search Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Kategori adı, slug veya açıklama ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Clear Search */}
            {searchTerm && (
              <Button variant="outline" onClick={clearSearch} className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Temizle
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {filteredCategories.length} kategori bulundu
          {searchTerm && (
            <span className="text-gray-500"> (filtrelenmiş)</span>
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FolderOpen className="mr-2 h-5 w-5" />
            Tüm Kategoriler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <p className="text-gray-600">
              {categories.length === 0 
                ? "Henüz hiç kategori bulunmuyor. Yeni bir kategori ekleyin." 
                : "Arama kriterlerine uygun kategori bulunamadı."
              }
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adı</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Ürün Sayısı</TableHead>
                    <TableHead>Marka Sayısı</TableHead>
                    <TableHead>Oluşturulma Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.slug}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {category.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category._count.products}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category._count.brands}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(category.createdAt).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/categories/${category.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(category)}
                            disabled={category._count.products > 0 || category._count.brands > 0}
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
        itemName={categoryToDelete?.name || ''}
        isLoading={isDeleting}
      />
    </div>
  )
}
