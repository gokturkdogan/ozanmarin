import { NextRequest, NextResponse } from 'next/server'
import { iyzicoService } from '@/lib/iyzico'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartItems, shippingAddress, guestUser } = body

    // Validate required fields
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'Sepet boş olamaz' }, { status: 400 })
    }

    if (!shippingAddress) {
      return NextResponse.json({ error: 'Teslimat adresi gerekli' }, { status: 400 })
    }

    let user = null
    let userId = null

    // Check if user is logged in
    const token = request.cookies.get('auth-token')?.value
    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        })
        userId = decoded.userId
      }
    }

    // If no logged in user, use guest data
    if (!user && !guestUser) {
      return NextResponse.json({ error: 'Kullanıcı bilgileri gerekli' }, { status: 400 })
    }

    // Calculate total price
    const totalPrice = cartItems.reduce((total: number, item: any) => {
      const itemPrice = item.price + (item.embroideryPrice || 0)
      return total + (itemPrice * item.quantity)
    }, 0)

    // Calculate shipping cost
    const shippingCost = shippingAddress.country === 'Türkiye' ? 200 : 1000
    const finalTotal = totalPrice + shippingCost

    // Prepare buyer information - Clean Turkish characters
    const cleanText = (text: string) => {
      return text.replace(/[çğıöşüÇĞIİÖŞÜ]/g, (match) => {
        const map: { [key: string]: string } = {
          'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
          'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
        }
        return map[match] || match
      })
    }

    const buyerInfo = user ? {
      id: user.id,
      name: cleanText(user.name.split(' ')[0] || user.name),
      surname: cleanText(user.name.split(' ').slice(1).join(' ') || ''),
      email: user.email,
      phoneNumber: shippingAddress.phone ? `+90${shippingAddress.phone.replace(/^0/, '')}` : '+905551234567',
      identityNumber: '11111111111',
      address: cleanText(shippingAddress.address),
      city: cleanText(shippingAddress.city),
      country: 'TR',
      zipCode: '34000'
    } : {
      id: `guest_${Date.now()}`,
      name: cleanText(guestUser.fullName.split(' ')[0] || guestUser.fullName),
      surname: cleanText(guestUser.fullName.split(' ').slice(1).join(' ') || ''),
      email: guestUser.email,
      phoneNumber: guestUser.phone ? `+90${guestUser.phone.replace(/^0/, '')}` : '+905551234567',
      identityNumber: '11111111111',
      address: cleanText(guestUser.address),
      city: cleanText(guestUser.city),
      country: 'TR',
      zipCode: '34000'
    }

    // Prepare basket items
    const basketItems = cartItems.map((item: any, index: number) => ({
      id: `item_${index}`,
      name: item.name,
      category1: 'Denizcilik Tekstili',
      itemType: 'PHYSICAL',
      price: ((item.price + (item.embroideryPrice || 0)) * item.quantity).toFixed(2)
    }))

    // Add shipping as basket item
    basketItems.push({
      id: 'shipping',
      name: 'Kargo',
      category1: 'Kargo',
      itemType: 'PHYSICAL',
      price: shippingCost.toFixed(2)
    })

    // Create Iyzico payment request
    const paymentRequest = {
      price: finalTotal.toFixed(2),
      paidPrice: finalTotal.toFixed(2),
      currency: 'TRY',
      basketId: `basket_${Date.now()}`,
      paymentGroup: 'PRODUCT',
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/callback`,
      enabledInstallments: [1, 2, 3, 6, 9, 12],
      buyer: buyerInfo,
      shippingAddress: {
        contactName: cleanText(buyerInfo.name + ' ' + buyerInfo.surname),
        city: cleanText(buyerInfo.city),
        country: 'TR',
        address: cleanText(buyerInfo.address),
        zipCode: buyerInfo.zipCode
      },
      billingAddress: {
        contactName: cleanText(buyerInfo.name + ' ' + buyerInfo.surname),
        city: cleanText(buyerInfo.city),
        country: 'TR',
        address: cleanText(buyerInfo.address),
        zipCode: buyerInfo.zipCode
      },
      basketItems
    }

    // Create payment with Iyzico
    const paymentResponse = await iyzicoService.createPayment(paymentRequest)

    if (paymentResponse.status === 'success') {
      // Store payment info temporarily (you might want to store this in Redis or database)
      const paymentData = {
        paymentId: paymentResponse.paymentId,
        conversationId: paymentResponse.conversationId,
        totalPrice: finalTotal,
        cartItems,
        shippingAddress,
        userId,
        guestUser,
        createdAt: new Date().toISOString()
      }

      // In a real implementation, you would store this in Redis or database
      // For now, we'll return the payment URL
      return NextResponse.json({
        success: true,
        paymentId: paymentResponse.paymentId,
        paymentUrl: paymentResponse.url || '/payment/success', // Mock URL
        htmlContent: paymentResponse.htmlContent || '',
        paymentData,
        debug: {
          apiKey: process.env.IYZICO_API_KEY ? 'SET' : 'NOT SET',
          secretKey: process.env.IYZICO_SECRET_KEY ? 'SET' : 'NOT SET',
          baseUrl: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
          request: paymentRequest
        }
      })
    } else {
      return NextResponse.json({ 
        error: 'Ödeme oluşturulamadı',
        debug: {
          apiKey: process.env.IYZICO_API_KEY ? 'SET' : 'NOT SET',
          secretKey: process.env.IYZICO_SECRET_KEY ? 'SET' : 'NOT SET',
          baseUrl: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
        }
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json({ 
      error: 'Ödeme sırasında bir hata oluştu' 
    }, { status: 500 })
  }
}
