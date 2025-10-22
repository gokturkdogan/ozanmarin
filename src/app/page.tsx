'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Anchor, Waves, Shield, Star } from 'lucide-react'
import { useLanguage } from '@/lib/language'

export default function Home() {
  const { language } = useLanguage()

  const content = {
    tr: {
      tagline: "yachting & boating",
      title: "Denizcilik Tekstili",
      subtitle: "Premium Kalite",
      description: "Yat ve tekne sahiplerine özel tasarlanmış kumaş kılıfları, minderler ve branda çözümleri. Deniz koşullarına dayanıklı, UV korumalı ve uzun ömürlü ürünler.",
      exploreProducts: "Ürünleri İncele",
      contactUs: "İletişime Geç",
      features: {
        title: "Neden Ozan Marin?",
        subtitle: "Denizcilik deneyimimiz ve kalite anlayışımızla fark yaratıyoruz",
        quality: {
          title: "Premium Kalite",
          description: "En kaliteli malzemeler ve uzman işçilik"
        },
        durability: {
          title: "Dayanıklılık",
          description: "Deniz koşullarına dayanıklı, uzun ömürlü ürünler"
        },
        uvProtection: {
          title: "UV Koruması",
          description: "Güneş ışınlarına karşı koruma sağlayan teknoloji"
        },
        customization: {
          title: "Özel Tasarım",
          description: "İhtiyaçlarınıza göre özelleştirilmiş çözümler"
        }
      },
      categories: {
        title: "Ürün Kategorileri",
        subtitle: "Denizcilik ihtiyaçlarınız için geniş ürün yelpazesi",
        covers: {
          title: "Yat Kumaş Kılıfları",
          description: "Premium kumaşlardan üretilmiş, özel tasarım kılıflar"
        },
        cushions: {
          title: "Tekne Minderleri",
          description: "Konforlu ve dayanıklı tekne oturma çözümleri"
        },
        tarpaulins: {
          title: "Marin Güneşlik & Branda",
          description: "Güneş ve hava koşullarından koruma sağlayan brandalar"
        }
      },
      cta: {
        title: "Denizcilik Deneyiminizi Yükseltin",
        subtitle: "Premium kalitede denizcilik tekstili çözümleri için hemen iletişime geçin",
        contact: "İletişime Geç",
        products: "Ürünleri Gör"
      }
    },
    en: {
      tagline: "yachting & boating",
      title: "Marine Textiles",
      subtitle: "Premium Quality",
      description: "Specially designed fabric covers, cushions and tarpaulin solutions for yacht and boat owners. Durable, UV-protected and long-lasting products for marine conditions.",
      exploreProducts: "Explore Products",
      contactUs: "Contact Us",
      features: {
        title: "Why Ozan Marin?",
        subtitle: "We make a difference with our marine experience and quality approach",
        quality: {
          title: "Premium Quality",
          description: "Highest quality materials and expert craftsmanship"
        },
        durability: {
          title: "Durability",
          description: "Durable, long-lasting products for marine conditions"
        },
        uvProtection: {
          title: "UV Protection",
          description: "Technology that provides protection against sun rays"
        },
        customization: {
          title: "Custom Design",
          description: "Customized solutions according to your needs"
        }
      },
      categories: {
        title: "Product Categories",
        subtitle: "Wide range of products for your marine needs",
        covers: {
          title: "Yacht Fabric Covers",
          description: "Premium fabric covers with special design"
        },
        cushions: {
          title: "Boat Cushions",
          description: "Comfortable and durable boat seating solutions"
        },
        tarpaulins: {
          title: "Marine Sunshade & Tarpaulin",
          description: "Tarpaulins that provide protection from sun and weather conditions"
        }
      },
      cta: {
        title: "Elevate Your Marine Experience",
        subtitle: "Contact us now for premium quality marine textile solutions",
        contact: "Contact Us",
        products: "View Products"
      }
    }
  }

  const t = content[language]
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-xl">O</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-primary leading-tight">OZAN</span>
                    <span className="text-lg text-gray-600 leading-tight">marin</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 font-medium">{t.tagline}</div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {t.title}
              <span className="block text-primary">{t.subtitle}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  {t.exploreProducts}
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t.contactUs}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.features.title}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Waves className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">{t.features.durability.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t.features.durability.description}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">{t.features.quality.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t.features.quality.description}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Anchor className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">{t.features.customization.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t.features.customization.description}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.categories.title}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.categories.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/products?category=yat-kumas-kiliflari">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{t.categories.covers.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t.categories.covers.description}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/products?category=tekne-minderleri">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{t.categories.cushions.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t.categories.cushions.description}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/products?category=marin-guneslik-branda">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Waves className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{t.categories.tarpaulins.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t.categories.tarpaulins.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t.cta.title}</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            {t.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                {t.cta.products}
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                {t.cta.contact}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}