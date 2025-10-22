import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { orderId, status, paymentStatus } = await request.json();

    if (!orderId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sipariş ID gereklidir.' 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    // Update status if provided
    if (status) {
      const validStatuses = ['received', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Geçersiz sipariş durumu.' 
        }, { status: 400 });
      }
      updateData.status = status;
    }

    // Update payment status if provided
    if (paymentStatus) {
      const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Geçersiz ödeme durumu.' 
        }, { status: 400 });
      }
      updateData.paymentStatus = paymentStatus;
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      message: 'Sipariş durumu başarıyla güncellendi.' 
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Sipariş durumu güncellenirken bir hata oluştu.' 
    }, { status: 500 });
  }
}
