import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const productUpdateSchema = z.object({
  name: z.string().min(1, 'Ürün adı gerekli'),
  nameEn: z.string().optional(),
  slug: z.string().min(1, 'Slug gerekli'),
  slugEn: z.string().optional(),
  categoryId: z.string().min(1, 'Kategori gerekli'),
  brandId: z.string().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  images: z.array(z.string()),
  sizePrices: z.array(z.object({
    size: z.string().min(1, 'Boyut gerekli'),
    price: z.number().positive('Fiyat pozitif olmalı'),
    stock: z.number().int().min(0, 'Stok negatif olamaz')
  })),
  colors: z.array(z.object({
    tr: z.string().min(1, 'Türkçe renk gerekli'),
    en: z.string().min(1, 'İngilizce renk gerekli')
  })),
  stockType: z.enum(['piece', 'meter']).default('piece'),
  hasEmbroidery: z.boolean().default(false)
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        nameEn: true,
        slug: true,
        slugEn: true,
        description: true,
        descriptionEn: true,
        images: true,
        sizePrices: true,
        colors: true,
        stockType: true,
        hasEmbroidery: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json(
      { error: 'Ürün getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const validatedData = productUpdateSchema.parse(body)

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      )
    }

    // Check if slug already exists (excluding current product)
    const slugConflict = await prisma.product.findFirst({
      where: {
        slug: validatedData.slug,
        id: { not: id }
      }
    })

    if (slugConflict) {
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

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: validatedData.name,
        nameEn: validatedData.nameEn || null,
        slug: validatedData.slug,
        slugEn: validatedData.slugEn || null,
        categoryId: validatedData.categoryId,
        brandId: validatedData.brandId || null,
        description: validatedData.description || null,
        descriptionEn: validatedData.descriptionEn || null,
        images: validatedData.images,
        sizePrices: validatedData.sizePrices,
        colors: validatedData.colors,
        stockType: validatedData.stockType,
        hasEmbroidery: validatedData.hasEmbroidery
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

    return NextResponse.json({ product, message: 'Ürün başarıyla güncellendi' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: 'Ürün güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      )
    }

    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Ürün başarıyla silindi' })
  } catch (error) {
    console.error('Product deletion error:', error)
    return NextResponse.json(
      { error: 'Ürün silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
