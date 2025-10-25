import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const storeSettingsSchema = z.object({
  turkeyShippingUSD: z.union([z.number(), z.string()]).transform(val => Number(val)),
  turkeyShippingTRY: z.union([z.number(), z.string()]).transform(val => Number(val)),
  internationalShippingUSD: z.union([z.number(), z.string()]).transform(val => Number(val)),
  internationalShippingTRY: z.union([z.number(), z.string()]).transform(val => Number(val)),
  embroideryPriceUSD: z.union([z.number(), z.string()]).transform(val => Number(val)),
  embroideryPriceTRY: z.union([z.number(), z.string()]).transform(val => Number(val)),
})

// GET - Store settings'i getir
export async function GET(request: NextRequest) {
  try {
    // Store settings'i getir, yoksa varsayılan değerlerle oluştur
    let settings = await prisma.storeSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          turkeyShippingUSD: 0,
          turkeyShippingTRY: 200,
          internationalShippingUSD: 0,
          internationalShippingTRY: 0,
          embroideryPriceUSD: 0,
          embroideryPriceTRY: 0,
        }
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Store settings getirme hatası:', error)
    return NextResponse.json({ error: 'Store settings getirilirken bir hata oluştu' }, { status: 500 })
  }
}

// PUT - Store settings'i güncelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received data:', body)
    
    const validatedData = storeSettingsSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Store settings'i güncelle veya oluştur
    let settings = await prisma.storeSettings.findFirst()
    
    if (settings) {
      // Mevcut kaydı güncelle
      settings = await prisma.storeSettings.update({
        where: { id: settings.id },
        data: {
          turkeyShippingUSD: validatedData.turkeyShippingUSD,
          turkeyShippingTRY: validatedData.turkeyShippingTRY,
          internationalShippingUSD: validatedData.internationalShippingUSD,
          internationalShippingTRY: validatedData.internationalShippingTRY,
          embroideryPriceUSD: validatedData.embroideryPriceUSD,
          embroideryPriceTRY: validatedData.embroideryPriceTRY,
        }
      })
    } else {
      // Yeni kayıt oluştur
      settings = await prisma.storeSettings.create({
        data: {
          turkeyShippingUSD: validatedData.turkeyShippingUSD,
          turkeyShippingTRY: validatedData.turkeyShippingTRY,
          internationalShippingUSD: validatedData.internationalShippingUSD,
          internationalShippingTRY: validatedData.internationalShippingTRY,
          embroideryPriceUSD: validatedData.embroideryPriceUSD,
          embroideryPriceTRY: validatedData.embroideryPriceTRY,
        }
      })
    }

    return NextResponse.json({ 
      message: 'Store settings başarıyla güncellendi',
      settings 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', error.errors)
      return NextResponse.json({ 
        error: 'Geçersiz veri',
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('Store settings güncelleme hatası:', error)
    return NextResponse.json({ error: 'Store settings güncellenirken bir hata oluştu' }, { status: 500 })
  }
}
