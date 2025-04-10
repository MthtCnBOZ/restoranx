"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsSettingsFormProps {
  settings: any;
  isLoading: boolean;
  onSettingsUpdated?: () => void;
}

export default function AnalyticsSettingsForm({ settings, isLoading, onSettingsUpdated }: AnalyticsSettingsFormProps) {
  const [formData, setFormData] = useState({
    googleAnalyticsId: settings?.googleAnalyticsId || "",
    googleConsoleId: settings?.googleConsoleId || "",
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
        throw new Error("Analitik ayarları kaydedilirken bir hata oluştu");
      }

      const data = await response.json();
      
      // Form verilerini güncellenmiş değerlerle güncelle
      setFormData(prev => ({
        ...prev,
        ...data.settings
      }));
      
      toast.success("Analitik ayarları başarıyla kaydedildi!");
      
      // Eğer callback sağlanmışsa, ayarlar güncellendiğinde çağır
      if (onSettingsUpdated) {
        onSettingsUpdated();
      }
    } catch (error) {
      console.error("Analitik ayarları kaydedilirken hata:", error);
      toast.error("Analitik ayarları kaydedilirken bir hata oluştu");
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
            <CardTitle>Google Analytics Ayarları</CardTitle>
            <CardDescription>
              Google Analytics entegrasyonu için Measurement ID bilgisini buradan ekleyebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="googleAnalyticsId">Google Analytics Measurement ID</Label>
              <Input
                id="googleAnalyticsId"
                name="googleAnalyticsId"
                value={formData.googleAnalyticsId}
                onChange={handleChange}
                placeholder="G-XXXXXXXXXX"
              />
              <p className="text-xs text-gray-500">GA4 için "G-" ile başlayan Measurement ID kullanılmalıdır.</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Google Search Console Ayarları</CardTitle>
            <CardDescription>
              Google Search Console doğrulama kodunu buradan ekleyebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="googleConsoleId">Google Site Verification ID</Label>
              <Input
                id="googleConsoleId"
                name="googleConsoleId"
                value={formData.googleConsoleId}
                onChange={handleChange}
                placeholder="Google Site Verification ID"
              />
              <p className="text-xs text-gray-500">meta name="google-site-verification" kodunun içeriğini girin.</p>
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