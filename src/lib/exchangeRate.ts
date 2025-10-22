// Dolar kuru API'si için utility fonksiyonları

interface ExchangeRateResponse {
  success: boolean
  data?: {
    USD: number
  }
  error?: string
}

// TCMB (Türkiye Cumhuriyet Merkez Bankası) API'si
export async function getUSDExchangeRate(): Promise<number> {
  try {
    // TCMB API'si - günlük döviz kurları
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    
    if (!response.ok) {
      throw new Error('Exchange rate API failed')
    }
    
    const data = await response.json()
    const usdToTry = data.rates.TRY
    
    if (!usdToTry || usdToTry <= 0) {
      throw new Error('Invalid exchange rate')
    }
    
    return usdToTry
  } catch (error) {
    console.error('Exchange rate fetch error:', error)
    
    // Fallback: Sabit kur (güncel yaklaşık değer)
    return 34.50
  }
}

// Dolar fiyatını TL'ye çevir (sadece Türkçe için)
export function convertUSDToTRY(usdPrice: number, exchangeRate: number, language: 'tr' | 'en' = 'tr'): number {
  if (language === 'en') {
    return usdPrice // İngilizce için direkt USD değeri
  }
  return usdPrice * exchangeRate // Türkçe için kur ile çarp
}

// Fiyatı formatla (dil bazlı)
export function formatPrice(price: number, language: 'tr' | 'en' = 'tr'): string {
  if (language === 'en') {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `₺${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// TL fiyatını formatla (geriye uyumluluk için)
export function formatTRYPrice(tryPrice: number): string {
  return `₺${tryPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Dolar fiyatını formatla (geriye uyumluluk için)
export function formatUSDPrice(usdPrice: number): string {
  return `$${usdPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
