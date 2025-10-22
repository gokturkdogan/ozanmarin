import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Ad soyad gerekli'),
  email: z.string().email('Geçerli bir e-posta adresi girin')
})

export async function PUT(request: NextRequest) {
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
    const validatedData = profileUpdateSchema.parse(body)

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        id: { not: decoded.userId }
      }
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Bu e-posta adresi zaten kullanılıyor' }, { status: 400 })
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name: validatedData.name,
        email: validatedData.email
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    return NextResponse.json({
      message: 'Profil başarıyla güncellendi',
      user: updatedUser
    })

  } catch (error) {
    console.error('Profile update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        message: 'Geçersiz veri',
        errors: error.issues 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Profil güncellenirken bir hata oluştu' 
    }, { status: 500 })
  }
}
