'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Copy, Check } from 'lucide-react'
import { useCartStore } from '@/lib/cart'
import { useLanguage } from '@/lib/language'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'success' | 'failed' | 'loading'>('loading')
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [copiedIban, setCopiedIban] = useState<string | null>(null)
  const { clearCart } = useCartStore()
  const { language, t } = useLanguage()

  // Dil bazlı içerik
  const content = {
    tr: {
      loading: "Ödeme durumu kontrol ediliyor...",
      successTitle: "Sipariş Başarılı!",
      successDesc: "Siparişiniz başarıyla alındı. En kısa sürede hazırlanacaktır. Sipariş detayları e-postanıza gönderilmiştir.",
      continueShopping: "Alışverişe Devam Et",
      viewOrders: "Siparişlerimi Görüntüle",
      failedTitle: "Ödeme Başarısız",
      failedDesc: "Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      tryAgain: "Tekrar Dene",
      bankTransferInfo: "Banka Havalesi Bilgileri",
      bankTransferDesc: "Ödemenizi aşağıdaki hesap bilgilerine yapabilirsiniz:",
      bank: "Banka:",
      accountName: "Hesap Adı:",
      tryAccount: "Türk Lirası Hesabı:",
      usdAccount: "Dolar Hesabı:",
      copyButton: "Kopyala",
      copiedText: "Kopyalandı!",
      bankNote: "Ödeme yaptıktan sonra dekontu WhatsApp'tan gönderebilirsiniz."
    },
    en: {
      loading: "Checking payment status...",
      successTitle: "Order Successful!",
      successDesc: "Your order has been received successfully. It will be prepared as soon as possible. Order details have been sent to your email.",
      continueShopping: "Continue Shopping",
      viewOrders: "View My Orders",
      failedTitle: "Payment Failed",
      failedDesc: "An error occurred during payment. Please try again.",
      tryAgain: "Try Again",
      bankTransferInfo: "Bank Transfer Information",
      bankTransferDesc: "You can make your payment to the following account details:",
      bank: "Bank:",
      accountName: "Account Name:",
      tryAccount: "Turkish Lira Account:",
      usdAccount: "US Dollar Account:",
      copyButton: "Copy",
      copiedText: "Copied!",
      bankNote: "You can send the receipt via WhatsApp after payment."
    }
  }

  const t_content = content[language]

  const handleCopyIban = async (iban: string) => {
    try {
      await navigator.clipboard.writeText(iban)
      setCopiedIban(iban)
      setTimeout(() => setCopiedIban(null), 2000)
    } catch (error) {
      console.error('Failed to copy IBAN:', error)
    }
  }

  useEffect(() => {
    const paymentId = searchParams.get('paymentId')
    const method = searchParams.get('method')

    if (paymentId) {
      setStatus('success')
      setPaymentMethod(method || '')
      // Clear cart when payment is successful
      clearCart()
    } else {
      setStatus('failed')
    }
  }, [searchParams, clearCart])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p>{t_content.loading}</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t_content.successTitle}</h1>
          <p className="text-gray-600 mb-8">
            {t_content.successDesc}
          </p>
          
          {/* Bank Transfer Information */}
          {paymentMethod === 'bank_transfer' && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <h3 className="font-medium text-blue-900 mb-2">{t_content.bankTransferInfo}</h3>
              <p className="text-sm text-blue-800 mb-4">{t_content.bankTransferDesc}</p>
              
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
          
          <div className="space-y-6">
            <Link href="/products">
              <Button size="lg" className="w-full">
                {t_content.continueShopping}
              </Button>
            </Link>
            <Link href="/orders">
              <Button size="lg" variant="outline" className="w-full">
                {t_content.viewOrders}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-red-500 text-4xl">✗</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t_content.failedTitle}</h1>
        <p className="text-gray-600 mb-8">
          {t_content.failedDesc}
        </p>
        <div className="space-y-6">
          <Link href="/checkout">
            <Button size="lg" className="w-full">
              {t_content.tryAgain}
            </Button>
          </Link>
          <Link href="/products">
            <Button size="lg" variant="outline" className="w-full">
              {t_content.continueShopping}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}