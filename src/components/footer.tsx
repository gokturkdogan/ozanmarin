'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/language'

export function Footer() {
  const { language } = useLanguage()

  // Dil bazlı içerik
  const content = {
    tr: {
      companyDescription: "Kuruluşumuz, teknelerin bakım ve onarım ihtiyaçlarını en yüksek standartlarda karşılamak için çeşitli yedek parçalar sunmanın yanı sıra, tekne ve yat tekstillerini de kendi bünyemizde üretmektedir. Geniş ürün yelpazemiz, her türlü ihtiyaca cevap verecek şekilde tasarlanmış olup, müşteri memnuniyetini her zaman ön planda tutmaktadır.",
      quickLinksTitle: "Hızlı Linkler",
      products: "Ürünler",
      about: "Hakkımızda",
      contact: "İletişim",
      orders: "Siparişlerim",
      contactTitle: "İletişim",
      address: "📍 Sülüntepe mahallesi mevlana caddesi Seyit sokak no:14 Pendik İstanbul",
      phone: "📞 +90 531 336 17 47",
      email: "✉️ ozanmarinn@gmail.com",
      copyright: "© 2024 Ozan Marin. Tüm hakları saklıdır."
    },
    en: {
      companyDescription: "Our organization meets the maintenance and repair needs of boats at the highest standards by offering various spare parts, while also producing boat and yacht textiles in-house. Our wide product range is designed to meet all kinds of needs, always keeping customer satisfaction in the foreground.",
      quickLinksTitle: "Quick Links",
      products: "Products",
      about: "About Us",
      contact: "Contact",
      orders: "My Orders",
      contactTitle: "Contact",
      address: "📍 Sülüntepe mahallesi mevlana caddesi Seyit sokak no:14 Pendik İstanbul",
      phone: "📞 +90 531 336 17 47",
      email: "✉️ ozanmarinn@gmail.com",
      copyright: "© 2024 Ozan Marin. All rights reserved."
    }
  }

  const t_content = content[language]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <img 
                src="https://res.cloudinary.com/dfj76zhgk/image/upload/v1761225471/ozan-marin-logo-no-bg_rlmqc5.png" 
                alt="Ozan Marin Logo" 
                className="h-16 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              {t_content.companyDescription}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t_content.quickLinksTitle}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-300 hover:text-white transition-colors">
                  {t_content.products}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  {t_content.about}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  {t_content.contact}
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-300 hover:text-white transition-colors">
                  {t_content.orders}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t_content.contactTitle}</h3>
            <div className="space-y-2 text-gray-300">
              <p>{t_content.address}</p>
              <p>{t_content.phone}</p>
              <p>{t_content.email}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
          <p>{t_content.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
