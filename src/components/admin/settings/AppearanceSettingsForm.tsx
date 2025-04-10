"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface AppearanceSettingsFormProps {
  settings: any;
  isLoading: boolean;
  onSettingsUpdated?: () => void;
}

export default function AppearanceSettingsForm({ settings, isLoading, onSettingsUpdated }: AppearanceSettingsFormProps) {
  const [formData, setFormData] = useState({
    navbarColor: settings?.navbarColor || "#ffffff",
    footerColor: settings?.footerColor || "#f8f9fa",
    primaryColor: settings?.primaryColor || "#3b82f6",
    secondaryColor: settings?.secondaryColor || "#6b7280",
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Görünüm ayarları kaydedilirken bir hata oluştu");
      }

      const data = await response.json();
      
      // Form verilerini güncellenmiş değerlerle güncelle
      setFormData(prev => ({
        ...prev,
        ...data.settings
      }));
      
      toast.success("Görünüm ayarları başarıyla kaydedildi!");
      
      // Eğer callback sağlanmışsa, ayarlar güncellendiğinde çağır
      if (onSettingsUpdated) {
        onSettingsUpdated();
      }
    } catch (error) {
      console.error("Görünüm ayarları kaydedilirken hata:", error);
      toast.error("Görünüm ayarları kaydedilirken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Renk Ayarları</CardTitle>
            <CardDescription>
              Sitenin renk şemasını buradan özelleştirebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Ana Renk</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="primaryColor"
                    name="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={handleChange}
                    name="primaryColor"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500">Butonlar, linkler ve vurgular için ana renk.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">İkincil Renk</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="secondaryColor"
                    name="secondaryColor"
                    type="color"
                    value={formData.secondaryColor}
                    onChange={handleChange}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={handleChange}
                    name="secondaryColor"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500">Gölgeler, arka planlar için ikincil renk.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="navbarColor">Navbar Rengi</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="navbarColor"
                    name="navbarColor"
                    type="color"
                    value={formData.navbarColor}
                    onChange={handleChange}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.navbarColor}
                    onChange={handleChange}
                    name="navbarColor"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500">Üst menü arka plan rengi.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="footerColor">Footer Rengi</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="footerColor"
                    name="footerColor"
                    type="color"
                    value={formData.footerColor}
                    onChange={handleChange}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.footerColor}
                    onChange={handleChange}
                    name="footerColor"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500">Alt menü arka plan rengi.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Renk Önizleme</CardTitle>
            <CardDescription>
              Seçtiğiniz renklerin önizlemesini buradan görebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md overflow-hidden border">
              <div className="h-12" style={{ backgroundColor: formData.navbarColor }}>
                <div className="flex items-center h-full px-4">
                  <div className="font-bold" style={{ color: formData.primaryColor }}>Logo</div>
                  <div className="ml-auto flex space-x-2">
                    <div className="px-3 py-1 rounded" style={{ backgroundColor: formData.primaryColor, color: 'white' }}>Buton</div>
                    <div style={{ color: formData.primaryColor }}>Link</div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 min-h-32" style={{ backgroundColor: 'white' }}>
                <div className="mb-2 font-bold" style={{ color: formData.primaryColor }}>Başlık</div>
                <div className="mb-4" style={{ color: formData.secondaryColor }}>Alt başlık ve açıklamalar</div>
                <div className="px-4 py-2 rounded inline-block" style={{ backgroundColor: formData.primaryColor, color: 'white' }}>
                  Ana Buton
                </div>
                <div className="px-4 py-2 rounded inline-block ml-2 border" style={{ borderColor: formData.secondaryColor, color: formData.secondaryColor }}>
                  İkincil Buton
                </div>
              </div>
              
              <div className="h-12 p-4" style={{ backgroundColor: formData.footerColor }}>
                <div className="text-sm" style={{ color: formData.secondaryColor }}>Footer Alanı</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <CardFooter className="flex justify-end p-6 pt-0">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </CardFooter>
      </div>
    </form>
  );
} 