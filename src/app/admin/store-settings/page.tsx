'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/lib/language'
import { useToast } from '@/hooks/use-toast'
import { Save, Settings } from 'lucide-react'

interface StoreSettings {
  id: string
  turkeyShippingUSD: number
  turkeyShippingTRY: number
  internationalShippingUSD: number
  internationalShippingTRY: number
  embroideryPriceUSD: number
  embroideryPriceTRY: number
}

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>({
    id: '',
    turkeyShippingUSD: 0,
    turkeyShippingTRY: 200,
    internationalShippingUSD: 0,
    internationalShippingTRY: 0,
    embroideryPriceUSD: 0,
    embroideryPriceTRY: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { language } = useLanguage()
  const { toast } = useToast()

  const content = {
    tr: {
      title: "Mağaza Ayarları",
      subtitle: "Kargo ücretleri ve nakış fiyatlarını yönetin",
      turkeyShippingUSD: "Türkiye Kargo Ücreti (USD)",
      turkeyShippingTRY: "Türkiye Kargo Ücreti (TL)",
      internationalShippingUSD: "Yurtdışı Kargo Ücreti (USD)",
      internationalShippingTRY: "Yurtdışı Kargo Ücreti (TL)",
      embroideryPriceUSD: "Nakış Ücreti (USD)",
      embroideryPriceTRY: "Nakış Ücreti (TL)",
      save: "Kaydet",
      saving: "Kaydediliyor...",
      saved: "Ayarlar kaydedildi!",
      error: "Ayarlar kaydedilirken bir hata oluştu",
      loading: "Yükleniyor...",
      shippingSettings: "Kargo Ayarları",
      embroiderySettings: "Nakış Ayarları"
    },
    en: {
      title: "Store Settings",
      subtitle: "Manage shipping costs and embroidery prices",
      turkeyShippingUSD: "Turkey Shipping Cost (USD)",
      turkeyShippingTRY: "Turkey Shipping Cost (TL)",
      internationalShippingUSD: "International Shipping Cost (USD)",
      internationalShippingTRY: "International Shipping Cost (TL)",
      embroideryPriceUSD: "Embroidery Price (USD)",
      embroideryPriceTRY: "Embroidery Price (TL)",
      save: "Save",
      saving: "Saving...",
      saved: "Settings saved!",
      error: "An error occurred while saving settings",
      loading: "Loading...",
      shippingSettings: "Shipping Settings",
      embroiderySettings: "Embroidery Settings"
    }
  }

  const t = content[language]

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/store-settings')

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      } else {
        console.error('Settings fetch failed')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // id field'ını çıkar
      const { id, ...settingsToSave } = settings
      console.log('Sending data:', settingsToSave)
      
      const response = await fetch('/api/admin/store-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsToSave)
      })

      if (response.ok) {
        toast({
          title: t.saved,
          description: language === 'tr' ? 'Mağaza ayarları başarıyla kaydedildi' : 'Store settings saved successfully',
        })
      } else {
        const errorData = await response.json()
        console.error('Save error:', errorData)
        toast({
          title: t.error,
          description: errorData.details 
            ? errorData.details.map((d: any) => d.message).join(', ')
            : errorData.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: t.error,
        description: language === 'tr' ? 'Bir hata oluştu, lütfen tekrar deneyin' : 'An error occurred, please try again',
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof StoreSettings, value: string) => {
    if (field === 'id') return // id field'ını güncelleme
    
    const numericValue = parseFloat(value) || 0
    console.log(`Updating ${field}: "${value}" -> ${numericValue} (type: ${typeof numericValue})`)
    
    setSettings(prev => ({
      ...prev,
      [field]: numericValue
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
            <Settings className="w-8 h-8 mr-3" />
            {t.title}
          </h1>
          <p className="text-lg text-gray-600">
            {t.subtitle}
          </p>
        </div>

        <div className="space-y-6">
          {/* Kargo Ayarları */}
          <Card>
            <CardHeader>
              <CardTitle>{t.shippingSettings}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="turkeyShippingUSD">{t.turkeyShippingUSD}</Label>
                  <Input
                    id="turkeyShippingUSD"
                    type="number"
                    step="0.01"
                    value={settings.turkeyShippingUSD.toString()}
                    onChange={(e) => handleInputChange('turkeyShippingUSD', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="turkeyShippingTRY">{t.turkeyShippingTRY}</Label>
                  <Input
                    id="turkeyShippingTRY"
                    type="number"
                    step="0.01"
                    value={settings.turkeyShippingTRY.toString()}
                    onChange={(e) => handleInputChange('turkeyShippingTRY', e.target.value)}
                    placeholder="200.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internationalShippingUSD">{t.internationalShippingUSD}</Label>
                  <Input
                    id="internationalShippingUSD"
                    type="number"
                    step="0.01"
                    value={settings.internationalShippingUSD.toString()}
                    onChange={(e) => handleInputChange('internationalShippingUSD', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internationalShippingTRY">{t.internationalShippingTRY}</Label>
                  <Input
                    id="internationalShippingTRY"
                    type="number"
                    step="0.01"
                    value={settings.internationalShippingTRY.toString()}
                    onChange={(e) => handleInputChange('internationalShippingTRY', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nakış Ayarları */}
          <Card>
            <CardHeader>
              <CardTitle>{t.embroiderySettings}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="embroideryPriceUSD">{t.embroideryPriceUSD}</Label>
                  <Input
                    id="embroideryPriceUSD"
                    type="number"
                    step="0.01"
                    value={settings.embroideryPriceUSD.toString()}
                    onChange={(e) => handleInputChange('embroideryPriceUSD', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="embroideryPriceTRY">{t.embroideryPriceTRY}</Label>
                  <Input
                    id="embroideryPriceTRY"
                    type="number"
                    step="0.01"
                    value={settings.embroideryPriceTRY.toString()}
                    onChange={(e) => handleInputChange('embroideryPriceTRY', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kaydet Butonu */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              size="lg"
              className="cursor-pointer"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? t.saving : t.save}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
