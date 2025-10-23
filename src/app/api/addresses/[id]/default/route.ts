import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// PUT /api/addresses/[id]/default - Adresi varsayılan yap
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

    // Önce tüm adresleri varsayılan olmaktan çıkar
    await prisma.address.updateMany({
      where: { userId: decoded.userId },
      data: { isDefault: false }
    })

    // Sonra seçilen adresi varsayılan yap
    const address = await prisma.address.update({
      where: { id: id },
      data: { isDefault: true }
    })

    return NextResponse.json({ 
      message: 'Varsayılan adres güncellendi', 
      address 
    })
  } catch (error) {
    console.error('Address default PUT API error:', error)
    return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 })
  }
}
