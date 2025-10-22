'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/cart'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { ClientOnly } from './client-only'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const { getTotalItems } = useCartStore()

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
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">O</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-primary leading-tight">OZAN</span>
                <span className="text-xs text-gray-600 leading-tight">marin</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary transition-colors">
              Ana Sayfa
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-primary transition-colors">
              Ürünler
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary transition-colors">
              Hakkımızda
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary transition-colors">
              İletişim
            </Link>
            {isLoggedIn && user?.role === 'admin' && (
              <Link href="/admin" className="text-gray-700 hover:text-primary transition-colors font-medium">
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-primary transition-colors">
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
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Merhaba, {user?.name}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                >
                  Çıkış
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4 mr-2" />
                    Giriş
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="cursor-pointer hover:bg-primary/90 transition-colors">
                    Kayıt Ol
                  </Button>
                </Link>
              </div>
            )}

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
              <Link 
                href="/" 
                className="text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Ana Sayfa
              </Link>
              <Link 
                href="/products" 
                className="text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Ürünler
              </Link>
              <Link 
                href="/about" 
                className="text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Hakkımızda
              </Link>
              <Link 
                href="/contact" 
                className="text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                İletişim
              </Link>
              {isLoggedIn && user?.role === 'admin' && (
                <Link 
                  href="/admin" 
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
