"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface GeneralSettingsFormProps {
  settings: any;
  isLoading: boolean;
  onSettingsUpdated?: () => void;
}

export default function GeneralSettingsForm({ settings, isLoading, onSettingsUpdated }: GeneralSettingsFormProps) {
  const [formData, setFormData] = useState({
    siteName: settings?.siteName || "",
    logo: settings?.logo || "",
    favicon: settings?.favicon || "",
    email: settings?.email || "",
    phone: settings?.phone || "",
    address: settings?.address || "",
    metaTitle: settings?.metaTitle || "",
    metaDescription: settings?.metaDescription || "",
    googleLoginKey: settings?.googleLoginKey || "",
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings?.logo || null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(settings?.favicon || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya türü kontrolü
    const validTypes = ['image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error("Sadece PNG ve SVG dosyaları yüklenebilir");
      e.target.value = '';
      return;
    }

    // Dosya boyutu kontrolü (max 1MB)
    if (file.size > 1024 * 1024) {
      toast.error("Dosya boyutu 1MB'dan küçük olmalıdır");
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'logo') {
        setLogoPreview(reader.result as string);
        setLogoFile(file);
      } else {
        setFaviconPreview(reader.result as string);
        setFaviconFile(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Dosya yükleme işlemi
      let updatedFormData = { ...formData };
      
      if (logoFile || faviconFile) {
        const uploadData = new FormData();
        if (logoFile) uploadData.append('logo', logoFile);
        if (faviconFile) uploadData.append('favicon', faviconFile);
        
        const uploadResponse = await fetch("/api/admin/upload", {
          method: "POST",
          body: uploadData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error("Dosya yüklenirken bir hata oluştu");
        }
        
        const uploadResult = await uploadResponse.json();
        
        if (uploadResult.logoPath) {
          updatedFormData.logo = uploadResult.logoPath;
        }
        
        if (uploadResult.faviconPath) {
          updatedFormData.favicon = uploadResult.faviconPath;
        }
      }

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      });

      if (!response.ok) {
        throw new Error("Ayarlar kaydedilirken bir hata oluştu");
      }

      const data = await response.json();
      
      // Form verilerini güncellenmiş değerlerle değiştir
      setFormData(prev => ({
        ...prev,
        ...data.settings
      }));
      
      // Resim önizlemelerini güncelle
      if (data.settings.logo) {
        setLogoPreview(data.settings.logo);
      }
      
      if (data.settings.favicon) {
        setFaviconPreview(data.settings.favicon);
      }
      
      // Dosya referanslarını temizle
      setLogoFile(null);
      setFaviconFile(null);
      if (logoInputRef.current) logoInputRef.current.value = '';
      if (faviconInputRef.current) faviconInputRef.current.value = '';
      
      toast.success("Ayarlar başarıyla kaydedildi!");
      
      // Eğer callback sağlanmışsa, ayarlar güncellendiğinde çağır
      if (onSettingsUpdated) {
        onSettingsUpdated();
      }
    } catch (error) {
      console.error("Ayarlar kaydedilirken hata:", error);
      toast.error("Ayarlar kaydedilirken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = (type: 'logo' | 'favicon') => {
    if (type === 'logo') {
      setLogoPreview(null);
      setLogoFile(null);
      if (logoInputRef.current) logoInputRef.current.value = '';
    } else {
      setFaviconPreview(null);
      setFaviconFile(null);
      if (faviconInputRef.current) faviconInputRef.current.value = '';
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
            <CardTitle>Site Bilgileri</CardTitle>
            <CardDescription>
              Sitenin temel bilgilerini bu alandan düzenleyebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Adı</Label>
              <Input
                id="siteName"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                placeholder="RestoranX"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center gap-3">
                  <Input
                    ref={logoInputRef}
                    id="logo"
                    name="logo"
                    type="file"
                    accept=".png,.svg"
                    className="max-w-sm"
                    onChange={(e) => handleFileChange(e, 'logo')}
                  />
                  {logoPreview && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      type="button"
                      onClick={() => handleRemoveImage('logo')}
                    >
                      Kaldır
                    </Button>
                  )}
                </div>
                
                {logoPreview && (
                  <div className="border rounded-md p-2 max-w-[200px]">
                    <div className="relative aspect-video w-full bg-gray-100 flex items-center justify-center overflow-hidden rounded">
                      <img 
                        src={logoPreview} 
                        alt="Logo önizleme" 
                        className="object-contain max-h-[100px]"
                      />
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500">Yalnızca PNG ve SVG formatları kabul edilir. Maksimum boyut: 1MB</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="favicon">Favicon</Label>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center gap-3">
                  <Input
                    ref={faviconInputRef}
                    id="favicon"
                    name="favicon"
                    type="file"
                    accept=".png,.svg"
                    className="max-w-sm"
                    onChange={(e) => handleFileChange(e, 'favicon')}
                  />
                  {faviconPreview && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      type="button"
                      onClick={() => handleRemoveImage('favicon')}
                    >
                      Kaldır
                    </Button>
                  )}
                </div>
                
                {faviconPreview && (
                  <div className="border rounded-md p-2 max-w-[100px]">
                    <div className="relative aspect-square w-full bg-gray-100 flex items-center justify-center overflow-hidden rounded">
                      <img 
                        src={faviconPreview} 
                        alt="Favicon önizleme" 
                        className="object-contain max-h-[32px]"
                      />
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500">Yalnızca PNG ve SVG formatları kabul edilir. Maksimum boyut: 1MB</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>İletişim Bilgileri</CardTitle>
            <CardDescription>
              İletişim bilgilerinizi bu alandan düzenleyebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="info@restoranx.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+90 555 123 45 67"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Adres bilgileri"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>SEO Ayarları</CardTitle>
            <CardDescription>
              Site meta bilgilerini bu alandan düzenleyebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Başlık</Label>
              <Input
                id="metaTitle"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                placeholder="RestoranX - Restoran Sipariş Sistemi"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Açıklama</Label>
              <Textarea
                id="metaDescription"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                placeholder="RestoranX, restoranlar için özel olarak geliştirilmiş e-ticaret ve sipariş sistemidir."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Google ile Giriş</CardTitle>
            <CardDescription>
              Google ile giriş yapma özelliği için gerekli API key'leri buradan ekleyebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="googleLoginKey">Google Client ID</Label>
              <Input
                id="googleLoginKey"
                name="googleLoginKey"
                value={formData.googleLoginKey}
                onChange={handleChange}
                placeholder="Google Client ID"
              />
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