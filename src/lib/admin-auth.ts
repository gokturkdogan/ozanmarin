import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth-token')?.value
  
  if (!token) {
    return false
  }

  try {
    const payload = verifyToken(token)
    if (!payload) {
      return false
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { email: true }
    })

    // Admin email kontrolü
    return user?.email === 'admin@ozanmarin.com'
  } catch (error) {
    console.error('Admin auth error:', error)
    return false
  }
}

export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const isAdminUser = await isAdmin(request)
  
  if (!isAdminUser) {
    return NextResponse.json(
      { error: 'Admin yetkisi gerekli' },
      { status: 403 }
    )
  }
  
  return null
}
