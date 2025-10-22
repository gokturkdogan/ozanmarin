'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCartStore } from '@/lib/cart'
import { ShoppingCart, ArrowLeft, Star, Shield, Waves } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  description: string
  images: string[]
  stock: number
  sizes: string[]
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

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [slug, setSlug] = useState<string>('')
  const { addItem } = useCartStore()

  useEffect(() => {
    const getSlug = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
    }
    getSlug()
  }, [params])

  useEffect(() => {
    if (slug) {
      fetchProduct()
    }
  }, [slug])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${slug}`)
      const data = await response.json()
      setProduct(data.product)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0] || '/placeholder.jpg',
          size: selectedSize,
          color: selectedColor
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Ürün yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ürün bulunamadı</h1>
          <Link href="/products">
            <Button>Ürünlere Dön</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/products" className="hover:text-primary">
            Ürünler
          </Link>
          <span>/</span>
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-primary">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-16 aspect-h-12">
              <div className="w-full h-96 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-32 h-32 text-white opacity-50" />
              </div>
            </div>
            
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="w-full h-20 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-white opacity-50" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="mb-2">
                <span className="text-sm text-primary font-medium">
                  {product.category.name}
                </span>
                {product.brand && (
                  <span className="text-sm text-gray-500 ml-2">
                    • {product.brand.name}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <p className="text-xl text-primary font-bold mb-6">
                ₺{product.price.toLocaleString()}
              </p>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="w-5 h-5 text-primary" />
                <span>UV Korumalı</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Waves className="w-5 h-5 text-primary" />
                <span>Su Geçirmez</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Star className="w-5 h-5 text-primary" />
                <span>Premium Kalite</span>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="border-t pt-6">
              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Boyut Seçin:</label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Boyut seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Renk Seçin:</label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Renk seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-sm font-medium">Adet:</label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  size="lg" 
                  className="flex-1 cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Sepete Ekle
                </Button>
                <Link href="/cart">
                  <Button variant="outline" size="lg" className="cursor-pointer hover:bg-gray-50 transition-colors">
                    Sepeti Görüntüle
                  </Button>
                </Link>
              </div>
              
              {product.stock === 0 && (
                <p className="text-red-500 text-sm mt-2">Bu ürün şu anda stokta bulunmuyor.</p>
              )}
              
              {product.stock > 0 && product.stock < 10 && (
                <p className="text-orange-500 text-sm mt-2">
                  Son {product.stock} adet kaldı!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Benzer Ürünler</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Placeholder for related products */}
            <Card className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <ShoppingCart className="w-16 h-16 text-white opacity-50" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Benzer Ürün 1</h3>
                <p className="text-primary font-bold">₺1,200</p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <ShoppingCart className="w-16 h-16 text-white opacity-50" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Benzer Ürün 2</h3>
                <p className="text-primary font-bold">₺950</p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <ShoppingCart className="w-16 h-16 text-white opacity-50" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Benzer Ürün 3</h3>
                <p className="text-primary font-bold">₺1,800</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
