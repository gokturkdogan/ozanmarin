import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Anchor, Waves, Shield, Star } from 'lucide-react'

export default function Home() {
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
                <div className="text-sm text-gray-500 font-medium">yachting & boating</div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Denizcilik Tekstili
              <span className="block text-primary">Premium Kalite</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Yat ve tekne sahiplerine özel tasarlanmış kumaş kılıfları, minderler ve branda çözümleri. 
              Deniz koşullarına dayanıklı, UV korumalı ve uzun ömürlü ürünler.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  Ürünleri İncele
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  İletişime Geç
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Neden Ozan Marin?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Denizcilik tekstilinde uzman ekibimizle, kaliteli ve dayanıklı ürünler sunuyoruz.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Waves className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">Deniz Koşullarına Dayanıklı</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Tuzlu su, UV ışınları ve zorlu hava koşullarına karşı üstün koruma sağlayan özel kumaşlar.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">Üstün Kalite ve İşçilik</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Her ürünümüzde detaylara verilen önem ve el işçiliği ile uzun ömürlü kullanım.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Anchor className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">Modern ve Şık Tasarım</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yat ve teknelerinizin estetiğini tamamlayan, modern ve sade tasarımlar.
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kategorilerimiz</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Denizcilik ihtiyaçlarınıza uygun geniş ürün yelpazesi
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/products?category=yat-kumas-kiliflari">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Yat Kumaş Kılıfları</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Yatlarınız için özel tasarlanmış su geçirmez ve UV korumalı kumaş kılıfları.
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
                  <CardTitle className="text-xl">Tekne Minderleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Deniz koşullarına dayanıklı, hızlı kuruyan ve konforlu tekne minderleri.
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
                  <CardTitle className="text-xl">Marin Güneşlik & Branda</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    UV korumalı güneşlik ve branda çözümleri ile güneşten korunun.
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
          <h2 className="text-3xl font-bold mb-4">Denizdeki Konforunuz İçin</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Ozan Marin ile yat ve teknelerinizi en iyi şekilde donatın. 
            Uzman ekibimiz size en uygun çözümleri sunar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Ürünleri Keşfet
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Bize Ulaşın
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}