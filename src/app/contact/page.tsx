'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Phone, Mail } from 'lucide-react'
import { useLanguage } from '@/lib/language'

export default function ContactPage() {
  const { language } = useLanguage()

  // Dil bazlı içerik
  const content = {
    tr: {
      pageTitle: "İletişim",
      pageSubtitle: "Bizimle Konuşun",
      pageDescription: "Denizcilik tekstili ihtiyaçlarınız için uzman ekibimizle iletişime geçin. Size en uygun çözümleri sunmak için buradayız.",
      contactInfoTitle: "İletişim Bilgileri",
      addressLabel: "Adres",
      address: "Sülüntepe mahallesi mevlana caddesi Seyit sokak no:14 Pendik İstanbul",
      phoneLabel: "Telefon",
      phone: "+90 531 336 17 47",
      emailLabel: "Email",
      email: "ozanmarinn@gmail.com"
    },
    en: {
      pageTitle: "Contact",
      pageSubtitle: "Get in Touch",
      pageDescription: "Contact our expert team for your marine textile needs. We're here to provide you with the most suitable solutions.",
      contactInfoTitle: "Contact Information",
      addressLabel: "Address",
      address: "Sülüntepe mahallesi mevlana caddesi Seyit sokak no:14 Pendik İstanbul",
      phoneLabel: "Phone",
      phone: "+90 531 336 17 47",
      emailLabel: "Email",
      email: "ozanmarinn@gmail.com"
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
              {t_content.pageTitle}
              <span className="block text-primary">{t_content.pageSubtitle}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t_content.pageDescription}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t_content.contactInfoTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">{t_content.addressLabel}</p>
                    <p className="text-gray-600 text-sm">
                      {t_content.address.split('\n').map((line, index) => (
                        <span key={index}>
                          {line}
                          {index < t_content.address.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">{t_content.phoneLabel}</p>
                    <p className="text-gray-600 text-sm">
                      {t_content.phone.split('\n').map((line, index) => (
                        <span key={index}>
                          {line}
                          {index < t_content.phone.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">{t_content.emailLabel}</p>
                    <p className="text-gray-600 text-sm">
                      {t_content.email.split('\n').map((line, index) => (
                        <span key={index}>
                          {line}
                          {index < t_content.email.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
