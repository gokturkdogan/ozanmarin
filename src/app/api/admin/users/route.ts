import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    // Admin kontrolü
    const adminError = await requireAdmin(request)
    if (adminError) return adminError

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json(
      { error: 'Kullanıcılar getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
