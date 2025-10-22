import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { orderId, iyzicoToken } = await request.json()

    if (!orderId || !iyzicoToken) {
      return NextResponse.json(
        { success: false, error: 'Order ID ve Iyzico token gerekli' },
        { status: 400 }
      )
    }

    // Update order with Iyzico token
    await prisma.order.update({
      where: { id: orderId },
      data: { iyzicoToken: iyzicoToken },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update token error:', error)
    return NextResponse.json(
      { success: false, error: 'Token güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}
