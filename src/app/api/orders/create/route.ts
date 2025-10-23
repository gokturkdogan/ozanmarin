import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmationEmail } from '@/lib/resend'

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
      language = 'tr',
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

    // Calculate total price from items
    const calculatedTotalPrice = items.reduce((total, item) => {
      const itemPrice = item.productPrice + (item.embroideryPrice || 0)
      return total + (itemPrice * item.quantity)
    }, 0)

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: userId,
        totalPrice: calculatedTotalPrice,
        status: status,
        paymentStatus: paymentStatus,
        paymentMethod: paymentMethod,
        iyzicoPaymentId: paymentMethod === 'iyzico' ? body.paymentId : null,
        shippingAddress: shippingAddress,
        language: language,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            productPrice: item.productPrice,
            productImage: item.productImage,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            hasEmbroidery: item.hasEmbroidery || false,
            embroideryFile: item.embroideryFile || null,
            embroideryPrice: item.embroideryPrice || 0,
            categoryName: item.categoryName,
            brandName: item.brandName,
            isShipping: item.isShipping || false,
            shippingCost: item.shippingCost || 0
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

    // Send confirmation email
    try {
      const customerEmail = order.user?.email || shippingAddress.email
      const customerName = order.user?.name || shippingAddress.fullName || shippingAddress.firstName + ' ' + shippingAddress.lastName
      
      if (customerEmail) {
        await sendOrderConfirmationEmail({
          orderId: order.id,
          customerName: customerName,
          customerEmail: customerEmail,
          totalPrice: parseFloat(order.totalPrice.toString()),
          currency: language === 'en' ? '$' : '₺',
          language: language as 'tr' | 'en',
          items: order.items.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: parseFloat(item.productPrice.toString()) + parseFloat((item.embroideryPrice || 0).toString()),
            size: item.size || undefined,
            color: item.color || undefined,
            hasEmbroidery: item.hasEmbroidery
          })),
          shippingAddress: {
            fullName: shippingAddress.fullName || `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            address: shippingAddress.address,
            city: shippingAddress.city,
            country: shippingAddress.country,
            phone: shippingAddress.phone
          },
          paymentMethod: paymentMethod,
          paymentStatus: paymentStatus
        })
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Email hatası sipariş oluşturmayı engellemez
    }

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
