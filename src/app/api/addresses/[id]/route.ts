import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const addressUpdateSchema = z.object({
  title: z.string().min(1, 'Adres başlığı gerekli'),
  fullName: z.string().min(1, 'Ad soyad gerekli'),
  phone: z.string().min(1, 'Telefon gerekli'),
  country: z.string().min(1, 'Ülke gerekli'),
  city: z.string().min(1, 'Şehir gerekli'),
  district: z.string().min(1, 'İlçe gerekli'),
  address: z.string().min(1, 'Adres gerekli'),
  isDefault: z.boolean().optional()
})

// GET /api/addresses/[id] - Tek adres getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ message: 'Token bulunamadı' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: 'Geçersiz token' }, { status: 401 })
    }

    const address = await prisma.address.findFirst({
      where: { 
        id: id,
        userId: decoded.userId 
      }
    })

    if (!address) {
      return NextResponse.json({ message: 'Adres bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ address })
  } catch (error) {
    console.error('Address GET API error:', error)
    return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT /api/addresses/[id] - Adres güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ message: 'Token bulunamadı' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: 'Geçersiz token' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = addressUpdateSchema.parse(body)

    // Adresin kullanıcıya ait olduğunu kontrol et
    const existingAddress = await prisma.address.findFirst({
      where: { 
        id: id,
        userId: decoded.userId 
      }
    })

    if (!existingAddress) {
      return NextResponse.json({ message: 'Adres bulunamadı' }, { status: 404 })
    }

    // Eğer varsayılan adres olarak işaretleniyorsa, diğer adresleri varsayılan olmaktan çıkar
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: decoded.userId,
          id: { not: id }
        },
        data: { isDefault: false }
      })
    }

    const address = await prisma.address.update({
      where: { id: id },
      data: validatedData
    })

    return NextResponse.json({ 
      message: 'Adres başarıyla güncellendi', 
      address 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 })
    }
    console.error('Address PUT API error:', error)
    return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 })
  }
}

// DELETE /api/addresses/[id] - Adres sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ message: 'Token bulunamadı' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: 'Geçersiz token' }, { status: 401 })
    }

    // Adresin kullanıcıya ait olduğunu kontrol et
    const existingAddress = await prisma.address.findFirst({
      where: { 
        id: id,
        userId: decoded.userId 
      }
    })

    if (!existingAddress) {
      return NextResponse.json({ message: 'Adres bulunamadı' }, { status: 404 })
    }

    await prisma.address.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Adres başarıyla silindi' })
  } catch (error) {
    console.error('Address DELETE API error:', error)
    return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 })
  }
}