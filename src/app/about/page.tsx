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
      heroDescription: "Denizcilik tekstili konusunda uzman ekibimizle, yat ve tekne sahiplerine premium kalitede çözümler sunuyoruz.",
      storyTitle: "Hikayemiz",
      story1: "Ozan Marin, denizcilik tutkusu olan bir ekibin kurduğu bir markadır. Yıllarca denizde geçirdiğimiz zamanlar boyunca, yat ve tekne sahiplerinin karşılaştığı tekstil ihtiyaçlarını yakından gözlemledik.",
      story2: "Deniz koşullarının zorluğunu, UV ışınlarının zararlı etkilerini ve tuzlu suyun malzemeler üzerindeki yıpratıcı etkisini biliyoruz. Bu deneyimlerimizden yola çıkarak, sadece denizcilik için tasarlanmış premium kalitede ürünler üretmeye karar verdik.",
      story3: "Bugün, Türkiye'nin önde gelen denizcilik tekstili markalarından biri olarak, müşterilerimize en kaliteli ve dayanıklı ürünleri sunmaya devam ediyoruz.",
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
      heroDescription: "With our expert team in marine textiles, we provide premium quality solutions for yacht and boat owners.",
      storyTitle: "Our Story",
      story1: "Ozan Marin is a brand founded by a team passionate about maritime. Over the years we've spent at sea, we've closely observed the textile needs that yacht and boat owners face.",
      story2: "We understand the harshness of sea conditions, the harmful effects of UV rays, and the corrosive impact of saltwater on materials. Based on these experiences, we decided to produce premium quality products designed specifically for maritime use.",
      story3: "Today, as one of Turkey's leading marine textile brands, we continue to offer our customers the highest quality and most durable products.",
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
              </div>
            </div>
            <div className="aspect-w-16 aspect-h-9">
              <div className="w-full h-96 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <Anchor className="w-32 h-32 text-white opacity-50" />
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
