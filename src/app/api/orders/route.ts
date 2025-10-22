import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { iyzicoService } from '@/lib/iyzico'
import { z } from 'zod'

const orderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number()
  })),
  totalPrice: z.number(),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    zipCode: z.string()
  }),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Get user from token (optional for guest checkout)
    const token = request.cookies.get('auth-token')?.value
    let userId: string | null = null
    
    if (token) {
      const payload = verifyToken(token)
      if (payload) {
        userId = payload.userId
      }
    }

    const body = await request.json()
    const validatedData = orderSchema.parse(body)

    // Create Iyzico payment request
    const paymentRequest = {
      price: validatedData.totalPrice.toString(),
      paidPrice: validatedData.totalPrice.toString(),
      currency: 'TRY',
      basketId: `basket_${Date.now()}`,
      paymentGroup: 'PRODUCT',
      callbackUrl: `${process.env.NEXTAUTH_URL}/orders/callback`,
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: userId || `guest_${Date.now()}`,
        name: validatedData.shippingAddress.firstName,
        surname: validatedData.shippingAddress.lastName,
        email: validatedData.shippingAddress.email,
        phoneNumber: validatedData.shippingAddress.phone,
        identityNumber: '11111111111', // Demo için
        address: validatedData.shippingAddress.address,
        city: validatedData.shippingAddress.city,
        country: 'Turkey',
        zipCode: validatedData.shippingAddress.zipCode
      },
      shippingAddress: {
        contactName: `${validatedData.shippingAddress.firstName} ${validatedData.shippingAddress.lastName}`,
        city: validatedData.shippingAddress.city,
        country: 'Turkey',
        address: validatedData.shippingAddress.address,
        zipCode: validatedData.shippingAddress.zipCode
      },
      billingAddress: {
        contactName: `${validatedData.shippingAddress.firstName} ${validatedData.shippingAddress.lastName}`,
        city: validatedData.shippingAddress.city,
        country: 'Turkey',
        address: validatedData.shippingAddress.address,
        zipCode: validatedData.shippingAddress.zipCode
      },
      basketItems: validatedData.items.map(item => ({
        id: item.id,
        name: item.name,
        category1: 'Denizcilik Tekstili',
        itemType: 'PHYSICAL',
        price: (item.price * item.quantity).toString()
      }))
    }

    // Process payment with Iyzico
    const paymentResponse = await iyzicoService.createPayment(paymentRequest)

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: userId || `guest_${Date.now()}`,
        totalPrice: validatedData.totalPrice,
        status: 'paid', // Demo için direkt paid olarak işaretliyoruz
        iyzicoPaymentId: paymentResponse.paymentId,
        items: validatedData.items,
        shippingAddress: validatedData.shippingAddress
      }
    })

    return NextResponse.json({
      message: 'Sipariş başarıyla oluşturuldu',
      order: {
        id: order.id,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Sipariş oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    // Get user's orders or guest orders
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: userId || undefined },
          { userId: { startsWith: 'guest_' } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: 'Siparişler getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
