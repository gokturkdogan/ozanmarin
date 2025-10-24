'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Anchor, Waves, Shield, Star, Users, Award } from 'lucide-react'
import { useLanguage } from '@/lib/language'

export default function AboutPage() {
  const { language } = useLanguage()

  // Dil bazlı içerik
  const content = {
    tr: {
      pageTitle: "Hakkımızda",
      heroTitle: "Ozan Marin",
      heroSubtitle: "Hakkımızda",
      heroDescription: "2021 yılında kurulan Ozan Marin, tekneler ve yatlar için yedek parça ve tekstil üretimi konusunda uzmanlaşmış bir firmadır.",
      storyTitle: "Hakkımızda",
      story1: "Ozan Marin, 2021 yılında Kadir Ozan tarafından kurulan ve sektördeki deneyimiyle hızla büyüyen bir tekneler ve yatlar için yedek parça ve tekstil üretimi firmasıdır. Misyonumuz, yat sahiplerine kaliteli ve güvenilir ürünler sunmak, aynı zamanda denizcilik sektöründe kaliteyi ve yenilikçi çözümleri en üst düzeye çıkarmaktır.",
      story2: "Kuruluşumuz, teknelerin bakım ve onarım ihtiyaçlarını en yüksek standartlarda karşılamak için çeşitli yedek parçalar sunmanın yanı sıra, tekne ve yat tekstillerini de kendi bünyemizde üretmektedir. Geniş ürün yelpazemiz, her türlü ihtiyaca cevap verecek şekilde tasarlanmış olup, müşteri memnuniyetini her zaman ön planda tutmaktadır.",
      story3: "Uluslararası pazarda da aktif olan Ozan Marin, Katar ve Amerika başta olmak üzere birçok ülkeye ihracat yapmaktadır. Her geçen gün genişleyen global müşteri portföyümüzle, dünya çapında kalitemizi kanıtlamış bir markayız.",
      story4: "Amacımız, deniz tutkusuyla hareket eden her bireye ve kuruma, sektörün en kaliteli yedek parça ve tekstil çözümlerini sunarak, yatlarının uzun ömürlü olmasını sağlamaktır. Müşterilerimize her zaman yenilikçi, sağlam ve estetik ürünler sunmaya devam ediyoruz.",
      valuesTitle: "Değerlerimiz",
      valuesSubtitle: "İşimizi yaparken rehber aldığımız temel değerler",
      qualityTitle: "Kalite",
      qualityDesc: "Sadece en kaliteli malzemeleri kullanarak, uzun ömürlü ürünler üretiyoruz.",
      customerTitle: "Müşteri Memnuniyeti",
      customerDesc: "Müşterilerimizin memnuniyeti bizim için en önemli önceliktir.",
      sustainabilityTitle: "Sürdürülebilirlik",
      sustainabilityDesc: "Çevre dostu üretim süreçleri ve sürdürülebilir malzemeler kullanıyoruz.",
      expertiseTitle: "Uzmanlık",
      expertiseDesc: "Denizcilik tekstili konusunda uzman ekibimizle hizmet veriyoruz.",
      innovationTitle: "İnovasyon",
      innovationDesc: "Sürekli gelişim ve yenilikçi çözümlerle sektörde öncü oluyoruz.",
      reliabilityTitle: "Güvenilirlik",
      reliabilityDesc: "Sözümüzün arkasında durarak, güvenilir bir iş ortağı oluyoruz.",
      ctaTitle: "Bizimle İletişime Geçin",
      ctaDescription: "Denizcilik tekstili ihtiyaçlarınız için uzman ekibimizle konuşun.",
      contactButton: "İletişime Geç",
      productsButton: "Ürünleri İncele"
    },
    en: {
      pageTitle: "About Us",
      heroTitle: "Ozan Marin",
      heroSubtitle: "About Us",
      heroDescription: "Founded in 2021, Ozan Marin is a company specialized in spare parts and textile production for boats and yachts.",
      storyTitle: "About Us",
      story1: "Ozan Marin is a spare parts and textile production company for boats and yachts, founded by Kadir Ozan in 2021 and rapidly growing with its industry experience. Our mission is to provide yacht owners with quality and reliable products while maximizing quality and innovative solutions in the maritime industry.",
      story2: "Our organization not only offers various spare parts to meet the maintenance and repair needs of boats at the highest standards, but also produces boat and yacht textiles in-house. Our wide product range is designed to meet every kind of need, always keeping customer satisfaction in the foreground.",
      story3: "Ozan Marin, which is also active in the international market, exports to many countries, especially Qatar and America. With our expanding global customer portfolio every day, we are a brand that has proven our quality worldwide.",
      story4: "Our goal is to provide the highest quality spare parts and textile solutions in the industry to every individual and organization that moves with maritime passion, ensuring the longevity of their yachts. We continue to offer innovative, robust and aesthetic products to our customers at all times.",
      valuesTitle: "Our Values",
      valuesSubtitle: "The fundamental values that guide us in our work",
      qualityTitle: "Quality",
      qualityDesc: "We produce long-lasting products using only the highest quality materials.",
      customerTitle: "Customer Satisfaction",
      customerDesc: "Our customers' satisfaction is our most important priority.",
      sustainabilityTitle: "Sustainability",
      sustainabilityDesc: "We use environmentally friendly production processes and sustainable materials.",
      expertiseTitle: "Expertise",
      expertiseDesc: "We serve with our expert team in marine textiles.",
      innovationTitle: "Innovation",
      innovationDesc: "We lead the industry with continuous development and innovative solutions.",
      reliabilityTitle: "Reliability",
      reliabilityDesc: "We stand behind our word and become a reliable business partner.",
      ctaTitle: "Get in Touch with Us",
      ctaDescription: "Speak with our expert team for your marine textile needs.",
      contactButton: "Get in Touch",
      productsButton: "Browse Products"
    }
  }

  const t_content = content[language]
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {t_content.heroTitle}
              <span className="block text-primary">{t_content.heroSubtitle}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t_content.heroDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t_content.storyTitle}</h2>
              <div className="space-y-4 text-gray-600">
                <p>{t_content.story1}</p>
                <p>{t_content.story2}</p>
                <p>{t_content.story3}</p>
                <p>{t_content.story4}</p>
              </div>
            </div>
            <div className="aspect-w-16 aspect-h-9">
              <div className="w-full h-96 rounded-lg overflow-hidden">
                <img 
                  src="https://res.cloudinary.com/dfj76zhgk/image/upload/v1761225213/ozan-marin-logo_vjk61q.png" 
                  alt="Ozan Marin Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t_content.valuesTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t_content.valuesSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t_content.qualityTitle}</h3>
                <p className="text-gray-600">
                  {t_content.qualityDesc}
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t_content.customerTitle}</h3>
                <p className="text-gray-600">
                  {t_content.customerDesc}
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Waves className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t_content.sustainabilityTitle}</h3>
                <p className="text-gray-600">
                  {t_content.sustainabilityDesc}
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t_content.expertiseTitle}</h3>
                <p className="text-gray-600">
                  {t_content.expertiseDesc}
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t_content.innovationTitle}</h3>
                <p className="text-gray-600">
                  {t_content.innovationDesc}
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Anchor className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t_content.reliabilityTitle}</h3>
                <p className="text-gray-600">
                  {t_content.reliabilityDesc}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t_content.ctaTitle}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t_content.ctaDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact">
              <button className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                {t_content.contactButton}
              </button>
            </a>
            <a href="/products">
              <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors">
                {t_content.productsButton}
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
