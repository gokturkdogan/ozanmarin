import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from token (optional for guest orders)
    const token = request.cookies.get('auth-token')?.value
    let userId: string | null = null
    
    if (token) {
      const payload = verifyToken(token)
      if (payload) {
        userId = payload.userId
      }
    }

    const { id } = await params

    // Get order - allow access if user owns it or if it's a guest order
    const order = await prisma.order.findFirst({
      where: {
        id,
        OR: [
          { userId: userId || undefined },
          { userId: { startsWith: 'guest_' } }
        ]
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json(
      { error: 'Sipariş getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
