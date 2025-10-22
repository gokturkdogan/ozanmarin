import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })
    
    console.log('Kullanıcılar:')
    console.log(JSON.stringify(users, null, 2))
    
    // Admin kullanıcısını özel kontrol et
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@ozanmarin.com' },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true
      }
    })
    
    console.log('\nAdmin kullanıcı:')
    console.log(JSON.stringify(admin, null, 2))
    
  } catch (error) {
    console.error('Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
