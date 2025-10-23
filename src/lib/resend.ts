import { Resend } from 'resend'

// Resend instance oluştur
export const resend = new Resend(process.env.RESEND_API_KEY)

// Email template'leri için interface'ler
export interface OrderConfirmationEmailProps {
  orderId: string
  customerName: string
  customerEmail: string
  totalPrice: number
  currency: string
  language: 'tr' | 'en'
  items: Array<{
    name: string
    quantity: number
    price: number
    size?: string
    color?: string
    hasEmbroidery?: boolean
  }>
  shippingAddress: {
    fullName: string
    address: string
    city: string
    country: string
    phone: string
  }
  paymentMethod: string
  paymentStatus: string
}

export interface PasswordResetEmailProps {
  resetUrl: string
  customerName: string
  customerEmail: string
  language: 'tr' | 'en'
}

export interface WelcomeEmailProps {
  customerName: string
  customerEmail: string
  language: 'tr' | 'en'
}

export interface OrderStatusUpdateEmailProps {
  orderId: string
  customerName: string
  customerEmail: string
  status: string
  language: 'tr' | 'en'
  trackingNumber?: string
  trackingUrl?: string
  shippingCompany?: string
  items?: Array<{
    name: string
    quantity: number
    price: number
    size?: string
    color?: string
    hasEmbroidery?: boolean
  }>
  totalPrice?: number
  currency?: string
}

export interface ShippingUpdateEmailProps {
  orderId: string
  customerName: string
  customerEmail: string
  trackingNumber: string
  trackingUrl?: string
  shippingCompany: string
  language: 'tr' | 'en'
}

// Email gönderme fonksiyonları
export async function sendWelcomeEmail(props: WelcomeEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: props.customerEmail,
      subject: props.language === 'tr' 
        ? `Hoş Geldiniz ${props.customerName}!` 
        : `Welcome ${props.customerName}!`,
      html: generateWelcomeHTML(props),
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error('Email gönderilemedi')
    }

    console.log('Welcome email sent:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}

export async function sendOrderConfirmationEmail(props: OrderConfirmationEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: props.customerEmail,
      subject: props.language === 'tr' 
        ? `Sipariş Onayı - #${props.orderId}` 
        : `Order Confirmation - #${props.orderId}`,
      html: generateOrderConfirmationHTML(props),
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error('Email gönderilemedi')
    }

    console.log('Order confirmation email sent:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}

export async function sendPasswordResetEmail(props: PasswordResetEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: props.customerEmail,
      subject: props.language === 'tr' 
        ? 'Şifre Sıfırlama' 
        : 'Password Reset',
      html: generatePasswordResetHTML(props),
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error('Email gönderilemedi')
    }

    console.log('Password reset email sent:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}

// HTML template fonksiyonları
function generateWelcomeHTML(props: WelcomeEmailProps): string {
  const isTurkish = props.language === 'tr'
  
  const content = {
    tr: {
      title: 'Hoş Geldiniz!',
      welcome: 'Ozan Marin Denizcilik Tekstili ailesine hoş geldiniz!',
      description: 'Artık denizcilik tekstili ürünlerimizi keşfedebilir, sipariş verebilir ve özel fırsatlardan yararlanabilirsiniz.',
      features: {
        title: 'Neler Yapabilirsiniz?',
        products: 'Geniş ürün yelpazemizi keşfedin',
        orders: 'Kolay sipariş verme sistemi',
        tracking: 'Siparişlerinizi takip edin',
        support: '7/24 müşteri desteği'
      },
      cta: 'Ürünleri Keşfet',
      footer: 'Ozan Marin Denizcilik Tekstili'
    },
    en: {
      title: 'Welcome!',
      welcome: 'Welcome to the Ozan Marin Marine Textiles family!',
      description: 'You can now explore our marine textile products, place orders, and benefit from special offers.',
      features: {
        title: 'What Can You Do?',
        products: 'Explore our wide product range',
        orders: 'Easy ordering system',
        tracking: 'Track your orders',
        support: '24/7 customer support'
      },
      cta: 'Explore Products',
      footer: 'Ozan Marin Marine Textiles'
    }
  }

  const t = content[props.language]

  return `
    <!DOCTYPE html>
    <html lang="${props.language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t.title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .welcome-text { font-size: 1.2em; margin-bottom: 20px; }
        .features { margin: 30px 0; }
        .feature-item { margin: 15px 0; padding: 10px; background: white; border-radius: 6px; border-left: 4px solid #1e40af; }
        .cta-button { display: inline-block; background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${t.title}</h1>
        <h2>${props.customerName}</h2>
      </div>
      
      <div class="content">
        <div class="welcome-text">
          <p><strong>${t.welcome}</strong></p>
          <p>${t.description}</p>
        </div>

        <div class="features">
          <h3>${t.features.title}</h3>
          <div class="feature-item">
            <strong>🏷️ ${t.features.products}</strong>
          </div>
          <div class="feature-item">
            <strong>🛒 ${t.features.orders}</strong>
          </div>
          <div class="feature-item">
            <strong>📦 ${t.features.tracking}</strong>
          </div>
          <div class="feature-item">
            <strong>💬 ${t.features.support}</strong>
          </div>
        </div>

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/products" class="cta-button">
            ${t.cta}
          </a>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p>${isTurkish ? 'Tekrar hoş geldiniz!' : 'Welcome again!'}</p>
          <p>${isTurkish ? 'Ozan Marin Ekibi' : 'Ozan Marin Team'}</p>
        </div>
      </div>

      <div class="footer">
        <p>${t.footer}</p>
        <p>Sülüntepe mahallesi mevlana caddesi Seyit sokak no:14 Pendik İstanbul</p>
        <p>+90 531 336 17 47 | ozanmarinn@gmail.com</p>
      </div>
    </body>
    </html>
  `
}

function generateOrderConfirmationHTML(props: OrderConfirmationEmailProps): string {
  const isTurkish = props.language === 'tr'
  
  const content = {
    tr: {
      title: 'Sipariş Onayı',
      orderNumber: 'Sipariş Numarası',
      customerInfo: 'Müşteri Bilgileri',
      shippingAddress: 'Teslimat Adresi',
      paymentInfo: 'Ödeme Bilgileri',
      items: 'Sipariş Detayları',
      product: 'Ürün',
      quantity: 'Miktar',
      price: 'Fiyat',
      total: 'Toplam',
      thankYou: 'Teşekkür ederiz!',
      footer: 'Ozan Marin Denizcilik Tekstili'
    },
    en: {
      title: 'Order Confirmation',
      orderNumber: 'Order Number',
      customerInfo: 'Customer Information',
      shippingAddress: 'Shipping Address',
      paymentInfo: 'Payment Information',
      items: 'Order Details',
      product: 'Product',
      quantity: 'Quantity',
      price: 'Price',
      total: 'Total',
      thankYou: 'Thank you!',
      footer: 'Ozan Marin Marine Textiles'
    }
  }

  const t = content[props.language]

  return `
    <!DOCTYPE html>
    <html lang="${props.language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t.title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        .section { margin-bottom: 20px; }
        .section h3 { color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
        .item-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .total-row { font-weight: bold; font-size: 1.1em; color: #1e40af; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${t.title}</h1>
        <p>${t.orderNumber}: #${props.orderId}</p>
      </div>
      
      <div class="content">
        <div class="section">
          <h3>${t.customerInfo}</h3>
          <p><strong>${props.customerName}</strong></p>
          <p>${props.customerEmail}</p>
        </div>

        <div class="section">
          <h3>${t.shippingAddress}</h3>
          <p>${props.shippingAddress.fullName}</p>
          <p>${props.shippingAddress.address}</p>
          <p>${props.shippingAddress.city}, ${props.shippingAddress.country}</p>
          <p>${props.shippingAddress.phone}</p>
        </div>

        <div class="section">
          <h3>${t.paymentInfo}</h3>
          <p><strong>${isTurkish ? 'Ödeme Yöntemi' : 'Payment Method'}:</strong> ${props.paymentMethod}</p>
          <p><strong>${isTurkish ? 'Durum' : 'Status'}:</strong> ${props.paymentStatus}</p>
        </div>

        <div class="section">
          <h3>${t.items}</h3>
          ${props.items.map(item => `
            <div class="item-row">
              <div>
                <strong>${item.name}</strong>
                ${item.size ? `<br><small>${isTurkish ? 'Boyut' : 'Size'}: ${item.size}</small>` : ''}
                ${item.color ? `<br><small>${isTurkish ? 'Renk' : 'Color'}: ${item.color}</small>` : ''}
                ${item.hasEmbroidery ? `<br><small style="color: #3b82f6;">✓ ${isTurkish ? 'Nakışlı' : 'Embroidered'}</small>` : ''}
              </div>
              <div>
                ${item.quantity} × ${props.currency}${item.price.toFixed(2)}
              </div>
            </div>
          `).join('')}
          <div class="item-row total-row">
            <div>${t.total}</div>
            <div>${props.currency}${props.totalPrice.toFixed(2)}</div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <h2>${t.thankYou}</h2>
          <p>${isTurkish ? 'Siparişiniz en kısa sürede hazırlanacaktır.' : 'Your order will be prepared as soon as possible.'}</p>
        </div>
      </div>

      <div class="footer">
        <p>${t.footer}</p>
        <p>Sülüntepe mahallesi mevlana caddesi Seyit sokak no:14 Pendik İstanbul</p>
        <p>+90 531 336 17 47 | ozanmarinn@gmail.com</p>
      </div>
    </body>
    </html>
  `
}

function generatePasswordResetHTML(props: PasswordResetEmailProps): string {
  const isTurkish = props.language === 'tr'
  
  return `
    <!DOCTYPE html>
    <html lang="${props.language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isTurkish ? 'Şifre Sıfırlama' : 'Password Reset'}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; }
        .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${isTurkish ? 'Şifre Sıfırlama' : 'Password Reset'}</h1>
      </div>
      
      <div class="content">
        <h2>Merhaba ${props.customerName}!</h2>
        <p>${isTurkish 
          ? 'Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:' 
          : 'Click the button below to reset your password:'}</p>
        
        <a href="${props.resetUrl}" class="button">
          ${isTurkish ? 'Şifremi Sıfırla' : 'Reset Password'}
        </a>
        
        <p style="margin-top: 30px; font-size: 0.9em; color: #6b7280;">
          ${isTurkish 
            ? 'Bu link 24 saat geçerlidir. Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.' 
            : 'This link is valid for 24 hours. If you did not request this, you can ignore this email.'}
        </p>
      </div>

      <div class="footer">
        <p>Ozan Marin Denizcilik Tekstili</p>
        <p>Sülüntepe mahallesi mevlana caddesi Seyit sokak no:14 Pendik İstanbul</p>
        <p>+90 531 336 17 47 | ozanmarinn@gmail.com</p>
      </div>
    </body>
    </html>
  `
}

export async function sendOrderStatusUpdateEmail(props: OrderStatusUpdateEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: props.customerEmail,
      subject: props.language === 'tr' 
        ? `Sipariş Durumu Güncellendi - #${props.orderId}` 
        : `Order Status Updated - #${props.orderId}`,
      html: generateOrderStatusUpdateHTML(props),
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error('Email gönderilemedi')
    }

    console.log('Order status update email sent:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}

export async function sendShippingUpdateEmail(props: ShippingUpdateEmailProps) {
  try {
    const { data, error} = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: props.customerEmail,
      subject: props.language === 'tr' 
        ? `Kargo Bilgileri - #${props.orderId}` 
        : `Shipping Information - #${props.orderId}`,
      html: generateShippingUpdateHTML(props),
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error('Email gönderilemedi')
    }

    console.log('Shipping update email sent:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}

function generateOrderStatusUpdateHTML(props: OrderStatusUpdateEmailProps): string {
  const isTurkish = props.language === 'tr'
  
  const statusTexts = {
    tr: {
      received: 'Sipariş Alındı',
      preparing: 'Hazırlanıyor',
      shipped: 'Kargoya Verildi',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi'
    },
    en: {
      received: 'Order Received',
      preparing: 'Preparing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    }
  }

  const statusText = statusTexts[props.language][props.status as keyof typeof statusTexts.tr] || props.status

  return `
    <!DOCTYPE html>
    <html lang="${props.language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isTurkish ? 'Sipariş Durumu Güncellendi' : 'Order Status Updated'}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        .status-badge { display: inline-block; padding: 10px 20px; background: #10b981; color: white; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .info-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #1e40af; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${isTurkish ? 'Sipariş Durumu Güncellendi' : 'Order Status Updated'}</h1>
        <p>${isTurkish ? 'Sipariş Numarası' : 'Order Number'}: #${props.orderId}</p>
      </div>
      
      <div class="content">
        <h2>${isTurkish ? 'Merhaba' : 'Hello'} ${props.customerName}!</h2>
        <p>${isTurkish 
          ? 'Siparişinizin durumu güncellendi:' 
          : 'Your order status has been updated:'}</p>
        
        <div class="status-badge">
          <strong>${statusText}</strong>
        </div>
        
        ${props.trackingNumber ? `
          <div class="info-box">
            <h3>${isTurkish ? 'Kargo Bilgileri' : 'Shipping Information'}</h3>
            ${props.shippingCompany ? `<p><strong>${isTurkish ? 'Kargo Şirketi' : 'Shipping Company'}:</strong> ${props.shippingCompany}</p>` : ''}
            <p><strong>${isTurkish ? 'Takip Numarası' : 'Tracking Number'}:</strong> ${props.trackingNumber}</p>
            ${props.trackingUrl ? `
              <p><a href="${props.trackingUrl}" style="color: #1e40af; text-decoration: none;">${isTurkish ? 'Kargonu Takip Et' : 'Track Your Package'} →</a></p>
            ` : ''}
          </div>
        ` : ''}

        ${props.items && props.items.length > 0 ? `
          <div class="info-box">
            <h3>${isTurkish ? 'Sipariş İçeriği' : 'Order Contents'}</h3>
            ${props.items.map(item => `
              <div style="border-bottom: 1px solid #e5e7eb; padding: 15px 0;">
                <p><strong>${item.name}</strong></p>
                <p>${isTurkish ? 'Miktar' : 'Quantity'}: ${item.quantity}</p>
                ${item.size ? `<p>${isTurkish ? 'Boyut' : 'Size'}: ${item.size}</p>` : ''}
                ${item.color ? `<p>${isTurkish ? 'Renk' : 'Color'}: ${item.color}</p>` : ''}
                ${item.hasEmbroidery ? `<p style="color: #1e40af;">✓ ${isTurkish ? 'Nakışlı' : 'With Embroidery'}</p>` : ''}
                <p><strong>${isTurkish ? 'Fiyat' : 'Price'}: ${props.currency || (isTurkish ? '₺' : '$')}${item.price.toLocaleString(isTurkish ? 'tr-TR' : 'en-US')}</strong></p>
              </div>
            `).join('')}
            ${props.totalPrice ? `
              <div style="border-top: 2px solid #1e40af; padding-top: 15px; margin-top: 15px;">
                <p style="font-size: 18px; font-weight: bold; color: #1e40af;">
                  ${isTurkish ? 'Toplam' : 'Total'}: ${props.currency || (isTurkish ? '₺' : '$')}${props.totalPrice.toLocaleString(isTurkish ? 'tr-TR' : 'en-US')}
                </p>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <p style="margin-top: 30px;">
          ${isTurkish 
            ? 'Siparişinizle ilgili sorularınız için bizimle iletişime geçebilirsiniz.' 
            : 'Please contact us if you have any questions about your order.'}
        </p>
      </div>

      <div class="footer">
        <p>${isTurkish ? 'Ozan Marin Denizcilik Tekstili' : 'Ozan Marin Marine Textiles'}</p>
        <p>Sülüntepe mahallesi mevlana caddesi Seyit sokak no:14 Pendik İstanbul</p>
        <p>+90 531 336 17 47 | ozanmarinn@gmail.com</p>
      </div>
    </body>
    </html>
  `
}

function generateShippingUpdateHTML(props: ShippingUpdateEmailProps): string {
  const isTurkish = props.language === 'tr'

  return `
    <!DOCTYPE html>
    <html lang="${props.language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isTurkish ? 'Kargo Bilgileri' : 'Shipping Information'}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981; }
        .track-button { display: inline-block; padding: 12px 30px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📦 ${isTurkish ? 'Siparişiniz Kargoya Verildi!' : 'Your Order Has Been Shipped!'}</h1>
        <p>${isTurkish ? 'Sipariş Numarası' : 'Order Number'}: #${props.orderId}</p>
      </div>
      
      <div class="content">
        <h2>${isTurkish ? 'Merhaba' : 'Hello'} ${props.customerName}!</h2>
        <p>${isTurkish 
          ? 'Harika haber! Siparişiniz kargoya verildi ve yakında sizinle olacak.' 
          : 'Great news! Your order has been shipped and will be with you soon.'}</p>
        
        <div class="info-box">
          <h3>${isTurkish ? 'Kargo Bilgileri' : 'Shipping Information'}</h3>
          <p><strong>${isTurkish ? 'Kargo Şirketi' : 'Shipping Company'}:</strong> ${props.shippingCompany}</p>
          <p><strong>${isTurkish ? 'Takip Numarası' : 'Tracking Number'}:</strong> ${props.trackingNumber}</p>
        </div>

        ${props.trackingUrl ? `
          <div style="text-align: center;">
            <a href="${props.trackingUrl}" class="track-button">
              ${isTurkish ? 'Kargonu Takip Et' : 'Track Your Package'}
            </a>
          </div>
        ` : ''}

        <p style="margin-top: 30px;">
          ${isTurkish 
            ? 'Kargonuz hakkında sorularınız için bizimle iletişime geçebilirsiniz.' 
            : 'Please contact us if you have any questions about your shipment.'}
        </p>
      </div>

      <div class="footer">
        <p>${isTurkish ? 'Ozan Marin Denizcilik Tekstili' : 'Ozan Marin Marine Textiles'}</p>
        <p>Sülüntepe mahallesi mevlana caddesi Seyit sokak no:14 Pendik İstanbul</p>
        <p>+90 531 336 17 47 | ozanmarinn@gmail.com</p>
      </div>
    </body>
    </html>
  `
}
