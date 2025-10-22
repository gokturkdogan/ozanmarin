import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params

    // Check if user is logged in
    const token = request.cookies.get('auth-token')?.value
    let userId = null
    
    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        userId = decoded.userId
      }
    }

    // Find order by ID or Iyzico payment ID
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { iyzicoPaymentId: orderId }
        ]
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ 
        error: 'Sipariş bulunamadı' 
      }, { status: 404 })
    }

    // For logged in users, only show their own orders
    // For guest orders, allow access by order ID
    if (userId && order.userId && order.userId !== userId) {
      return NextResponse.json({ 
        error: 'Bu siparişe erişim yetkiniz yok' 
      }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      order: order
    })

  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json({ 
      error: 'Sipariş bilgileri alınırken hata oluştu' 
    }, { status: 500 })
  }
}