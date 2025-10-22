import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where = category ? { category: { slug: category } } : {}

    const brands = await prisma.brand.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ brands })
  } catch (error) {
    console.error('Brands API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
