import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Ürün adı gerekli'),
  slug: z.string().min(1, 'Slug gerekli'),
  categoryId: z.string().min(1, 'Kategori gerekli'),
  brandId: z.string().optional(),
  price: z.number().positive('Fiyat pozitif olmalı'),
  description: z.string().optional(),
  stock: z.number().int().min(0, 'Stok negatif olamaz'),
  images: z.array(z.string()),
  sizes: z.array(z.string())
})

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = productSchema.parse(body)

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 400 }
      )
    }

    // Check if brand exists (if provided)
    if (validatedData.brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: validatedData.brandId }
      })

      if (!brand) {
        return NextResponse.json(
          { error: 'Marka bulunamadı' },
          { status: 400 }
        )
      }
    }

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        categoryId: validatedData.categoryId,
        brandId: validatedData.brandId || null,
        price: validatedData.price,
        description: validatedData.description || null,
        stock: validatedData.stock,
        images: validatedData.images,
        sizes: validatedData.sizes
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        brand: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({ product, message: 'Ürün başarıyla oluşturuldu' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Ürün oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}
