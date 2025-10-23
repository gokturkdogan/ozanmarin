import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (category && category !== 'all') {
      where.category = { slug: category }
    }
    
    if (brand && brand !== 'all') {
      where.brand = { slug: brand }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
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
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.product.count({ where })
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Products API error:', error)
    
    // Prisma Query Engine hatası için özel kontrol
    if (error instanceof Error && error.message.includes('Query Engine')) {
      console.error('Prisma Query Engine not found:', error.message)
      return NextResponse.json(
        { error: 'Database connection error - Query Engine not found' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
