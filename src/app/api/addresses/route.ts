import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const addressSchema = z.object({
  title: z.string().min(1, 'Adres başlığı gerekli'),
  fullName: z.string().min(1, 'Ad soyad gerekli'),
  phone: z.string().min(1, 'Telefon gerekli'),
  country: z.string().min(1, 'Ülke gerekli'),
  city: z.string().min(1, 'Şehir gerekli'),
  district: z.string().min(1, 'İlçe gerekli'),
  address: z.string().min(1, 'Adres gerekli'),
  isDefault: z.boolean().optional()
})

// GET /api/addresses - Kullanıcının adreslerini getir
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ message: 'Token bulunamadı' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: 'Geçersiz token' }, { status: 401 })
    }

    const addresses = await prisma.address.findMany({
      where: { userId: decoded.userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error('Addresses GET API error:', error)
    return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 })
  }
}

// POST /api/addresses - Yeni adres ekle
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ message: 'Token bulunamadı' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: 'Geçersiz token' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = addressSchema.parse(body)

    // Eğer varsayılan adres olarak işaretleniyorsa, diğer adresleri varsayılan olmaktan çıkar
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: { userId: decoded.userId },
        data: { isDefault: false }
      })
    }

    const address = await prisma.address.create({
      data: {
        ...validatedData,
        userId: decoded.userId
      }
    })

    return NextResponse.json({ 
      message: 'Adres başarıyla eklendi', 
      address 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 })
    }
    console.error('Address POST API error:', error)
    return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 })
  }
}
