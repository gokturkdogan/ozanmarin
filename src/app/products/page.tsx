'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCartStore } from '@/lib/cart'
import { ShoppingCart, Search } from 'lucide-react'
import { getUSDExchangeRate, convertUSDToTRY, formatTRYPrice } from '@/lib/exchangeRate'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  images: string[]
  stock: number
  sizePrices: { size: string; price: number }[]
  colors: string[]
  category: {
    name: string
    slug: string
  }
  brand?: {
    name: string
    slug: string
  }
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
  category: {
    name: string
    slug: string
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [exchangeRate, setExchangeRate] = useState<number>(34.50) // Default fallback rate
  const { addItem } = useCartStore()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    loadExchangeRate()
  }, [selectedCategory, selectedBrand])

  // Dolar kurunu yükle
  const loadExchangeRate = async () => {
    try {
      const rate = await getUSDExchangeRate()
      setExchangeRate(rate)
    } catch (error) {
      console.error('Exchange rate loading failed:', error)
      // Fallback rate zaten state'te var
    }
  }

  useEffect(() => {
    if (selectedCategory !== 'all') {
      fetchBrands()
    } else {
      setBrands([])
      setSelectedBrand('all')
    }
  }, [selectedCategory])

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedBrand && selectedBrand !== 'all') params.append('brand', selectedBrand)
      
      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchBrands = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }
      
      const response = await fetch(`/api/brands?${params.toString()}`)
      const data = await response.json()
      setBrands(data.brands || [])
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Ürünler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Ürünlerimiz</h1>
          <p className="text-lg text-gray-600">
            Denizcilik tekstili konusunda premium kalitede ürünlerimizi keşfedin
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Ürün ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-64">
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
            {selectedCategory !== 'all' && brands.length > 0 && (
              <div className="md:w-64">
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Marka seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Markalar</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.slug}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aradığınız kriterlere uygun ürün bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <ShoppingCart className="w-16 h-16 text-white opacity-50 group-hover:opacity-70 transition-opacity" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                        {product.category.name}
                      </span>
                    </div>
                    {product.stock === 0 && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Stokta Yok
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    {/* Brand */}
                    {product.brand && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                          Marka:
                        </span>
                        <span className="text-sm text-primary font-semibold">
                          {product.brand.name}
                        </span>
                      </div>
                    )}
                    
                    {/* Product Name */}
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
                      {product.name}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                    
                    {/* Sizes */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 font-medium">Mevcut Boyutlar:</p>
                        <div className="flex flex-wrap gap-1">
                          {product.sizes.slice(0, 3).map((size, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium">
                              {size}
                            </span>
                          ))}
                          {product.sizes.length > 3 && (
                            <span className="text-xs text-gray-500 font-medium">
                              +{product.sizes.length - 3} daha
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Price and Actions */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-primary">
                          {product.sizePrices.length > 0 ? (
                            product.sizePrices.length === 1 ? (
                              formatTRYPrice(convertUSDToTRY(product.sizePrices[0].price, exchangeRate))
                            ) : (
                              `${formatTRYPrice(convertUSDToTRY(Math.min(...product.sizePrices.map(sp => sp.price)), exchangeRate))} - ${formatTRYPrice(convertUSDToTRY(Math.max(...product.sizePrices.map(sp => sp.price)), exchangeRate))}`
                            )
                          ) : (
                            'Fiyat Yok'
                          )}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link href={`/products/${product.slug}`} className="flex-1">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="w-full cursor-pointer"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Sepete Ekle
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}