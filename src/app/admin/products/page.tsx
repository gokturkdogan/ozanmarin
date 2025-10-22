'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Package, Search, Filter, X } from 'lucide-react'
import { DeleteConfirmationModal } from '@/components/admin/confirmation-modal'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  slug: string
  stock: number
  images: string[]
  sizePrices: { size: string; price: number }[]
  colors: { tr: string; en: string }[] // Updated colors interface
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

interface Category {
  id: string
  name: string
  slug: string
}

interface Brand {
  id: string
  name: string
  slug: string
  categoryId: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  
  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [products, searchTerm, selectedCategory, selectedBrand])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsResponse, categoriesResponse, brandsResponse] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/brands')
      ])

      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData.products)
      } else {
        throw new Error('Ürünler yüklenirken hata oluştu')
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.categories)
      }

      if (brandsResponse.ok) {
        const brandsData = await brandsResponse.json()
        setBrands(brandsData.brands)
      }
    } catch (error: any) {
      setError(error.message || 'Veriler yüklenirken hata oluştu')
      toast({
        title: "Hata",
        description: error.message || 'Veriler yüklenirken hata oluştu',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...products]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brand && product.brand.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category.slug === selectedCategory)
    }

    // Brand filter
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(product => product.brand?.slug === selectedBrand)
    }

    setFilteredProducts(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedBrand('all')
  }

  const getFilteredBrands = () => {
    if (selectedCategory === 'all') {
      return brands
    }
    return brands.filter(brand => brand.categoryId === categories.find(c => c.slug === selectedCategory)?.id)
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productToDelete.id))
        toast({
          title: "Başarılı",
          description: `${productToDelete.name} başarıyla silindi.`,
          variant: "success",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ürün silinirken hata oluştu')
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || 'Ürün silinirken hata oluştu',
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteModalOpen(false)
      setProductToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setProductToDelete(null)
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

      {/* Search and Filter Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Ürün adı, kategori veya marka ara..."
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
              {(selectedCategory !== 'all' || selectedBrand !== 'all') && (
                <Badge variant="secondary" className="ml-1">
                  {(selectedCategory !== 'all' ? 1 : 0) + (selectedBrand !== 'all' ? 1 : 0)}
                </Badge>
              )}
            </Button>

            {/* Clear Filters */}
            {(selectedCategory !== 'all' || selectedBrand !== 'all' || searchTerm) && (
              <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Temizle
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Kategori</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Marka</label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Marka seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Markalar</SelectItem>
                    {getFilteredBrands().map((brand) => (
                      <SelectItem key={brand.id} value={brand.slug}>
                        {brand.name}
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
          {filteredProducts.length} ürün bulundu
          {(searchTerm || selectedCategory !== 'all' || selectedBrand !== 'all') && (
            <span className="text-gray-500"> (filtrelenmiş)</span>
          )}
        </p>
      </div>

      {filteredProducts.length === 0 ? (
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
          {filteredProducts.map((product) => (
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
                      {product.sizePrices.length > 0 ? (
                        product.sizePrices.length === 1 ? (
                          `$${product.sizePrices[0].price.toLocaleString('en-US')}`
                        ) : (
                          `$${Math.min(...product.sizePrices.map(sp => sp.price)).toLocaleString('en-US')} - $${Math.max(...product.sizePrices.map(sp => sp.price)).toLocaleString('en-US')}`
                        )
                      ) : (
                        'Fiyat Yok'
                      )}
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

                  {product.sizePrices.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.sizePrices.map((sizePrice) => (
                        <Badge key={sizePrice.size} variant="outline" className="text-xs">
                          {sizePrice.size} - ${sizePrice.price.toLocaleString('en-US')}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {product.colors.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.colors.map((color, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                          {color.tr} / {color.en}
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
                      onClick={() => handleDeleteClick(product)}
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
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={productToDelete?.name || ''}
        isLoading={isDeleting}
      />
    </div>
  )
}
