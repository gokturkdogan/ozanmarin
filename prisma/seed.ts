import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Kategorileri oluştur
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'yat-kumas-kiliflari' },
      update: {},
      create: {
        name: 'Yat Kumaş Kılıfları',
        slug: 'yat-kumas-kiliflari',
        description: 'Yatlarınız için özel tasarlanmış kumaş kılıfları'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'tekne-minderleri' },
      update: {},
      create: {
        name: 'Tekne Minderleri',
        slug: 'tekne-minderleri',
        description: 'Deniz koşullarına dayanıklı tekne minderleri'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'marin-guneslik-branda' },
      update: {},
      create: {
        name: 'Marin Güneşlik & Branda',
        slug: 'marin-guneslik-branda',
        description: 'UV korumalı güneşlik ve branda çözümleri'
      }
    })
  ])

  console.log('Kategoriler oluşturuldu:', categories)

  // Markaları oluştur
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'marin-premium' },
      update: {},
      create: {
        name: 'Marin Premium',
        slug: 'marin-premium',
        description: 'Premium kalitede denizcilik tekstili',
        categoryId: categories[0].id
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'ocean-guard' },
      update: {},
      create: {
        name: 'Ocean Guard',
        slug: 'ocean-guard',
        description: 'Deniz koşullarına dayanıklı tekstil çözümleri',
        categoryId: categories[1].id
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'sunshield-marine' },
      update: {},
      create: {
        name: 'SunShield Marine',
        slug: 'sunshield-marine',
        description: 'UV korumalı marin tekstil',
        categoryId: categories[2].id
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'wave-tech' },
      update: {},
      create: {
        name: 'Wave Tech',
        slug: 'wave-tech',
        description: 'Teknoloji odaklı denizcilik tekstili',
        categoryId: categories[0].id
      }
    })
  ])

  console.log('Markalar oluşturuldu:', brands)

  // Örnek ürünleri oluştur/güncelle
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'yat-koltuk-kilifi-premium' },
      update: {
        brandId: brands[0].id,
        sizePrices: [
          { size: 'S', price: 1000 },
          { size: 'M', price: 1250 },
          { size: 'L', price: 1500 },
          { size: 'XL', price: 1750 }
        ],
        colors: ['Beyaz', 'Mavi', 'Gri', 'Kırmızı']
      },
      create: {
        name: 'Yat Koltuk Kılıfı Premium',
        slug: 'yat-koltuk-kilifi-premium',
        categoryId: categories[0].id,
        brandId: brands[0].id,
        description: 'Su geçirmez, UV korumalı premium yat koltuk kılıfı. Deniz tuzuna dayanıklı özel kumaş.',
        images: ['/images/yat-koltuk-kilifi-1.jpg', '/images/yat-koltuk-kilifi-2.jpg'],
        stock: 15,
        sizePrices: [
          { size: 'S', price: 1000 },
          { size: 'M', price: 1250 },
          { size: 'L', price: 1500 },
          { size: 'XL', price: 1750 }
        ],
        colors: ['Beyaz', 'Mavi', 'Gri', 'Kırmızı']
      }
    }),
    prisma.product.upsert({
      where: { slug: 'tekne-minderi-deniz-mavisi' },
      update: {
        brandId: brands[1].id,
        sizePrices: [
          { size: 'Tek Boyut', price: 850 }
        ],
        colors: ['Deniz Mavisi', 'Beyaz', 'Gri']
      },
      create: {
        name: 'Tekne Minderi Deniz Mavisi',
        slug: 'tekne-minderi-deniz-mavisi',
        categoryId: categories[1].id,
        brandId: brands[1].id,
        description: 'Deniz koşullarına dayanıklı, hızlı kuruyan tekne minderi.',
        images: ['/images/tekne-minderi-1.jpg'],
        stock: 8,
        sizePrices: [
          { size: 'Tek Boyut', price: 850 }
        ],
        colors: ['Deniz Mavisi', 'Beyaz', 'Gri']
      }
    }),
    prisma.product.upsert({
      where: { slug: 'marin-guneslik-3x4m' },
      update: {
        brandId: brands[2].id,
        sizePrices: [
          { size: '3x4m', price: 1800 },
          { size: '4x5m', price: 2100 },
          { size: '5x6m', price: 2500 }
        ],
        colors: ['Beyaz', 'Mavi', 'Gri', 'Bej']
      },
      create: {
        name: 'Marin Güneşlik 3x4m',
        slug: 'marin-guneslik-3x4m',
        categoryId: categories[2].id,
        brandId: brands[2].id,
        description: 'UV korumalı, rüzgar dirençli marin güneşlik. Özel bağlantı sistemli.',
        images: ['/images/marin-guneslik-1.jpg', '/images/marin-guneslik-2.jpg'],
        stock: 5,
        sizePrices: [
          { size: '3x4m', price: 1800 },
          { size: '4x5m', price: 2100 },
          { size: '5x6m', price: 2500 }
        ],
        colors: ['Beyaz', 'Mavi', 'Gri', 'Bej']
      }
    }),
    prisma.product.upsert({
      where: { slug: 'yat-direk-kilifi' },
      update: {
        brandId: brands[3].id,
        sizePrices: [
          { size: 'S', price: 350 },
          { size: 'M', price: 450 },
          { size: 'L', price: 550 }
        ],
        colors: ['Siyah', 'Mavi', 'Beyaz']
      },
      create: {
        name: 'Yat Direk Kılıfı',
        slug: 'yat-direk-kilifi',
        categoryId: categories[0].id,
        brandId: brands[3].id,
        description: 'Direklerinizi koruyan su geçirmez kılıf.',
        images: ['/images/direk-kilifi-1.jpg'],
        stock: 12,
        sizePrices: [
          { size: 'S', price: 350 },
          { size: 'M', price: 450 },
          { size: 'L', price: 550 }
        ],
        colors: ['Siyah', 'Mavi', 'Beyaz']
      }
    })
  ])

  console.log('Ürünler oluşturuldu:', products)

  // Admin kullanıcısı oluştur
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ozanmarin.com' },
    update: { role: 'admin' },
    create: {
      name: 'Admin User',
      email: 'admin@ozanmarin.com',
      passwordHash: adminPassword,
      role: 'admin'
    },
  })
  console.log('Admin kullanıcı oluşturuldu:', admin)

  // Test kullanıcısı oluştur
  const testPassword = await bcrypt.hash('password123', 10)
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: testPassword,
      role: 'user'
    },
  })
  console.log('Test kullanıcı oluşturuldu:', testUser)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
