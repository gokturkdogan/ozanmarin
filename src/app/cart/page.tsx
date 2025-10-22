'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCartStore } from '@/lib/cart'
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } = useCartStore()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sepetiniz Boş</h1>
            <p className="text-gray-600 mb-8">
              Henüz sepetinize ürün eklemediniz. Ürünlerimizi keşfetmek için aşağıdaki butona tıklayın.
            </p>
            <Link href="/products">
              <Button size="lg">
                Ürünleri İncele
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
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Alışverişe Devam Et
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Sepetim</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={clearCart}
            className="cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Sepeti Temizle
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
                          {item.size && <div>Boyut: {item.size}</div>}
                          {item.color && <div>Renk: {item.color}</div>}
                          {item.hasEmbroidery && (
                            <div className="text-green-600 font-medium">
                              ✓ Nakış (+₺100)
                              {item.embroideryFile && (
                                <span className="text-gray-500 ml-1">- Dosya yüklendi</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-primary font-bold text-lg">
                        ₺{(item.price + (item.embroideryPrice || 0)).toLocaleString()}
                        {item.hasEmbroidery && (
                          <span className="text-sm text-gray-600 ml-2">
                            (₺{item.price.toLocaleString()} + ₺100 nakış)
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
                        ₺{((item.price + (item.embroideryPrice || 0)) * item.quantity).toLocaleString()}
                      </p>
                      {item.hasEmbroidery && (
                        <p className="text-sm text-gray-600">
                          (₺{item.price.toLocaleString()} + ₺{(item.embroideryPrice || 0).toLocaleString()} nakış) × {item.quantity}
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
                <CardTitle>Sipariş Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Ürün Sayısı:</span>
                  <span>{getTotalItems()} adet</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Ara Toplam:</span>
                  <span>₺{getTotalPrice().toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Kargo:</span>
                  <div className="text-right">
                    <div>₺200</div>
                    <div className="text-gray-500 text-xs">(teslimat adresine göre değişiklik gösterebilir)</div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Toplam:</span>
                    <span>₺{(getTotalPrice() + 200).toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full mt-6 cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? 'Yönlendiriliyor...' : 'Siparişi Tamamla'}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  <p>Güvenli ödeme ile korunuyorsunuz</p>
                  <p>Kargo ücretsizdir</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
