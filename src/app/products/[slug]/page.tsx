'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCartStore } from '@/lib/cart'
import { useLanguage, getTranslatedText, getTranslatedColors } from '@/lib/language'
import { CustomToast } from '@/components/custom-toast'
import { FileUpload } from '@/components/file-upload'
import { ShoppingCart, ArrowLeft, Star, Shield, Waves, ChevronLeft, ChevronRight } from 'lucide-react'
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
  sizePrices: { size: string; price: number; stock: number }[]
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
  const [selectedSizePrice, setSelectedSizePrice] = useState<{ size: string; price: number; stock: number } | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [slug, setSlug] = useState<string>('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [hasEmbroidery, setHasEmbroidery] = useState(false)
  const [embroideryFile, setEmbroideryFile] = useState<File | null>(null)
  const [embroideryUrl, setEmbroideryUrl] = useState<string>('')
  const [exchangeRate, setExchangeRate] = useState<number>(34.50) // Default fallback rate
  const { addItem } = useCartStore()
  const router = useRouter()
  const { language } = useLanguage()



  const content = {
    tr: {
      loading: "Ürün yükleniyor...",
      notFound: "Ürün bulunamadı",
      backToProducts: "Ürünlere Dön",
      products: "Ürünler",
      brand: "Marka:",
      selectSize: "Boyut Seçin:",
      selectSizePlaceholder: "Boyut seçin",
      selectColor: "Renk Seçin:",
      selectColorPlaceholder: "Renk seçin",
      quantity: "Miktar:",
      embroidery: "Nakış (+₺100)",
      embroideryDesign: "Nakış Tasarımı:",
      embroideryRequired: "Nakış seçtiyseniz tasarım dosyasını yüklemelisiniz.",
      addToCart: "Sepete Ekle",
      viewCart: "Sepeti Görüntüle",
      outOfStock: "Stokta Yok",
      imageAlt: "Görsel",
      addedToCart: "Sepete Eklendi!",
      errorTitle: "Uyarı",
      selectSizeFirst: "Boyut seçiniz",
      uvProtected: "UV Korumalı",
      waterproof: "Su Geçirmez",
      premiumQuality: "Premium Kalite"
    },
    en: {
      loading: "Loading product...",
      notFound: "Product not found",
      backToProducts: "Back to Products",
      products: "Products",
      brand: "Brand:",
      selectSize: "Select Size:",
      selectSizePlaceholder: "Select size",
      selectColor: "Select Color:",
      selectColorPlaceholder: "Select color",
      quantity: "Quantity:",
      embroidery: "Embroidery (+$5)",
      embroideryDesign: "Embroidery Design:",
      embroideryRequired: "You must upload a design file if you select embroidery.",
      addToCart: "Add to Cart",
      viewCart: "View Cart",
      outOfStock: "Out of Stock",
      imageAlt: "Image",
      addedToCart: "Added to Cart!",
      errorTitle: "Warning",
      selectSizeFirst: "Select size first",
      uvProtected: "UV Protected",
      waterproof: "Waterproof",
      premiumQuality: "Premium Quality"
    }
  }

  const t = content[language]

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
      loadExchangeRate()
    }
  }, [slug])

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

  // Keyboard navigation for images
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (product && product.images.length > 1) {
        if (event.key === 'ArrowLeft') {
          prevImage()
        } else if (event.key === 'ArrowRight') {
          nextImage()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [product])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${slug}`)
      const data = await response.json()
      setProduct(data.product)
      // İlk boyutu seçili hale getir
      if (data.product.sizePrices && data.product.sizePrices.length > 0) {
        setSelectedSizePrice(data.product.sizePrices[0])
      }
      // Renk seçimi yapılmaz, kullanıcı manuel olarak seçmeli
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product && selectedSizePrice) {
      // Stok kontrolü
      if (selectedSizePrice.stock < quantity) {
        setToastMessage(language === 'tr' 
          ? `Stokta sadece ${selectedSizePrice.stock} adet ${selectedSizePrice.size} boyutu mevcut!` 
          : `Only ${selectedSizePrice.stock} pieces of ${selectedSizePrice.size} size available in stock!`)
        setToastType('error')
        setShowToast(true)
        return
      }

      // Renk seçimi kontrolü
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        setToastMessage(language === 'tr' 
          ? 'Lütfen bir renk seçin!' 
          : 'Please select a color!')
        setToastType('error')
        setShowToast(true)
        return
      }

      for (let i = 0; i < quantity; i++) {
        addItem({
          cartItemId: `${product.id}-${selectedSizePrice.size}-${selectedColor || 'no-color'}-${hasEmbroidery ? 'emb' : 'no-emb'}-${Date.now()}-${i}`,
          id: product.id,
          name: getTranslatedText(product.name, product.nameEn || null || null, language),
          price: convertUSDToTRY(selectedSizePrice.price, exchangeRate, language), // Store price in the language it was ordered
          image: product.images[0] || '/placeholder.jpg',
          size: selectedSizePrice.size,
          color: selectedColor || '',
          hasEmbroidery: hasEmbroidery,
          embroideryFile: embroideryUrl || undefined,
          embroideryPrice: hasEmbroidery ? (language === 'tr' ? 100 : 5) : 0,
          categoryName: getTranslatedText(product.category.name, product.category.nameEn || null || null, language),
          brandName: product.brand ? getTranslatedText(product.brand.name, product.brand.nameEn || null || null, language) : undefined
        })
      }
      setToastMessage(`${quantity} adet ${getTranslatedText(product.name, product.nameEn || null || null, language)} sepete eklendi!`)
      setToastType('success')
      setShowToast(true)
      
      // Toast gösterildikten sonra ürünler sayfasına yönlendir
      setTimeout(() => {
        router.push('/products')
      }, 2000) // 2 saniye sonra yönlendir
    }
  }

  const nextImage = () => {
    if (product && product.images.length > 0) {
      setSelectedImage((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product && product.images.length > 0) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

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

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.notFound}</h1>
          <Link href="/products">
            <Button>{t.backToProducts}</Button>
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
            {t.products}
          </Link>
          <span>/</span>
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-primary">
            {getTranslatedText(product.category.name, product.category.nameEn || null, language)}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{getTranslatedText(product.name, product.nameEn || null, language)}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-w-16 aspect-h-12 relative">
              {product.images && product.images.length > 0 ? (
                <>
                  <img
                    src={product.images[selectedImage]}
                    alt={getTranslatedText(product.name, product.nameEn || null, language)}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  {/* Navigation Buttons */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      {/* Image Counter */}
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        {selectedImage + 1} / {product.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-32 h-32 text-white opacity-50" />
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${getTranslatedText(product.name, product.nameEn || null, language)} - ${t.imageAlt} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
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
                  {getTranslatedText(product.category.name, product.category.nameEn || null, language)}
                </span>
              </div>
              {product.brand && (
                <div className="mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                      {t.brand}
                    </span>
                    <span className="text-lg text-primary font-bold">
                      {getTranslatedText(product.brand.name, product.brand.nameEn || null, language)}
                    </span>
                  </div>
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {getTranslatedText(product.name, product.nameEn || null, language)}
              </h1>
              <p className="text-xl text-primary font-bold mb-6">
                {selectedSizePrice ? (
                  <span>
                    {formatPrice((convertUSDToTRY(selectedSizePrice.price, exchangeRate, language) + (hasEmbroidery ? (language === 'tr' ? 100 : 5) : 0)) * quantity, language)}
                    {quantity > 1 && (
                      <span className="text-sm text-gray-600 ml-2">
                        ({quantity} × {formatPrice(convertUSDToTRY(selectedSizePrice.price, exchangeRate, language) + (hasEmbroidery ? (language === 'tr' ? 100 : 5) : 0), language)})
                      </span>
                    )}
                    {hasEmbroidery && (
                      <span className="text-sm text-gray-600 ml-2 block">
                        {formatPrice(convertUSDToTRY(selectedSizePrice.price, exchangeRate, language), language)} + {language === 'tr' ? '₺100 nakış' : '$5 embroidery'}
                      </span>
                    )}
                  </span>
                ) : (
                  t.selectSizeFirst
                )}
              </p>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed">
                {getTranslatedText(product.description, product.descriptionEn || null, language)}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="w-5 h-5 text-primary" />
                <span>{t.uvProtected}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Waves className="w-5 h-5 text-primary" />
                <span>{t.waterproof}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Star className="w-5 h-5 text-primary" />
                <span>{t.premiumQuality}</span>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="border-t pt-6">
              {/* Size Selection */}
              {product.sizePrices && product.sizePrices.length > 0 && (
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">{t.selectSize}</label>
                  <Select 
                    value={selectedSizePrice ? selectedSizePrice.size : ''} 
                    onValueChange={(value) => {
                      const sizePrice = product.sizePrices.find(sp => sp.size === value)
                      if (sizePrice) {
                        setSelectedSizePrice(sizePrice)
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t.selectSizePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizePrices.map((sizePrice) => (
                        <SelectItem 
                          key={sizePrice.size} 
                          value={sizePrice.size}
                          disabled={sizePrice.stock === 0}
                        >
                          {sizePrice.size} - {formatPrice(convertUSDToTRY(sizePrice.price, exchangeRate, language), language)}
                          {sizePrice.stock === 0 && ' (Stokta Yok)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">{t.selectColor}</label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t.selectColorPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {getTranslatedColors(product.colors, language).map((color, index) => (
                        <SelectItem key={index} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Embroidery Option */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    id="embroidery"
                    checked={hasEmbroidery}
                    onChange={(e) => setHasEmbroidery(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="embroidery" className="text-sm font-medium cursor-pointer">
                    {t.embroidery}
                  </label>
                </div>
                
                {hasEmbroidery && (
                  <div className="mt-3">
                    <label className="text-sm font-medium mb-2 block">{t.embroideryDesign}</label>
                    <FileUpload
                      onFileSelect={(file, url) => {
                        console.log('File selected:', file?.name, 'URL:', url)
                        setEmbroideryFile(file)
                        setEmbroideryUrl(url || '')
                      }}
                      acceptedTypes={['.jpg', '.jpeg', '.png', '.pdf']}
                      maxSize={10}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-sm font-medium">{t.quantity}</label>
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
                  disabled={!selectedSizePrice || selectedSizePrice.stock === 0 || (hasEmbroidery && !embroideryUrl)}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {t.addToCart}
                </Button>
                <Link href="/cart">
                  <Button variant="outline" size="lg" className="cursor-pointer hover:bg-gray-50 transition-colors">
                    {t.viewCart}
                  </Button>
                </Link>
              </div>
              
              {hasEmbroidery && !embroideryUrl && (
                <p className="text-sm text-red-600 mt-2">
                  {t.embroideryRequired}
                </p>
              )}
              
              {selectedSizePrice && selectedSizePrice.stock === 0 && (
                <p className="text-red-500 text-sm mt-2">{t.outOfStock}</p>
              )}
              
              {!selectedSizePrice && product.sizePrices && product.sizePrices.length > 0 && (
                <p className="text-orange-500 text-sm mt-2">{t.selectSizeFirst}</p>
              )}
              
              {selectedSizePrice && selectedSizePrice.stock > 0 && selectedSizePrice.stock < 10 && (
                <p className="text-orange-500 text-sm mt-2">
                  {language === 'tr' 
                    ? `Son ${selectedSizePrice.stock} adet kaldı!` 
                    : `Only ${selectedSizePrice.stock} pieces left!`}
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
      
      {/* Custom Toast */}
      {showToast && (
        <CustomToast
          title={toastType === 'success' ? t.addedToCart : t.errorTitle}
          description={toastMessage}
          onClose={() => setShowToast(false)}
          duration={3000}
          type={toastType}
        />
      )}
    </div>
  )
}
