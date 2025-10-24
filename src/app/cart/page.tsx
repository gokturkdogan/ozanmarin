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
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const { language } = useLanguage()

  const t = {
    tr: {
      emptyCart: "Sepetiniz Boş",
      emptyCartDesc: "Henüz sepetinize ürün eklemediniz.",
      exploreProducts: "Ürünleri İncele",
      shoppingCart: "Alışveriş Sepeti",
      continueShopping: "Alışverişe Devam Et",
      clearCart: "Sepeti Temizle",
      subtotal: "Ara Toplam",
      total: "Toplam",
      checkout: "Siparişi Tamamla"
    },
    en: {
      emptyCart: "Your Cart is Empty",
      emptyCartDesc: "You haven't added any products to your cart yet.",
      exploreProducts: "Explore Products",
      shoppingCart: "Shopping Cart",
      continueShopping: "Continue Shopping",
      clearCart: "Clear Cart",
      subtotal: "Subtotal",
      total: "Total",
      checkout: "Proceed to Checkout"
    }
  }[language]

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const handleCheckout = () => {
    setIsCheckingOut(true)
    window.location.href = '/checkout'
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.emptyCart}</h1>
            <p className="text-gray-600 mb-8">{t.emptyCartDesc}</p>
            <Link href="/products">
              <Button size="lg">{t.exploreProducts}</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.continueShopping}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{t.shoppingCart}</h1>
          </div>
          <Button variant="outline" onClick={clearCart}>
            <Trash2 className="w-4 h-4 mr-2" />
            {t.clearCart}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.cartItemId}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-white opacity-50" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
                      <p className="text-primary font-bold text-lg">
                        {formatPrice(item.price + (item.embroideryPrice || 0), language)}
                      </p>
                    </div>

                    {item.stockType === 'meter' ? (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.cartItemId, Math.max(0.1, Math.round((item.quantity - 0.1) * 10) / 10))}
                          className="w-8 h-8 hover:bg-gray-50"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <div className="flex items-center space-x-1 bg-gray-50 rounded-lg px-3 py-1">
                          <input
                            type="number"
                            value={item.quantity.toFixed(1)}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0.1;
                              handleQuantityChange(item.cartItemId, Math.round(value * 10) / 10);
                            }}
                            min="0.1"
                            step="0.1"
                            className="w-16 bg-transparent border-0 text-center text-sm font-medium focus:outline-none focus:ring-0"
                          />
                          <span className="text-xs text-gray-500 font-medium">m</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.cartItemId, Math.round((item.quantity + 0.1) * 10) / 10)}
                          className="w-8 h-8 hover:bg-gray-50"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice((item.price + (item.embroideryPrice || 0)) * item.quantity, language)}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.cartItemId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>{t.subtotal}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>{language === 'tr' ? 'Ürün Sayısı:' : 'Items:'}</span>
                  <span>{items.reduce((sum, item) => sum + (item.stockType === 'meter' ? 1 : item.quantity), 0)} {language === 'tr' ? 'birim' : 'units'}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>{t.subtotal}:</span>
                  <span>{formatPrice(getTotalPrice(), language)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>{language === 'tr' ? 'Kargo:' : 'Shipping:'}</span>
                  <span>{language === 'tr' ? '₺200' : '$0'}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t.total}:</span>
                    <span>{formatPrice(getTotalPrice() + (language === 'tr' ? 200 : 0), language)}</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full mt-6"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (language === 'tr' ? 'Yönlendiriliyor...' : 'Redirecting...') : t.checkout}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}