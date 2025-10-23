import { NextRequest, NextResponse } from 'next/server'
import { resend } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html } = body

    if (!to || !subject || !html) {
      return NextResponse.json({ 
        error: 'to, subject ve html alanları gerekli' 
      }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: to,
      subject: subject,
      html: html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ 
        error: 'Email gönderilemedi',
        details: error 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: 'Email başarıyla gönderildi'
    })

  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json({ 
      error: 'Email gönderilirken bir hata oluştu' 
    }, { status: 500 })
  }
}
