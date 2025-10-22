'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mesajınız Gönderildi!</h2>
            <p className="text-gray-600 mb-6">
              Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
            </p>
            <Button onClick={() => setIsSubmitted(false)}>
              Yeni Mesaj Gönder
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              İletişim
              <span className="block text-primary">Bizimle Konuşun</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Denizcilik tekstili ihtiyaçlarınız için uzman ekibimizle iletişime geçin. 
              Size en uygun çözümleri sunmak için buradayız.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Bize Mesaj Gönderin</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Ad Soyad *</Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Adınız ve soyadınız"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="ornek@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+90 (5xx) xxx xx xx"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Konu *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Mesajınızın konusu"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Mesaj *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Mesajınızı buraya yazın..."
                    />
                  </div>
                  
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>İletişim Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Adres</p>
                    <p className="text-gray-600 text-sm">
                      Denizcilik Mahallesi<br />
                      Marina Caddesi No: 123<br />
                      İstanbul, Türkiye
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Telefon</p>
                    <p className="text-gray-600 text-sm">
                      +90 (212) 555 0123<br />
                      +90 (532) 555 0123
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600 text-sm">
                      info@ozanmarin.com<br />
                      destek@ozanmarin.com
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Çalışma Saatleri</p>
                    <p className="text-gray-600 text-sm">
                      Pazartesi - Cuma: 09:00 - 18:00<br />
                      Cumartesi: 09:00 - 14:00<br />
                      Pazar: Kapalı
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hızlı İletişim</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  Hemen Ara
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Gönder
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="w-4 h-4 mr-2" />
                  Konumu Gör
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sosyal Medya</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Instagram
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    LinkedIn
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
