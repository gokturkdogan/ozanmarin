'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCartStore } from '@/lib/cart'
import { useLanguage } from '@/lib/language'
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react'
import { formatPrice } from '@/lib/exchangeRate'

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } = useCartStore()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const { language } = useLanguage()

  const content = {
    tr: {
      emptyCart: "Sepetiniz Boş",
      emptyCartDesc: "Henüz sepetinize ürün eklemediniz. Ürünlerimizi keşfetmek için aşağıdaki butona tıklayın.",
      exploreProducts: "Ürünleri İncele",
      shoppingCart: "Alışveriş Sepeti",
      backToProducts: "Ürünlere Dön",
      productDetails: "Ürün Detayları",
      category: "Kategori:",
      brand: "Marka:",
      size: "Boyut:",
      color: "Renk:",
      quantity: "Miktar:",
      embroidery: "Nakışlı",
      remove: "Kaldır",
      subtotal: "Ara Toplam",
      total: "Toplam",
      checkout: "Siparişi Tamamla",
      clearCart: "Sepeti Temizle",
      continueShopping: "Alışverişe Devam Et"
    },
    en: {
      emptyCart: "Your Cart is Empty",
      emptyCartDesc: "You haven't added any products to your cart yet. Click the button below to explore our products.",
      exploreProducts: "Explore Products",
      shoppingCart: "Shopping Cart",
      backToProducts: "Back to Products",
      productDetails: "Product Details",
      category: "Category:",
      brand: "Brand:",
      size: "Size:",
      color: "Color:",
      quantity: "Quantity:",
      embroidery: "With Embroidery",
      remove: "Remove",
      subtotal: "Subtotal",
      total: "Total",
      checkout: "Proceed to Checkout",
      clearCart: "Clear Cart",
      continueShopping: "Continue Shopping"
    }
  }

  const t = content[language]

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const handleCheckout = () => {
    setIsCheckingOut(true)
    // Redirect to checkout page
    window.location.href = '/checkout'
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.emptyCart}</h1>
            <p className="text-gray-600 mb-8">
              {t.emptyCartDesc}
            </p>
            <Link href="/products">
              <Button size="lg" className="cursor-pointer">
                {t.exploreProducts}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/products">
              <Button variant="outline" size="sm" className="cursor-pointer">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.continueShopping}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{t.shoppingCart}</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={clearCart}
            className="cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t.clearCart}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.cartItemId}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-white opacity-50" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {item.name}
                      </h3>
                      {(item.size || item.color || item.hasEmbroidery) && (
                        <div className="text-sm text-gray-600 mt-1 space-y-1">
                          {item.size && <div>{t.size} {item.size}</div>}
                          {item.color && <div>{t.color} {item.color}</div>}
                          {item.hasEmbroidery && (
                            <div className="text-green-600 font-medium">
                              ✓ {t.embroidery} {language === 'tr' ? '(+₺100)' : '(+$5)'}
                              {item.embroideryFile && (
                                <span className="text-gray-500 ml-1">{language === 'tr' ? '- Dosya yüklendi' : '- File uploaded'}</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-primary font-bold text-lg">
                        {formatPrice(item.price + (item.embroideryPrice || 0), language)}
                        {item.hasEmbroidery && (
                          <span className="text-sm text-gray-600 ml-2">
                            ({formatPrice(item.price, language)} + {language === 'tr' ? '₺100 nakış' : '$5 embroidery'})
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice((item.price + (item.embroideryPrice || 0)) * item.quantity, language)}
                      </p>
                      {item.hasEmbroidery && (
                        <p className="text-sm text-gray-600">
                          ({formatPrice(item.price, language)} + {formatPrice(item.embroideryPrice || 0, language)} {language === 'tr' ? 'nakış' : 'embroidery'}) × {item.quantity}
                        </p>
                      )}
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.cartItemId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>{t.subtotal}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>{language === 'tr' ? 'Ürün Sayısı:' : 'Items:'}</span>
                  <span>{getTotalItems()} {language === 'tr' ? 'adet' : 'items'}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>{t.subtotal}:</span>
                  <span>{formatPrice(getTotalPrice(), language)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>{language === 'tr' ? 'Kargo:' : 'Shipping:'}</span>
                  <div className="text-right">
                    <div>{language === 'tr' ? '₺200' : '$0'}</div>
                    <div className="text-gray-500 text-xs">{language === 'tr' ? '(teslimat adresine göre değişiklik gösterebilir)' : '(may vary based on delivery address)'}</div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t.total}:</span>
                    <span>{formatPrice(getTotalPrice() + (language === 'tr' ? 200 : 0), language)}</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full mt-6 cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (language === 'tr' ? 'Yönlendiriliyor...' : 'Redirecting...') : t.checkout}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  <p>{language === 'tr' ? 'Güvenli ödeme ile korunuyorsunuz' : 'You are protected by secure payment'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
