'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/cart'
import { useLanguage } from '@/lib/language'
import { ShoppingCart, User, Menu, X, ChevronDown, Globe } from 'lucide-react'
import { ClientOnly } from './client-only'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)
  const { getTotalItems } = useCartStore()
  const { language, setLanguage } = useLanguage()
  const pathname = usePathname()

  const navigation = {
    tr: {
      home: "Ana Sayfa",
      products: "Ürünler",
      cart: "Sepet",
      profile: "Profilim",
      addresses: "Adreslerim",
      orders: "Siparişlerim",
      login: "Giriş Yap",
      register: "Kayıt Ol",
      logout: "Çıkış Yap",
      admin: "Admin Panel"
    },
    en: {
      home: "Home",
      products: "Products",
      cart: "Cart",
      profile: "Profile",
      addresses: "Addresses",
      orders: "Orders",
      login: "Login",
      register: "Register",
      logout: "Logout",
      admin: "Admin Panel"
    }
  }

  const nav = navigation[language]

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  // Helper function to get active class
  const getActiveClass = (path: string, baseClass: string = '') => {
    return isActive(path) 
      ? `${baseClass} text-primary font-semibold border-b-2 border-primary` 
      : `${baseClass} text-gray-700 hover:text-primary transition-colors`
  }

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setIsLoggedIn(true)
          setUser(data.user)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    
    checkAuth()
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isUserMenuOpen])

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      setIsLoggedIn(false)
      setUser(null)
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="hidden md:flex items-center space-x-2">
            <img 
              src="https://res.cloudinary.com/dfj76zhgk/image/upload/v1761225213/ozan-marin-logo_vjk61q.png" 
              alt="Ozan Marin Logo" 
              className="h-14 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className={getActiveClass('/', 'px-3 py-2')}>
              {nav.home}
            </Link>
            <Link href="/products" className={getActiveClass('/products', 'px-3 py-2')}>
              {nav.products}
            </Link>
            <Link href="/about" className={getActiveClass('/about', 'px-3 py-2')}>
              {language === 'tr' ? 'Hakkımızda' : 'About'}
            </Link>
            <Link href="/contact" className={getActiveClass('/contact', 'px-3 py-2')}>
              {language === 'tr' ? 'İletişim' : 'Contact'}
            </Link>
            {isLoggedIn && user?.role === 'admin' && (
              <Link href="/admin" className={getActiveClass('/admin', 'px-3 py-2 font-medium')}>
                {nav.admin}
              </Link>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className={`relative p-2 transition-colors ${isActive('/cart') ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
              <ShoppingCart className="w-6 h-6" />
              <ClientOnly fallback={null}>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </ClientOnly>
            </Link>

            {/* User menu */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-primary transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                    <div className="py-1">
                      <Link 
                        href="/profile" 
                        className={`block px-4 py-2 text-sm transition-colors ${isActive('/profile') ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {nav.profile}
                      </Link>
                      <Link 
                        href="/addresses" 
                        className={`block px-4 py-2 text-sm transition-colors ${isActive('/addresses') ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {nav.addresses}
                      </Link>
                      <Link 
                        href="/orders" 
                        className={`block px-4 py-2 text-sm transition-colors ${isActive('/orders') ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {nav.orders}
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Çıkış
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4 mr-2" />
                    {nav.login}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="cursor-pointer hover:bg-primary/90 transition-colors">
                    {nav.register}
                  </Button>
                </Link>
              </div>
            )}

            {/* Language Switcher */}
            <div className="flex items-center space-x-1">
              <Globe className="w-4 h-4 text-gray-600" />
              <button
                onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
                className="px-2 py-1 text-sm font-medium text-gray-700 hover:text-primary transition-colors border border-gray-300 rounded hover:border-primary"
              >
                {language === 'tr' ? 'TR' : 'EN'}
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-primary transition-colors cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              {/* Language Switcher - Mobile */}
              <div className="px-3 py-2 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Dil / Language</span>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-600" />
                    <button
                      onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
                      className="px-3 py-1 text-sm font-medium text-gray-700 hover:text-primary transition-colors border border-gray-300 rounded hover:border-primary"
                    >
                      {language === 'tr' ? 'Türkçe' : 'English'}
                    </button>
                  </div>
                </div>
              </div>

              <Link 
                href="/" 
                className={getActiveClass('/', 'px-3 py-2')}
                onClick={() => setIsMenuOpen(false)}
              >
                {nav.home}
              </Link>
              <Link 
                href="/products" 
                className={getActiveClass('/products', 'px-3 py-2')}
                onClick={() => setIsMenuOpen(false)}
              >
                {nav.products}
              </Link>
              <Link 
                href="/about" 
                className={getActiveClass('/about', 'px-3 py-2')}
                onClick={() => setIsMenuOpen(false)}
              >
                {language === 'tr' ? 'Hakkımızda' : 'About'}
              </Link>
              <Link 
                href="/contact" 
                className={getActiveClass('/contact', 'px-3 py-2')}
                onClick={() => setIsMenuOpen(false)}
              >
                {language === 'tr' ? 'İletişim' : 'Contact'}
              </Link>
              {isLoggedIn && user?.role === 'admin' && (
                <Link 
                  href="/admin" 
                  className={getActiveClass('/admin', 'px-3 py-2 font-medium')}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {nav.admin}
                </Link>
              )}
              
              {/* User Links */}
              {isLoggedIn && (
                <>
                  <hr className="my-2" />
                  <Link 
                    href="/profile" 
                    className={getActiveClass('/profile', 'px-3 py-2')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {nav.profile}
                  </Link>
                  <Link 
                    href="/addresses" 
                    className={getActiveClass('/addresses', 'px-3 py-2')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {nav.addresses}
                  </Link>
                  <Link 
                    href="/orders" 
                    className={getActiveClass('/orders', 'px-3 py-2')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {nav.orders}
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                        {nav.logout}
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
