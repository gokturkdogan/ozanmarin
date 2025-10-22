import { NextRequest, NextResponse } from 'next/server'
import { cloudinary } from '@/lib/cloudinary'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Admin kontrolü
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
    }

    // Admin kontrolü için kullanıcıyı veritabanından al
    const { getUserById } = await import('@/lib/auth')
    const user = await getUserById(payload.userId)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }

    // Dosya tipini kontrol et
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Sadece görsel dosyaları yüklenebilir' }, { status: 400 })
    }

    // Dosya boyutunu kontrol et (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dosya boyutu 5MB\'dan küçük olmalı' }, { status: 400 })
    }

    // Dosyayı buffer'a çevir
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Cloudinary'ye upload et
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'ozanmarin/products',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' },
            { format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    return NextResponse.json({ 
      success: true, 
      url: (result as any).secure_url,
      publicId: (result as any).public_id
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Dosya yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
