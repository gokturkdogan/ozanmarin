import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        nameEn: true,
        slug: true,
        slugEn: true,
        description: true,
        descriptionEn: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Categories API error:', error)
    
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
