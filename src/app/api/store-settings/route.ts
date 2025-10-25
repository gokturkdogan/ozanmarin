import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Public store settings (sadece kargo ücretleri)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country') || 'TR'
    const language = searchParams.get('language') || 'tr'

    // Store settings'i getir
    let settings = await prisma.storeSettings.findFirst()
    
    if (!settings) {
      // Varsayılan değerler
      settings = {
        id: 'default',
        turkeyShippingUSD: 0,
        turkeyShippingTRY: 200,
        internationalShippingUSD: 0,
        internationalShippingTRY: 0,
        embroideryPriceUSD: 0,
        embroideryPriceTRY: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

    // Tüm store settings değerlerini döndür
    return NextResponse.json({ 
      turkeyShippingTRY: Number(settings.turkeyShippingTRY),
      turkeyShippingUSD: Number(settings.turkeyShippingUSD),
      internationalShippingTRY: Number(settings.internationalShippingTRY),
      internationalShippingUSD: Number(settings.internationalShippingUSD),
      embroideryPriceTRY: Number(settings.embroideryPriceTRY),
      embroideryPriceUSD: Number(settings.embroideryPriceUSD)
    })
  } catch (error) {
    console.error('Public store settings getirme hatası:', error)
    return NextResponse.json({ 
      turkeyShippingTRY: 200,
      turkeyShippingUSD: 5,
      internationalShippingTRY: 1000,
      internationalShippingUSD: 30,
      embroideryPriceTRY: 0,
      embroideryPriceUSD: 0
    }, { status: 200 }) // Hata durumunda varsayılan değerler
  }
}
