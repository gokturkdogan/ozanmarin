import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı')
})

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(1, 'Şifre gerekli')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'register') {
      const { name, email, password } = registerSchema.parse(body)
      
      // Email kontrolü
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Bu email adresi zaten kullanılıyor' },
          { status: 400 }
        )
      }

      // Kullanıcı oluştur
      const passwordHash = await hashPassword(password)
      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      })

      const token = generateToken(user)
      
      const response = NextResponse.json({
        message: 'Kayıt başarılı',
        user
      })
      
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 gün
      })
      
      return response
    }

    if (action === 'login') {
      const { email, password } = loginSchema.parse(body)
      
      // Kullanıcı bul
      const user = await prisma.user.findUnique({
        where: { email }
      })
      
      if (!user) {
        return NextResponse.json(
          { error: 'Email veya şifre hatalı' },
          { status: 401 }
        )
      }

      // Şifre kontrolü
      const isValidPassword = await verifyPassword(password, user.passwordHash)
      
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Email veya şifre hatalı' },
          { status: 401 }
        )
      }

      const token = generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      })
      
      const response = NextResponse.json({
        message: 'Giriş başarılı',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        isAdmin: user.role === 'admin'
      })
      
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 // 7 gün
      })
      
      return response
    }

    return NextResponse.json(
      { error: 'Geçersiz işlem' },
      { status: 400 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
