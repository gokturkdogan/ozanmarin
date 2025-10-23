import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderStatusUpdateEmail } from '@/lib/resend';

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

    // Send email if status changed
    if (status && updatedOrder) {
      try {
        const shippingAddress = updatedOrder.shippingAddress as any
        const customerEmail = updatedOrder.user?.email || shippingAddress?.email
        const customerName = updatedOrder.user?.name || shippingAddress?.fullName || shippingAddress?.firstName + ' ' + shippingAddress?.lastName

        // Generate tracking URL based on shipping company
        let trackingUrl = ''
        if (updatedOrder.shippingCompany && updatedOrder.trackingNumber) {
          if (updatedOrder.shippingCompany === 'ups') {
            trackingUrl = `https://www.ups.com/track?tracknum=${updatedOrder.trackingNumber}`
          } else if (updatedOrder.shippingCompany === 'yurtici') {
            trackingUrl = `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${updatedOrder.trackingNumber}`
          }
        }

        if (customerEmail) {
          await sendOrderStatusUpdateEmail({
            orderId: updatedOrder.id,
            customerName: customerName,
            customerEmail: customerEmail,
            status: status,
            language: (updatedOrder.language as 'tr' | 'en') || 'tr',
            trackingNumber: updatedOrder.trackingNumber || undefined,
            trackingUrl: trackingUrl || undefined,
            shippingCompany: updatedOrder.shippingCompany || undefined,
            items: updatedOrder.items?.map(item => ({
              name: item.productName,
              quantity: item.quantity,
              price: parseFloat(item.productPrice.toString()),
              size: item.size || undefined,
              color: item.color || undefined,
              hasEmbroidery: item.hasEmbroidery
            })),
            totalPrice: parseFloat(updatedOrder.totalPrice.toString()),
            currency: (updatedOrder.language as 'tr' | 'en') === 'en' ? '$' : '₺'
          })
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
        // Email hatası sipariş güncellemeyi engellemez
      }
    }

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