import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendShippingUpdateEmail } from '@/lib/resend';

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

    // Send email if tracking number is provided
    if (trackingNumber && shippingCompany && shippingCompany !== 'none' && updatedOrder) {
      try {
        const shippingAddress = updatedOrder.shippingAddress as any
        const customerEmail = updatedOrder.user?.email || shippingAddress?.email
        const customerName = updatedOrder.user?.name || shippingAddress?.fullName || shippingAddress?.firstName + ' ' + shippingAddress?.lastName

        // Generate tracking URL based on shipping company
        let trackingUrl = ''
        if (shippingCompany === 'ups') {
          trackingUrl = `https://www.ups.com/track?tracknum=${trackingNumber}`
        } else if (shippingCompany === 'yurtici') {
          trackingUrl = `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${trackingNumber}`
        }

        // Get shipping company name
        const shippingCompanyNames = {
          ups: 'UPS',
          yurtici: 'Yurtiçi Kargo'
        }
        const shippingCompanyName = shippingCompanyNames[shippingCompany as keyof typeof shippingCompanyNames] || shippingCompany

        if (customerEmail) {
          await sendShippingUpdateEmail({
            orderId: updatedOrder.id,
            customerName: customerName,
            customerEmail: customerEmail,
            trackingNumber: trackingNumber,
            trackingUrl: trackingUrl || undefined,
            shippingCompany: shippingCompanyName,
            language: (updatedOrder.language as 'tr' | 'en') || 'tr'
          })
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
        // Email hatası kargo bilgisi güncellemeyi engellemez
      }
    }

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
