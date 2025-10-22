# Ozan Marin - Denizcilik Tekstili E-Ticaret Sitesi

Modern denizcilik tekstili e-ticaret platformu. Yat ve tekne sahiplerine özel tasarlanmış kumaş kılıfları, minderler ve branda çözümleri sunar.

## 🚀 Özellikler

- **Modern UI/UX**: Next.js 16, TailwindCSS ve shadcn/ui ile tasarlanmış responsive arayüz
- **Kullanıcı Yönetimi**: JWT tabanlı güvenli kayıt/giriş sistemi
- **Ürün Yönetimi**: Kategoriler ve ürünler için tam CRUD işlemleri
- **Sepet Sistemi**: Zustand ile client-side sepet yönetimi
- **Ödeme Entegrasyonu**: Iyzico sandbox entegrasyonu
- **Sipariş Takibi**: Kullanıcıların sipariş geçmişini görüntüleme
- **Veritabanı**: PostgreSQL + Prisma ORM

## 🛠️ Teknolojiler

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: TailwindCSS, shadcn/ui
- **State Management**: Zustand
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon.tech)
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Payment**: Iyzico (Sandbox)
- **Deployment**: Vercel

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL veritabanı
- Iyzico sandbox hesabı

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd ozanmarin
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Çevre değişkenlerini ayarlayın**
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ozanmarin?schema=public"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Iyzico API Keys (Sandbox)
IYZICO_API_KEY="sandbox-your-api-key"
IYZICO_SECRET_KEY="sandbox-your-secret-key"
IYZICO_BASE_URL="https://sandbox-api.iyzipay.com"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"
```

4. **Veritabanını kurun**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Örnek verileri yükleyin**
```bash
npm run db:seed
```

6. **Development server'ı başlatın**
```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── products/      # Product endpoints
│   │   ├── categories/    # Category endpoints
│   │   └── orders/        # Order endpoints
│   ├── login/             # Login page
│   ├── register/          # Register page
│   ├── products/          # Products pages
│   ├── cart/              # Cart page
│   ├── checkout/          # Checkout page
│   ├── orders/            # Orders pages
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── header.tsx        # Site header
│   └── footer.tsx        # Site footer
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── cart.ts           # Cart store (Zustand)
│   ├── iyzico.ts         # Payment integration
│   ├── prisma.ts         # Database client
│   └── utils.ts          # General utilities
└── middleware.ts         # Next.js middleware
```

## 🗄️ Veritabanı Şeması

### Users
- id, name, email, passwordHash, createdAt, updatedAt

### Categories
- id, name, slug, description, createdAt, updatedAt

### Products
- id, name, slug, categoryId, price, description, images[], stock, createdAt, updatedAt

### Orders
- id, userId, totalPrice, status, iyzicoPaymentId, items(json), shippingAddress(json), createdAt, updatedAt

## 🔐 Authentication

JWT tabanlı authentication sistemi:
- Kayıt: `/api/auth` (POST, action: 'register')
- Giriş: `/api/auth` (POST, action: 'login')
- Çıkış: `/api/logout` (POST)
- Kullanıcı bilgisi: `/api/auth/me` (GET)

## 🛒 E-ticaret Özellikleri

### Sepet Yönetimi
- Client-side sepet (Zustand)
- Ürün ekleme/çıkarma
- Adet değiştirme
- Toplam hesaplama

### Sipariş Süreci
1. Sepete ürün ekleme
2. Checkout sayfasında bilgi girişi
3. Iyzico ile ödeme (sandbox)
4. Sipariş oluşturma
5. Sipariş takibi

## 🚀 Deployment

### Vercel ile Deploy

1. **Vercel hesabı oluşturun**
2. **Projeyi GitHub'a push edin**
3. **Vercel'de projeyi import edin**
4. **Çevre değişkenlerini ayarlayın**
5. **Deploy edin**

### Çevre Değişkenleri (Production)
```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
IYZICO_API_KEY="your-production-iyzico-api-key"
IYZICO_SECRET_KEY="your-production-iyzico-secret-key"
IYZICO_BASE_URL="https://api.iyzipay.com"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-production-nextauth-secret"
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth` - Kayıt/Giriş
- `POST /api/logout` - Çıkış
- `GET /api/auth/me` - Kullanıcı bilgisi

### Products
- `GET /api/products` - Ürün listesi
- `GET /api/products/[slug]` - Ürün detayı

### Categories
- `GET /api/categories` - Kategori listesi

### Orders
- `GET /api/orders` - Kullanıcı siparişleri
- `POST /api/orders` - Sipariş oluşturma
- `GET /api/orders/[id]` - Sipariş detayı

## 🎨 Tasarım

- **Tema**: Mavi-beyaz denizcilik estetiği
- **Responsive**: Mobile-first tasarım
- **Accessibility**: WCAG uyumlu
- **Performance**: Next.js optimizasyonları

## 🔧 Geliştirme

### Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run db:seed      # Seed database
```

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Component-based architecture

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

- **Website**: [ozanmarin.com](https://ozanmarin.com)
- **Email**: info@ozanmarin.com
- **Phone**: +90 (212) 555 0123

---

**Ozan Marin** - Denizcilik Tekstili Premium Kalite 🚢