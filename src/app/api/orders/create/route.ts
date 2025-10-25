import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmationEmail } from '@/lib/resend'
import { z } from 'zod'

// Helper function to get shipping cost from store settings
async function getShippingCost(country: string, language: string): Promise<number> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/store-settings`)
    if (response.ok) {
      const data = await response.json()
      console.log('Store settings data:', data)
      
      // Ülke ve dil bazında kargo ücretini belirle
      if (country === 'TR' || country === 'Türkiye') {
        return language === 'tr' ? data.turkeyShippingTRY : data.turkeyShippingUSD
      } else {
        return language === 'tr' ? data.internationalShippingTRY : data.internationalShippingUSD
      }
    }
  } catch (error) {
    console.error('Error fetching shipping cost:', error)
  }
  
  // Fallback values
  if (country === 'TR' || country === 'Türkiye') {
    return language === 'en' ? 5 : 200
  } else {
    return language === 'en' ? 30 : 1000
  }
}

const orderSchema = z.object({
  userId: z.string().nullable().optional(),
  totalPrice: z.number().positive('Toplam fiyat pozitif olmalı'),
  status: z.string().default('received'),
  paymentStatus: z.string().default('pending'),
  paymentMethod: z.string().default('bank_transfer'),
  shippingAddress: z.object({
    firstName: z.string().min(1, 'Ad gerekli').optional(),
    lastName: z.string().min(1, 'Soyad gerekli').optional(),
    fullName: z.string().min(1, 'Ad soyad gerekli').optional(),
    email: z.string().email('Geçerli email gerekli').optional(),
    phone: z.string().min(1, 'Telefon gerekli'),
    country: z.string().min(1, 'Ülke gerekli'),
    city: z.string().min(1, 'Şehir gerekli'),
    district: z.string().min(1, 'İlçe gerekli'),
    address: z.string().min(1, 'Adres gerekli')
  }).refine((data) => {
    // Either firstName+lastName OR fullName must be provided
    return (data.firstName && data.lastName) || data.fullName
  }, {
    message: 'Ad ve soyad veya tam ad gerekli'
  }),
  language: z.string().default('tr'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Ürün ID gerekli'),
    productName: z.string().min(1, 'Ürün adı gerekli'),
    productPrice: z.number().positive('Ürün fiyatı pozitif olmalı'),
    productImage: z.string().nullable().optional(),
    quantity: z.number().positive('Miktar pozitif olmalı'),
    stockType: z.enum(['piece', 'meter']).default('piece'),
    size: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    hasEmbroidery: z.boolean().default(false),
    embroideryFile: z.string().nullable().optional(),
    embroideryPrice: z.number().default(0),
    categoryName: z.string().optional(),
    brandName: z.string().nullable().optional(),
    isShipping: z.boolean().default(false),
    shippingCost: z.number().default(0)
  }))
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Order create request body:', JSON.stringify(body, null, 2))
    
    const validatedData = orderSchema.parse(body)
    
    const { 
      userId: requestUserId,
      totalPrice,
      status = 'received',
      paymentStatus = 'pending',
      paymentMethod = 'bank_transfer',
      shippingAddress,
      language = 'tr',
      items
    } = validatedData

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
    const calculatedTotalPrice = items.reduce((total: number, item: any) => {
      const itemPrice = item.productPrice + (item.embroideryPrice || 0)
      return total + (itemPrice * item.quantity)
    }, 0)

    // Get shipping cost from store settings
    const shippingCost = await getShippingCost(shippingAddress.country, language)
    console.log('Shipping cost from store settings:', shippingCost)

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: userId || null,
        totalPrice: calculatedTotalPrice + shippingCost,
        status: status,
        paymentStatus: paymentStatus,
        paymentMethod: paymentMethod,
        iyzicoPaymentId: paymentMethod === 'iyzico' ? body.paymentId : null,
        shippingAddress: shippingAddress,
        language: language,
        items: {
          create: [
            // Product items
            ...items.map((item: any) => ({
              productId: item.productId,
              productName: item.productName,
              productPrice: item.productPrice,
              productImage: item.productImage,
              quantity: item.quantity,
              stockType: item.stockType || 'piece',
              size: item.size,
              color: item.color,
              hasEmbroidery: item.hasEmbroidery || false,
              embroideryFile: item.embroideryFile || null,
              embroideryPrice: item.embroideryPrice || 0,
              categoryName: item.categoryName,
              brandName: item.brandName,
              isShipping: false,
              shippingCost: 0
            })),
            // Shipping item
            {
              productId: 'shipping',
              productName: language === 'tr' ? 'Kargo Ücreti' : 'Shipping Cost',
              productPrice: shippingCost,
              productImage: null,
              quantity: 1,
              stockType: 'piece',
              size: null,
              color: null,
              hasEmbroidery: false,
              embroideryFile: null,
              embroideryPrice: 0,
              categoryName: language === 'tr' ? 'Kargo' : 'Shipping',
              brandName: null,
              isShipping: true,
              shippingCost: shippingCost
            }
          ]
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
    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', error.issues)
      return NextResponse.json(
        { 
          error: 'Geçersiz veri', 
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code
          }))
        },
        { status: 400 }
      )
    }
    
    console.error('Order creation error:', error)
    return NextResponse.json({ 
      error: 'Sipariş oluşturulurken bir hata oluştu' 
    }, { status: 500 })
  }
}
