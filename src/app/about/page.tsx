import { Card, CardContent } from '@/components/ui/card'
import { Anchor, Waves, Shield, Star, Users, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Ozan Marin
              <span className="block text-primary">Hakkımızda</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Denizcilik tekstili konusunda uzman ekibimizle, yat ve tekne sahiplerine 
              premium kalitede çözümler sunuyoruz.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Hikayemiz</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Ozan Marin, denizcilik tutkusu olan bir ekibin kurduğu bir markadır. 
                  Yıllarca denizde geçirdiğimiz zamanlar boyunca, yat ve tekne sahiplerinin 
                  karşılaştığı tekstil ihtiyaçlarını yakından gözlemledik.
                </p>
                <p>
                  Deniz koşullarının zorluğunu, UV ışınlarının zararlı etkilerini ve 
                  tuzlu suyun malzemeler üzerindeki yıpratıcı etkisini biliyoruz. 
                  Bu deneyimlerimizden yola çıkarak, sadece denizcilik için tasarlanmış 
                  premium kalitede ürünler üretmeye karar verdik.
                </p>
                <p>
                  Bugün, Türkiye'nin önde gelen denizcilik tekstili markalarından biri 
                  olarak, müşterilerimize en kaliteli ve dayanıklı ürünleri sunmaya 
                  devam ediyoruz.
                </p>
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
              Değerlerimiz
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              İşimizi yaparken rehber aldığımız temel değerler
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Kalite</h3>
                <p className="text-gray-600">
                  Sadece en kaliteli malzemeleri kullanarak, uzun ömürlü ürünler üretiyoruz.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Müşteri Memnuniyeti</h3>
                <p className="text-gray-600">
                  Müşterilerimizin memnuniyeti bizim için en önemli önceliktir.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Waves className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sürdürülebilirlik</h3>
                <p className="text-gray-600">
                  Çevre dostu üretim süreçleri ve sürdürülebilir malzemeler kullanıyoruz.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Uzmanlık</h3>
                <p className="text-gray-600">
                  Denizcilik tekstili konusunda uzman ekibimizle hizmet veriyoruz.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">İnovasyon</h3>
                <p className="text-gray-600">
                  Sürekli gelişim ve yenilikçi çözümlerle sektörde öncü oluyoruz.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Anchor className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Güvenilirlik</h3>
                <p className="text-gray-600">
                  Sözümüzün arkasında durarak, güvenilir bir iş ortağı oluyoruz.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ekibimiz
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Denizcilik tekstili konusunda uzman ekibimizle tanışın
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-12 h-12 text-white opacity-50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ozan Marin</h3>
                <p className="text-primary font-medium mb-2">Kurucu & CEO</p>
                <p className="text-gray-600 text-sm">
                  15 yıllık denizcilik deneyimi ile sektörde öncü isimlerden biri.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Shield className="w-12 h-12 text-white opacity-50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Teknik Ekip</h3>
                <p className="text-primary font-medium mb-2">Üretim Uzmanları</p>
                <p className="text-gray-600 text-sm">
                  Tekstil mühendisleri ve kalite kontrol uzmanlarından oluşan profesyonel ekip.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Star className="w-12 h-12 text-white opacity-50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Müşteri Hizmetleri</h3>
                <p className="text-primary font-medium mb-2">Destek Ekibi</p>
                <p className="text-gray-600 text-sm">
                  Müşteri memnuniyeti odaklı, deneyimli müşteri hizmetleri ekibi.
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
            Bizimle İletişime Geçin
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Denizcilik tekstili ihtiyaçlarınız için uzman ekibimizle konuşun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact">
              <button className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                İletişime Geç
              </button>
            </a>
            <a href="/products">
              <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors">
                Ürünleri İncele
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
