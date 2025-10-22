import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId: requestUserId,
      totalPrice,
      status = 'received',
      paymentStatus = 'pending',
      paymentMethod = 'bank_transfer',
      shippingAddress,
      items
    } = body

    // Validate required fields
    if (!totalPrice || !shippingAddress || !items) {
      return NextResponse.json({ 
        error: 'Gerekli bilgiler eksik' 
      }, { status: 400 })
    }

    let userId = requestUserId

    // Check if user is logged in
    const token = request.cookies.get('auth-token')?.value
    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        userId = decoded.userId
      }
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: userId,
        totalPrice: totalPrice,
        status: status,
        paymentStatus: paymentStatus,
        paymentMethod: paymentMethod,
        iyzicoPaymentId: paymentMethod === 'iyzico' ? body.paymentId : null,
        shippingAddress: shippingAddress,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            productPrice: item.productPrice,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            hasEmbroidery: item.hasEmbroidery || false,
            embroideryFile: item.embroideryFile,
            embroideryPrice: item.embroideryPrice || 0
          }))
        }
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

    return NextResponse.json({
      success: true,
      order: order,
      message: 'Sipariş başarıyla oluşturuldu'
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ 
      error: 'Sipariş oluşturulurken bir hata oluştu' 
    }, { status: 500 })
  }
}
