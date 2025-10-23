'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCartStore } from '@/lib/cart'
import { ArrowLeft, Plus, CreditCard, MapPin, Edit, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { countries } from '@/lib/countries'
import { AddressModal } from '@/components/address-modal'
import { formatTRYPrice, formatPrice, getUSDExchangeRate } from '@/lib/exchangeRate'
import { useLanguage } from '@/lib/language'

interface Address {
  id: string
  title: string
  fullName: string
  phone: string
  country: string
  city: string
  district: string
  address: string
  isDefault: boolean
}

interface User {
  id: string
  name: string
  email: string
}

export default function CheckoutPage() {
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore()
  const { language, t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('online') // Default to online payment
  const [copiedIban, setCopiedIban] = useState<string | null>(null)
  const [exchangeRate, setExchangeRate] = useState<number>(42.00) // Default fallback rate
  
  // Guest form data
  const [guestForm, setGuestForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: 'Türkiye',
    city: '',
    district: '',
    address: ''
  })

  // Dil bazlı içerik
  const content = {
    tr: {
      emptyCart: "Sepetiniz Boş",
      emptyCartDesc: "Önce sepetinize ürün eklemeniz gerekiyor.",
      viewProducts: "Ürünleri İncele",
      loading: "Yükleniyor...",
      backToCart: "Sepete Dön",
      completeOrder: "Siparişi Tamamla",
      deliveryInfo: "Teslimat Bilgileri",
      defaultAddress: "Varsayılan",
      edit: "Düzenle",
      addNewAddress: "Yeni Adres Ekle",
      noAddress: "Henüz kayıtlı adresiniz yok.",
      addFirstAddress: "İlk Adresinizi Ekleyin",
      fullName: "Ad Soyad",
      email: "E-posta",
      phone: "Telefon",
      country: "Ülke",
      city: "Şehir",
      district: "İlçe",
      address: "Adres",
      selectCountry: "Ülke seçiniz",
      addressPlaceholder: "Mahalle, sokak, bina no, daire no",
      paymentMethod: "Ödeme Yöntemi",
      onlinePayment: "Online Ödeme",
      onlinePaymentDesc: "Kredi kartı ile güvenli ödeme",
      onlinePaymentDescDisabled: "Sadece Türkiye için geçerli",
      bankTransfer: "Havale/EFT",
      bankTransferDesc: "Banka hesabına transfer",
      bankInfo: "Havale/EFT Bilgileri",
      bank: "Banka:",
      accountName: "Hesap Adı:",
      iban: "IBAN:",
      bankNote: "Ödeme yaptıktan sonra dekontu WhatsApp'tan gönderebilirsiniz.",
      tryAccount: "Türk Lirası Hesabı:",
      usdAccount: "Dolar Hesabı:",
      copyButton: "Kopyala",
      copiedText: "Kopyalandı!",
      orderSummary: "Sipariş Özeti",
      productCount: "Ürün Sayısı:",
      subtotal: "Ara Toplam:",
      shipping: "Kargo:",
      shippingNote: "(teslimat adresine göre değişiklik gösterebilir)",
      shippingNoteIntl: "(uluslararası kargo)",
      total: "Toplam:",
      proceedToPayment: "Ödemeye Devam Et",
      selectAddress: "Lütfen bir teslimat adresi seçin.",
      fillForm: "Lütfen tüm teslimat bilgilerini doldurun.",
      addressNotFound: "Teslimat adresi bulunamadı.",
      orderError: "Sipariş oluşturulurken bir hata oluştu.",
      paymentError: "Ödeme oluşturulurken bir hata oluştu.",
      paymentProcessError: "Ödeme sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      addressUpdateError: "Adres güncellenirken bir hata oluştu:",
      addressCreateError: "Adres oluşturulurken bir hata oluştu:",
      generalError: "Bir hata oluştu. Lütfen tekrar deneyin.",
      shippingCost: "Kargo Ücreti",
      shippingCategory: "Kargo",
      items: "adet"
    },
    en: {
      emptyCart: "Your Cart is Empty",
      emptyCartDesc: "You need to add products to your cart first.",
      viewProducts: "View Products",
      loading: "Loading...",
      backToCart: "Back to Cart",
      completeOrder: "Complete Order",
      deliveryInfo: "Delivery Information",
      defaultAddress: "Default",
      edit: "Edit",
      addNewAddress: "Add New Address",
      noAddress: "You don't have any saved addresses yet.",
      addFirstAddress: "Add Your First Address",
      fullName: "Full Name",
      email: "Email",
      phone: "Phone",
      country: "Country",
      city: "City",
      district: "District",
      address: "Address",
      selectCountry: "Select country",
      addressPlaceholder: "Neighborhood, street, building no, apartment no",
      paymentMethod: "Payment Method",
      onlinePayment: "Online Payment",
      onlinePaymentDesc: "Secure payment with credit card",
      onlinePaymentDescDisabled: "Only valid for Turkey",
      bankTransfer: "Bank Transfer/EFT",
      bankTransferDesc: "Transfer to bank account",
      bankInfo: "Bank Transfer Information",
      bank: "Bank:",
      accountName: "Account Name:",
      iban: "IBAN:",
      bankNote: "You can send the receipt via WhatsApp after payment.",
      tryAccount: "Turkish Lira Account:",
      usdAccount: "US Dollar Account:",
      copyButton: "Copy",
      copiedText: "Copied!",
      orderSummary: "Order Summary",
      productCount: "Product Count:",
      subtotal: "Subtotal:",
      shipping: "Shipping:",
      shippingNote: "(may vary according to delivery address)",
      shippingNoteIntl: "(international shipping)",
      total: "Total:",
      proceedToPayment: "Proceed to Payment",
      selectAddress: "Please select a delivery address.",
      fillForm: "Please fill in all delivery information.",
      addressNotFound: "Delivery address not found.",
      orderError: "An error occurred while creating the order.",
      paymentError: "An error occurred while creating payment.",
      paymentProcessError: "An error occurred during payment. Please try again.",
      addressUpdateError: "An error occurred while updating address:",
      addressCreateError: "An error occurred while creating address:",
      generalError: "An error occurred. Please try again.",
      shippingCost: "Shipping Cost",
      shippingCategory: "Shipping",
      items: "items"
    }
  }

  const t_content = content[language]

  // Check if selected country is Turkey
  const isTurkeySelected = () => {
    if (user) {
      // For logged in users, check selected address
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId)
      return selectedAddress?.country === 'Türkiye'
    } else {
      // For guest users, check guest form
      return guestForm.country === 'Türkiye'
    }
  }

  // Auto-switch to bank transfer if non-Turkey country is selected
  useEffect(() => {
    if (!isTurkeySelected() && paymentMethod === 'online') {
      setPaymentMethod('bank_transfer')
    }
  }, [selectedAddressId, guestForm.country, paymentMethod])

  // Calculate shipping cost based on country and language
  const getShippingCost = () => {
    const isTurkey = user 
      ? addresses.find(addr => addr.id === selectedAddressId)?.country === 'Türkiye'
      : guestForm.country === 'Türkiye'
    
    if (language === 'en') {
      // English: Show in USD
      return isTurkey ? 5 : 30
    } else {
      // Turkish: Show in TRY
      return isTurkey ? 200 : 1000
    }
  }

  // Calculate shipping cost in TRY for payment processing
  const getShippingCostTRY = () => {
    const isTurkey = user 
      ? addresses.find(addr => addr.id === selectedAddressId)?.country === 'Türkiye'
      : guestForm.country === 'Türkiye'
    
    return isTurkey ? 200 : 1000 // Always return TRY values for payment processing
  }

  // Calculate shipping cost in USD for English orders
  const getShippingCostUSD = () => {
    const isTurkey = user 
      ? addresses.find(addr => addr.id === selectedAddressId)?.country === 'Türkiye'
      : guestForm.country === 'Türkiye'
    
    return isTurkey ? 5 : 30 // Always return USD values for English orders
  }

  // Load exchange rate
  useEffect(() => {
    const loadExchangeRate = async () => {
      try {
        const rate = await getUSDExchangeRate()
        setExchangeRate(rate)
      } catch (error) {
        console.error('Failed to load exchange rate:', error)
        // Keep default rate
      }
    }
    
    loadExchangeRate()
  }, [])

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
          
          // Fetch user addresses
          const addressesResponse = await fetch('/api/addresses')
          if (addressesResponse.ok) {
            const addressesData = await addressesResponse.json()
            setAddresses(addressesData.addresses)
            
            // Select default address if exists
            const defaultAddress = addressesData.addresses.find((addr: Address) => addr.isDefault)
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id)
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleGuestInputChange = (field: string, value: string) => {
    setGuestForm(prev => ({ ...prev, [field]: value }))
  }

  const handleAddressModalSubmit = async (formData: any) => {
    try {
      if (editingAddress) {
        // Update existing address
        const response = await fetch(`/api/addresses/${editingAddress.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          const updatedAddress = await response.json()
          setAddresses(prev => prev.map(addr => 
            addr.id === editingAddress.id ? updatedAddress.address : addr
          ))
          setEditingAddress(null)
          setShowAddressModal(false)
        } else {
          const errorData = await response.json()
          console.error('Address update failed:', errorData.message)
          alert(t_content.addressUpdateError + ' ' + errorData.message)
        }
      } else {
        // Create new address
        const response = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          const newAddress = await response.json()
          setAddresses(prev => [...prev, newAddress.address])
          setSelectedAddressId(newAddress.address.id)
          setShowAddressModal(false)
        } else {
          const errorData = await response.json()
          console.error('Address creation failed:', errorData.message)
          alert(t_content.addressCreateError + ' ' + errorData.message)
        }
      }
    } catch (error) {
      console.error('Address operation failed:', error)
      alert(t_content.generalError)
    }
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setShowAddressModal(true)
  }

  const handleCopyIban = async (iban: string) => {
    try {
      await navigator.clipboard.writeText(iban)
      setCopiedIban(iban)
      setTimeout(() => setCopiedIban(null), 2000) // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy IBAN:', error)
    }
  }

  const handleProceedToPayment = async () => {
    try {
      // Validate required fields
      if (user) {
        // Logged in user - check if address is selected
        if (!selectedAddressId) {
          alert(t_content.selectAddress)
          return
        }
      } else {
        // Guest user - check if form is filled
        if (!guestForm.fullName || !guestForm.email || !guestForm.phone || 
            !guestForm.city || !guestForm.district || !guestForm.address) {
          alert(t_content.fillForm)
          return
        }
      }

      // Prepare payment data
      const shippingAddress = user 
        ? addresses.find(addr => addr.id === selectedAddressId)
        : guestForm

      if (!shippingAddress) {
        alert(t_content.addressNotFound)
        return
      }

      // Check payment method
      if (paymentMethod === 'bank_transfer') {
        // Create order directly for bank transfer
        // Dil değerine göre fiyat hesapla (ödeme yöntemi farketmez)
        const totalPrice = language === 'en' 
          ? getTotalPrice() + getShippingCost() // USD değerler
          : getTotalPrice() + getShippingCostTRY() // TRY değerler
        
        const orderData = {
          userId: user ? user.id : null,
          totalPrice: totalPrice,
          status: 'received',
          paymentStatus: 'pending',
          paymentMethod: 'bank_transfer',
          shippingAddress: shippingAddress,
          language: language,
          items: [
            ...items.map(item => ({
              productId: item.id,
              productName: item.name,
              productPrice: item.price, // Sadece ürün fiyatı
              productImage: item.image,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
              hasEmbroidery: item.hasEmbroidery || false,
              embroideryFile: item.embroideryFile || null,
              embroideryPrice: item.embroideryPrice || 0, // Nakış fiyatı ayrı
              categoryName: item.categoryName,
              brandName: item.brandName,
              isShipping: false,
              shippingCost: 0
            })),
            // Kargo ücreti
            {
              productId: 'shipping',
              productName: t_content.shippingCost,
              productPrice: language === 'en' ? getShippingCost() : getShippingCostTRY(), // Dil değerine göre
              productImage: null,
              quantity: 1,
              size: null,
              color: null,
              hasEmbroidery: false,
              embroideryFile: null,
              embroideryPrice: 0,
              categoryName: t_content.shippingCategory,
              brandName: null,
              isShipping: true,
              shippingCost: language === 'en' ? getShippingCost() : getShippingCostTRY() // Dil değerine göre
            }
          ]
        }

        const response = await fetch('/api/orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        })

        const result = await response.json()

        if (result.success) {
          // Clear cart and redirect to success page
          clearCart()
          window.location.href = `/payment/success?paymentId=${result.order.id}&method=bank_transfer`
        } else {
          alert(result.error || t_content.orderError)
        }
        return
      }

      // Continue with Iyzico for online payment
      // Clean Turkish characters for Iyzico
      const cleanText = (text: string) => {
        return text.replace(/[çğıöşüÇĞIİÖŞÜ]/g, (match) => {
          const map: { [key: string]: string } = {
            'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
            'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
          }
          return map[match] || match
        })
      }

      // İngilizce dilde USD tutar, Türkçe dilde TRY tutar
      const totalPrice = language === 'en' 
        ? getTotalPrice() + getShippingCost() // USD tutar
        : getTotalPrice() + getShippingCostTRY() // TRY tutar
      const basketId = `basket_${Date.now()}`

      // Prepare Iyzico request
      const iyzicoRequest = {
        locale: language === 'en' ? 'en' : 'tr',
        conversationId: basketId,
        price: totalPrice.toFixed(2),
        paidPrice: totalPrice.toFixed(2),
        currency: language === 'en' ? 'USD' : 'TRY',
        installment: 1,
        paymentChannel: 'WEB',
        paymentGroup: 'PRODUCT',
        callbackUrl: `${window.location.origin}/api/iyzico/callback`,
        enabledInstallments: [1, 2, 3, 6, 9, 12],
        buyer: {
          id: user ? user.id : `guest_${Date.now()}`,
          name: cleanText(user ? user.name.split(' ')[0] : guestForm.fullName.split(' ')[0]),
          surname: cleanText(user ? user.name.split(' ').slice(1).join(' ') : guestForm.fullName.split(' ').slice(1).join(' ')),
          email: user ? user.email : guestForm.email,
          phoneNumber: `+90${(shippingAddress.phone || '').replace(/^0/, '')}`,
          identityNumber: '11111111111',
          address: cleanText(shippingAddress.address),
          city: cleanText(shippingAddress.city),
          country: 'TR',
          zipCode: '34000',
          registrationAddress: cleanText(shippingAddress.address),
          registrationCity: cleanText(shippingAddress.city),
          registrationCountry: 'TR',
          registrationZipCode: '34000'
        },
        shippingAddress: {
          contactName: cleanText(shippingAddress.fullName || `${shippingAddress.name || ''} ${shippingAddress.surname || ''}`),
          city: cleanText(shippingAddress.city),
          country: 'TR',
          address: cleanText(shippingAddress.address),
          zipCode: '34000'
        },
        billingAddress: {
          contactName: cleanText(shippingAddress.fullName || `${shippingAddress.name || ''} ${shippingAddress.surname || ''}`),
          city: cleanText(shippingAddress.city),
          country: 'TR',
          address: cleanText(shippingAddress.address),
          zipCode: '34000'
        },
        basketItems: [
          ...items.map((item: any, index: number) => {
            // İngilizce dilde USD tutar, Türkçe dilde TRY tutar
            const itemPrice = language === 'en' 
              ? item.price + (item.embroideryPrice || 0) // USD tutar
              : item.price + (item.embroideryPrice || 0) // TRY tutar
            
            return {
              id: `item_${index}`,
              name: cleanText(item.name),
              category1: 'Denizcilik Tekstili',
              itemType: 'PHYSICAL',
              price: (itemPrice * item.quantity).toFixed(2),
              // Store additional product info for callback
              productId: item.id,
              size: item.size,
              color: item.color,
              hasEmbroidery: item.hasEmbroidery,
              embroideryFile: item.embroideryFile,
              embroideryPrice: item.embroideryPrice,
              categoryName: item.categoryName,
              brandName: item.brandName
            }
          }),
          {
            id: 'shipping',
            name: t_content.shippingCategory,
            category1: t_content.shippingCategory,
            itemType: 'PHYSICAL',
            price: (language === 'en' ? getShippingCost() : getShippingCostTRY()).toFixed(2)
          }
        ]
      }

      console.log('Iyzico Request:', JSON.stringify(iyzicoRequest, null, 2))

      // First create order with pending payment status
      const orderData = {
        userId: user ? user.id : null,
        totalPrice: totalPrice,
        status: 'received',
        paymentStatus: 'pending',
        paymentMethod: 'iyzico',
        shippingAddress: shippingAddress,
        language: language, // Seçilen dil
        items: [
          ...items.map(item => ({
            productId: item.id,
            productName: item.name,
            productPrice: item.price, // Sadece ürün fiyatı
            productImage: item.image,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            hasEmbroidery: item.hasEmbroidery || false,
            embroideryFile: item.embroideryFile || null,
            embroideryPrice: item.embroideryPrice || 0, // Nakış fiyatı ayrı
            categoryName: item.categoryName,
            brandName: item.brandName,
            isShipping: false,
            shippingCost: 0
          })),
          // Kargo ücreti
          {
            productId: 'shipping',
            productName: t_content.shippingCost,
            productPrice: getShippingCost(), // Dil bazlı değer
            productImage: null,
            quantity: 1,
            size: null,
            color: null,
            hasEmbroidery: false,
            embroideryFile: null,
            embroideryPrice: 0,
            categoryName: t_content.shippingCategory,
            brandName: null,
            isShipping: true,
              shippingCost: language === 'en' ? getShippingCostUSD() : getShippingCostTRY()
          }
        ]
      }

      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const orderResult = await orderResponse.json()

      if (!orderResult.success) {
        alert(orderResult.error || t_content.orderError)
        return
      }

      // Update conversationId with order ID
      iyzicoRequest.conversationId = orderResult.order.id

      // Create payment with Iyzico
      const response = await fetch('/api/iyzico/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(iyzicoRequest),
      })

      const result = await response.json()

      if (result.status === 'success' && result.paymentPageUrl) {
        // Save Iyzico token to order for callback lookup
        if (result.token) {
          await fetch('/api/orders/update-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: orderResult.order.id,
              iyzicoToken: result.token,
            }),
          })
        }
        
        // Redirect to Iyzico payment page
        window.location.href = result.paymentPageUrl
      } else {
        console.error('Iyzico Error:', result)
        alert(result.errorMessage || t_content.paymentError)
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert(t_content.paymentProcessError)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t_content.emptyCart}</h1>
            <p className="text-gray-600 mb-8">
              {t_content.emptyCartDesc}
            </p>
            <Link href="/products">
              <Button size="lg">
                {t_content.viewProducts}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t_content.loading}</p>
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
            <Link href="/cart">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t_content.backToCart}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{t_content.completeOrder}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  {t_content.deliveryInfo}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user ? (
                  // Logged in user - address selection
                  <div className="space-y-4">
                    {addresses.length > 0 ? (
                      <>
                        <div className="space-y-3">
                          {addresses.map((address) => (
                            <div
                              key={address.id}
                              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                selectedAddressId === address.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedAddressId(address.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{address.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {address.fullName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {address.address}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {address.district}, {address.city}, {address.country}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {address.phone}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                  {address.isDefault && (
                                    <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                                      {t_content.defaultAddress}
                                    </span>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditAddress(address)
                                    }}
                                    className="h-8 px-2"
                                  >
                                    <Edit className="w-3 h-3 mr-1" />
                                    {t_content.edit}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <Button
                          variant="outline"
                          onClick={() => setShowAddressModal(true)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {t_content.addNewAddress}
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">{t_content.noAddress}</p>
                        <Button onClick={() => setShowAddressModal(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          {t_content.addFirstAddress}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  // Guest user - address form
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="guest-fullName">{t_content.fullName} *</Label>
                        <Input
                          id="guest-fullName"
                          value={guestForm.fullName}
                          onChange={(e) => handleGuestInputChange('fullName', e.target.value)}
                          placeholder={t_content.fullName}
                        />
                      </div>
                      <div>
                        <Label htmlFor="guest-email">{t_content.email} *</Label>
                        <Input
                          id="guest-email"
                          type="email"
                          value={guestForm.email}
                          onChange={(e) => handleGuestInputChange('email', e.target.value)}
                          placeholder="example@email.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="guest-phone">{t_content.phone} *</Label>
                      <Input
                        id="guest-phone"
                        value={guestForm.phone}
                        onChange={(e) => handleGuestInputChange('phone', e.target.value)}
                        placeholder="0555 123 45 67"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="guest-country">{t_content.country} *</Label>
                        <Select value={guestForm.country} onValueChange={(value) => handleGuestInputChange('country', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t_content.selectCountry} />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="guest-city">{t_content.city} *</Label>
                        <Input
                          id="guest-city"
                          value={guestForm.city}
                          onChange={(e) => handleGuestInputChange('city', e.target.value)}
                          placeholder={t_content.city}
                        />
                      </div>
                      <div>
                        <Label htmlFor="guest-district">{t_content.district} *</Label>
                        <Input
                          id="guest-district"
                          value={guestForm.district}
                          onChange={(e) => handleGuestInputChange('district', e.target.value)}
                          placeholder={t_content.district}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="guest-address">{t_content.address} *</Label>
                      <Input
                        id="guest-address"
                        value={guestForm.address}
                        onChange={(e) => handleGuestInputChange('address', e.target.value)}
                        placeholder={t_content.addressPlaceholder}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  {t_content.paymentMethod}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Online Ödeme */}
                  <button
                    onClick={() => setPaymentMethod('online')}
                    disabled={!isTurkeySelected()}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      paymentMethod === 'online'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!isTurkeySelected() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center">
                      <CreditCard className="w-6 h-6 text-primary mr-3" />
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900">{t_content.onlinePayment}</h4>
                        <p className="text-sm text-gray-600">
                          {isTurkeySelected() 
                            ? t_content.onlinePaymentDesc
                            : t_content.onlinePaymentDescDisabled
                          }
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Havale/EFT */}
                  <button
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900">{t_content.bankTransfer}</h4>
                        <p className="text-sm text-gray-600">{t_content.bankTransferDesc}</p>
                      </div>
                    </div>
                  </button>
                </div>
                
                {paymentMethod === 'bank_transfer' && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-3">{t_content.bankInfo}</h5>
                    <div className="text-sm text-blue-800 space-y-3">
                      <p><strong>{t_content.bank}</strong> Ziraat Bankası</p>
                      <p><strong>{t_content.accountName}</strong> Abdulkadir Ozan</p>
                      
                      <div className="space-y-2">
                        <div className="p-3 bg-white rounded border">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-blue-900">{t_content.tryAccount}</p>
                            <button
                              onClick={() => handleCopyIban('TR24 0001 0025 7668 8660 7650 05')}
                              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {copiedIban === 'TR24 0001 0025 7668 8660 7650 05' ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>{t_content.copiedText}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>{t_content.copyButton}</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="font-mono text-sm">TR24 0001 0025 7668 8660 7650 05</p>
                        </div>
                        
                        <div className="p-3 bg-white rounded border">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-blue-900">{t_content.usdAccount}</p>
                            <button
                              onClick={() => handleCopyIban('TR94 0001 0025 7668 8660 7650 06')}
                              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {copiedIban === 'TR94 0001 0025 7668 8660 7650 06' ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>{t_content.copiedText}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>{t_content.copyButton}</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="font-mono text-sm">TR94 0001 0025 7668 8660 7650 06</p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-blue-600 mt-2">
                        {t_content.bankNote}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>{t_content.orderSummary}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>{t_content.productCount}</span>
                  <span>{getTotalItems()} {t_content.items}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>{t_content.subtotal}</span>
                  <span>{formatPrice(getTotalPrice(), language)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>{t_content.shipping}</span>
                  <div className="text-right">
                    <div>{formatPrice(getShippingCost(), language)}</div>
                    <div className="text-gray-500 text-xs">
                      {(language === 'tr' ? getShippingCost() === 200 : getShippingCost() === 5)
                        ? t_content.shippingNote
                        : t_content.shippingNoteIntl
                      }
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t_content.total}</span>
                    <span>{formatPrice(getTotalPrice() + getShippingCost(), language)}</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full mt-6 cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={handleProceedToPayment}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {t_content.proceedToPayment}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false)
          setEditingAddress(null)
        }}
        onSubmit={handleAddressModalSubmit}
        editingAddress={editingAddress}
      />
    </div>
  )
}