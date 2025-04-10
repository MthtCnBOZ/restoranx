"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentSettingsFormProps {
  settings: any;
  isLoading: boolean;
  onSettingsUpdated?: () => void;
}

export default function PaymentSettingsForm({ settings, isLoading, onSettingsUpdated }: PaymentSettingsFormProps) {
  const [formData, setFormData] = useState({
    paytrKey: settings?.paytrKey || "",
    paytrSalt: settings?.paytrSalt || "",
    paytrMerchantId: settings?.paytrMerchantId || "",
    iyzicoKey: settings?.iyzicoKey || "",
    iyzicoSecretKey: settings?.iyzicoSecretKey || "",
    iyzicoSandboxMode: settings?.iyzicoSandboxMode || false,
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Form verisini hazırlayıp, boolean değeri doğru formatta gönderelim
    const requestData = {
      ...formData,
      iyzicoSandboxMode: Boolean(formData.iyzicoSandboxMode)
    };

    console.log("Gönderilen form verileri:", requestData);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Ödeme ayarları kaydedilirken bir hata oluştu");
      }

      const data = await response.json();
      
      console.log("Sunucudan dönen veri:", data);
      
      // Form verilerini güncellenmiş değerlerle güncelle
      setFormData(prev => ({
        ...prev,
        ...data.settings
      }));
      
      toast.success("Ödeme ayarları başarıyla kaydedildi!");
      
      // Eğer callback sağlanmışsa, ayarlar güncellendiğinde çağır
      if (onSettingsUpdated) {
        onSettingsUpdated();
      }
    } catch (error) {
      console.error("Ödeme ayarları kaydedilirken hata:", error);
      toast.error("Ödeme ayarları kaydedilirken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  const testIyzicoConnection = async () => {
    if (!formData.iyzicoKey || !formData.iyzicoSecretKey) {
      toast.error("Iyzico API ve Secret Key bilgilerini girmelisiniz");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/payment/test-iyzico", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: formData.iyzicoKey,
          secretKey: formData.iyzicoSecretKey,
          sandbox: formData.iyzicoSandboxMode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Iyzico bağlantı testi başarısız oldu");
      }

      toast.success("Iyzico bağlantı testi başarılı!");
    } catch (error) {
      console.error("Iyzico test hatası:", error);
      toast.error("Iyzico bağlantı testi başarısız oldu");
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
            <CardTitle>PayTR Ödeme Altyapısı</CardTitle>
            <CardDescription>
              PayTR ödeme sistemi entegrasyonu için gerekli API bilgilerini buradan ayarlayabilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paytrMerchantId">Merchant ID</Label>
              <Input
                id="paytrMerchantId"
                name="paytrMerchantId"
                value={formData.paytrMerchantId}
                onChange={handleChange}
                placeholder="PayTR Merchant ID"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paytrKey">API Key</Label>
              <Input
                id="paytrKey"
                name="paytrKey"
                value={formData.paytrKey}
                onChange={handleChange}
                placeholder="PayTR API Key"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paytrSalt">API Salt</Label>
              <Input
                id="paytrSalt"
                name="paytrSalt"
                value={formData.paytrSalt}
                onChange={handleChange}
                placeholder="PayTR API Salt"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Iyzico Ödeme Altyapısı</CardTitle>
            <CardDescription>
              Iyzico ödeme sistemi entegrasyonu için gerekli API bilgilerini buradan ayarlayabilirsiniz.
              <p className="mt-1 text-xs text-muted-foreground">
                API Anahtarlarınızı <a href="https://merchant.iyzipay.com/settings" target="_blank" rel="noopener noreferrer" className="underline text-primary">Iyzico Merchant Paneli</a> üzerinden alabilirsiniz.
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="iyzicoKey">API Key</Label>
              <Input
                id="iyzicoKey"
                name="iyzicoKey"
                value={formData.iyzicoKey}
                onChange={handleChange}
                placeholder="Iyzico API Key"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="iyzicoSecretKey">Secret Key</Label>
              <Input
                id="iyzicoSecretKey"
                name="iyzicoSecretKey"
                type="password"
                value={formData.iyzicoSecretKey}
                onChange={handleChange}
                placeholder="Iyzico Secret Key"
              />
            </div>
            
            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="iyzicoSandboxMode"
                checked={formData.iyzicoSandboxMode}
                onCheckedChange={(checked) => handleSwitchChange("iyzicoSandboxMode", checked)}
              />
              <Label htmlFor="iyzicoSandboxMode">Sandbox Modu (Test Modu)</Label>
            </div>
            
            <div className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={testIyzicoConnection}
                disabled={isSaving || !formData.iyzicoKey || !formData.iyzicoSecretKey}
              >
                Iyzico Bağlantısını Test Et
              </Button>
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