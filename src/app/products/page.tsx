'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCartStore } from '@/lib/cart'
import { useLanguage, getTranslatedText } from '@/lib/language'
import { ShoppingCart, Search } from 'lucide-react'
import { getUSDExchangeRate, convertUSDToTRY, formatPrice } from '@/lib/exchangeRate'

interface Product {
  id: string
  name: string
  nameEn?: string
  slug: string
  slugEn?: string
  description: string
  descriptionEn?: string
  images: string[]
  stock: number
  sizePrices: { size: string; price: number }[]
  colors: { tr: string; en: string }[] // Updated colors interface
  category: {
    name: string
    nameEn?: string
    slug: string
    slugEn?: string
  }
  brand?: {
    name: string
    nameEn?: string
    slug: string
    slugEn?: string
  }
}

interface Category {
  id: string
  name: string
  nameEn?: string
  slug: string
  slugEn?: string
}

interface Brand {
  id: string
  name: string
  nameEn?: string
  slug: string
  slugEn?: string
  category: {
    name: string
    nameEn?: string
    slug: string
    slugEn?: string
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
  const { language } = useLanguage()

  const content = {
    tr: {
      title: "Ürünler",
      subtitle: "Denizcilik tekstili ürünlerimizi keşfedin",
      searchPlaceholder: "Ürün ara...",
      categoryFilter: "Kategori",
      brandFilter: "Marka",
      allCategories: "Tüm Kategoriler",
      allBrands: "Tüm Markalar",
      addToCart: "Sepete Ekle",
      viewDetails: "Detayları Gör",
      noProducts: "Ürün bulunamadı",
      noProductsDesc: "Arama kriterlerinize uygun ürün bulunamadı.",
      loading: "Yükleniyor...",
      error: "Ürünler yüklenirken bir hata oluştu.",
      retry: "Tekrar Dene",
      stock: "Stok",
      inStock: "Stokta",
      outOfStock: "Stokta Yok",
      priceFrom: "Fiyat:",
      category: "Kategori:",
      brand: "Marka:",
      colors: "Renkler:",
      sizes: "Boyutlar:"
    },
    en: {
      title: "Products",
      subtitle: "Discover our marine textile products",
      searchPlaceholder: "Search products...",
      categoryFilter: "Category",
      brandFilter: "Brand",
      allCategories: "All Categories",
      allBrands: "All Brands",
      addToCart: "Add to Cart",
      viewDetails: "View Details",
      noProducts: "No products found",
      noProductsDesc: "No products found matching your search criteria.",
      loading: "Loading...",
      error: "An error occurred while loading products.",
      retry: "Retry",
      stock: "Stock",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      priceFrom: "Price:",
      category: "Category:",
      brand: "Brand:",
      colors: "Colors:",
      sizes: "Sizes:"
    }
  }

  const t = content[language]

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
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t.title}</h1>
          <p className="text-lg text-gray-600">
            {t.subtitle}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-64">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={`${t.categoryFilter} seçin`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allCategories}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {getTranslatedText(category.name, category.nameEn || null, language)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCategory !== 'all' && brands.length > 0 && (
              <div className="md:w-64">
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder={`${t.brandFilter} seçin`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allBrands}</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.slug}>
                        {getTranslatedText(brand.name, brand.nameEn || null, language)}
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
            <p className="text-gray-500 text-lg">{t.noProductsDesc}</p>
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
                        alt={getTranslatedText(product.name, product.nameEn || null, language)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <ShoppingCart className="w-16 h-16 text-white opacity-50 group-hover:opacity-70 transition-opacity" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                        {getTranslatedText(product.category.name, product.category.nameEn || null, language)}
                      </span>
                    </div>
                    {product.stock === 0 && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {t.outOfStock}
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
                          {t.brand}
                        </span>
                        <span className="text-sm text-primary font-semibold">
                          {getTranslatedText(product.brand.name, product.brand.nameEn || null, language)}
                        </span>
                      </div>
                    )}
                    
                    {/* Product Name */}
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
                      {getTranslatedText(product.name, product.nameEn || null, language)}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {getTranslatedText(product.description, product.descriptionEn || null, language)}
                    </p>
                    
                    {/* Sizes */}
                    {product.sizePrices && Array.isArray(product.sizePrices) && product.sizePrices.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 font-medium">{t.sizes}</p>
                        <div className="flex flex-wrap gap-1">
                          {product.sizePrices.slice(0, 3).map((sizePrice: any, index: number) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium">
                              {sizePrice.size}
                            </span>
                          ))}
                          {product.sizePrices.length > 3 && (
                            <span className="text-xs text-gray-500 font-medium">
                              +{product.sizePrices.length - 3} {language === 'tr' ? 'daha' : 'more'}
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
                              formatPrice(convertUSDToTRY(product.sizePrices[0].price, exchangeRate, language), language)
                            ) : (
                              `${formatPrice(convertUSDToTRY(Math.min(...product.sizePrices.map(sp => sp.price)), exchangeRate, language), language)} - ${formatPrice(convertUSDToTRY(Math.max(...product.sizePrices.map(sp => sp.price)), exchangeRate, language), language)}`
                            )
                          ) : (
                            language === 'tr' ? 'Fiyat Yok' : 'No Price'
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
                            {t.addToCart}
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