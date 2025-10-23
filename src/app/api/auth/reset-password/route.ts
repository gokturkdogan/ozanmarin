import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/resend'
import { hashPassword } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, language = 'tr' } = body

    if (!email) {
      return NextResponse.json({ 
        error: 'Email adresi gerekli' 
      }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Güvenlik için kullanıcı yoksa da başarılı mesaj döndür
      return NextResponse.json({
        success: true,
        message: language === 'tr' 
          ? 'Eğer bu email adresi kayıtlıysa, şifre sıfırlama linki gönderildi.' 
          : 'If this email is registered, a password reset link has been sent.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry
      }
    })

    // Generate reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    // Send reset email
    await sendPasswordResetEmail({
      resetUrl: resetUrl,
      customerName: user.name,
      customerEmail: user.email,
      language: language as 'tr' | 'en'
    })

    return NextResponse.json({
      success: true,
      message: language === 'tr' 
        ? 'Şifre sıfırlama linki email adresinize gönderildi.' 
        : 'Password reset link has been sent to your email.'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ 
      error: 'Şifre sıfırlama sırasında bir hata oluştu' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, newPassword } = body

    if (!token || !newPassword) {
      return NextResponse.json({ 
        error: 'Token ve yeni şifre gerekli' 
      }, { status: 400 })
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date() // Token henüz geçerli
        }
      }
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'Geçersiz veya süresi dolmuş token' 
      }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Şifre başarıyla güncellendi'
    })

  } catch (error) {
    console.error('Password update error:', error)
    return NextResponse.json({ 
      error: 'Şifre güncellenirken bir hata oluştu' 
    }, { status: 500 })
  }
}
