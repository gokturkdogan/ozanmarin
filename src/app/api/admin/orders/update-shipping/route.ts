import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { orderId, shippingCompany, trackingNumber } = await request.json();

    if (!orderId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sipariş ID gereklidir.' 
      }, { status: 400 });
    }

    // Valid shipping companies
    const validShippingCompanies = ['ups', 'yurtici'];
    if (shippingCompany && shippingCompany !== 'none' && !validShippingCompanies.includes(shippingCompany)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Geçersiz kargo şirketi.' 
      }, { status: 400 });
    }

    // Update order shipping info
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        shippingCompany: shippingCompany && shippingCompany !== 'none' ? shippingCompany : null,
        trackingNumber: trackingNumber || null,
        updatedAt: new Date()
      },
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
      message: 'Kargo bilgileri başarıyla güncellendi.' 
    });
  } catch (error) {
    console.error('Error updating shipping info:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Kargo bilgileri güncellenirken bir hata oluştu.' 
    }, { status: 500 });
  }
}
