'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/language'

export function Footer() {
  const { language } = useLanguage()

  // Dil bazlı içerik
  const content = {
    tr: {
      companyDescription: "Denizcilik tekstili konusunda uzman ekibimizle, yat ve tekne sahiplerine premium kalitede kumaş kılıfları, minderler ve branda çözümleri sunuyoruz.",
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
      companyDescription: "With our expert team in marine textiles, we provide premium quality fabric covers, cushions and awning solutions for yacht and boat owners.",
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
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">OM</span>
              </div>
              <span className="text-xl font-bold">Ozan Marin</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              {t_content.companyDescription}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                </svg>
              </a>
            </div>
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
