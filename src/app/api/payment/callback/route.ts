import { NextRequest, NextResponse } from 'next/server'
import { iyzicoService } from '@/lib/iyzico'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, conversationId, status } = body

    // Verify payment with Iyzico
    const isPaymentValid = await iyzicoService.verifyPayment(paymentId)

    if (!isPaymentValid || status !== 'success') {
      return NextResponse.json({ 
        error: 'Ödeme doğrulanamadı' 
      }, { status: 400 })
    }

    // In a real implementation, you would retrieve payment data from Redis/database
    // For now, we'll create a mock order
    const mockPaymentData = {
      paymentId,
      conversationId,
      totalPrice: 1000, // This should come from stored payment data
      cartItems: [], // This should come from stored payment data
      shippingAddress: {}, // This should come from stored payment data
      userId: null,
      guestUser: null
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: mockPaymentData.userId || 'guest',
        totalPrice: mockPaymentData.totalPrice,
        status: 'completed',
        iyzicoPaymentId: paymentId,
        shippingAddress: mockPaymentData.shippingAddress
      }
    })

    // Create order items
    for (const item of mockPaymentData.cartItems) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: (item as any).productId || (item as any).id || 'unknown',
          productName: (item as any).name,
          productPrice: (item as any).price,
          quantity: (item as any).quantity,
          size: (item as any).size,
          color: (item as any).color,
          hasEmbroidery: (item as any).hasEmbroidery || false,
          embroideryFile: (item as any).embroideryFile,
          embroideryPrice: (item as any).embroideryPrice || 0
        }
      })
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Sipariş başarıyla oluşturuldu'
    })

  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.json({ 
      error: 'Sipariş oluşturulurken bir hata oluştu' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const status = searchParams.get('status')

    if (!token) {
      return NextResponse.redirect(
        new URL('/payment/failure', request.url)
      )
    }

    // Verify payment with Iyzico
    const isPaymentValid = await iyzicoService.verifyPayment(token)

    if (!isPaymentValid || status !== 'success') {
      return NextResponse.redirect(
        new URL('/payment/failure', request.url)
      )
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/payment/success?paymentId=${token}`, request.url)
    )

  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.redirect(
      new URL('/payment/failure', request.url)
    )
  }
}
