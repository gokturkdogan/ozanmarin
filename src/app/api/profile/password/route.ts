import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gerekli'),
  newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalıdır')
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
    const validatedData = passwordChangeSchema.parse(body)

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.passwordHash)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ message: 'Mevcut şifre yanlış' }, { status: 400 })
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(validatedData.newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        passwordHash: newPasswordHash
      }
    })

    return NextResponse.json({
      message: 'Şifre başarıyla değiştirildi'
    })

  } catch (error) {
    console.error('Password change error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        message: 'Geçersiz veri',
        errors: error.issues 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Şifre değiştirilirken bir hata oluştu' 
    }, { status: 500 })
  }
}
