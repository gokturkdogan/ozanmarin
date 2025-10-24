import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const product = await prisma.product.findUnique({
      where: { slug },
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
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            name: true,
            nameEn: true,
            slug: true,
            slugEn: true
          }
        },
        brand: {
          select: {
            name: true,
            nameEn: true,
            slug: true,
            slugEn: true
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
    console.error('Product API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
