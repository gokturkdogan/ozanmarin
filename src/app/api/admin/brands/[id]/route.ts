import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const brandUpdateSchema = z.object({
  name: z.string().min(1, 'Marka adı gerekli'),
  slug: z.string().min(1, 'Slug gerekli'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Kategori gerekli')
})

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
    const validatedData = brandUpdateSchema.parse(body)

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id }
    })

    if (!existingBrand) {
      return NextResponse.json(
        { error: 'Marka bulunamadı' },
        { status: 404 }
      )
    }

    // Check if slug already exists (excluding current brand)
    const slugExists = await prisma.brand.findFirst({
      where: { 
        slug: validatedData.slug,
        id: { not: id }
      }
    })

    if (slugExists) {
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

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        categoryId: validatedData.categoryId
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({ brand, message: 'Marka başarıyla güncellendi' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Brand update error:', error)
    return NextResponse.json(
      { error: 'Marka güncellenirken bir hata oluştu' },
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

    // Check if brand has products
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!brand) {
      return NextResponse.json(
        { error: 'Marka bulunamadı' },
        { status: 404 }
      )
    }

    if (brand._count.products > 0) {
      return NextResponse.json(
        { error: 'Bu markada ürünler bulunduğu için silinemez' },
        { status: 400 }
      )
    }

    await prisma.brand.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Marka başarıyla silindi' })
  } catch (error) {
    console.error('Brand deletion error:', error)
    return NextResponse.json(
      { error: 'Marka silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
