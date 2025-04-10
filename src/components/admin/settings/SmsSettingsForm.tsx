"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface SmsSettingsFormProps {
  settings: any;
  isLoading: boolean;
  onSettingsUpdated?: () => void;
}

export default function SmsSettingsForm({ settings, isLoading, onSettingsUpdated }: SmsSettingsFormProps) {
  const [formData, setFormData] = useState({
    smsApiKey: settings?.smsApiKey || "",
    smsApiSecret: settings?.smsApiSecret || "",
    smsApiSender: settings?.smsApiSender || "",
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
        throw new Error("SMS ayarları kaydedilirken bir hata oluştu");
      }

      const data = await response.json();
      
      // Form verilerini güncellenmiş değerlerle güncelle
      setFormData(prev => ({
        ...prev,
        ...data.settings
      }));
      
      toast.success("SMS ayarları başarıyla kaydedildi!");
      
      // Eğer callback sağlanmışsa, ayarlar güncellendiğinde çağır
      if (onSettingsUpdated) {
        onSettingsUpdated();
      }
    } catch (error) {
      console.error("SMS ayarları kaydedilirken hata:", error);
      toast.error("SMS ayarları kaydedilirken bir hata oluştu");
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
            <CardTitle>SMS Servis Ayarları</CardTitle>
            <CardDescription>
              Türkiye'deki SMS servis sağlayıcınız için gerekli API bilgilerini buradan ayarlayabilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smsApiKey">API Key</Label>
              <Input
                id="smsApiKey"
                name="smsApiKey"
                value={formData.smsApiKey}
                onChange={handleChange}
                placeholder="SMS API Key"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smsApiSecret">API Secret</Label>
              <Input
                id="smsApiSecret"
                name="smsApiSecret"
                type="password"
                value={formData.smsApiSecret}
                onChange={handleChange}
                placeholder="SMS API Secret"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smsApiSender">Gönderici Adı (Başlık)</Label>
              <Input
                id="smsApiSender"
                name="smsApiSender"
                value={formData.smsApiSender}
                onChange={handleChange}
                placeholder="RestoranX"
                maxLength={11}
              />
              <p className="text-xs text-gray-500">Gönderici adı maksimum 11 karakter olabilir.</p>
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