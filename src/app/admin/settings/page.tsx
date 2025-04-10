"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralSettingsForm from "@/components/admin/settings/GeneralSettingsForm";
import PaymentSettingsForm from "@/components/admin/settings/PaymentSettingsForm";
import SmsSettingsForm from "@/components/admin/settings/SmsSettingsForm"; 
import AnalyticsSettingsForm from "@/components/admin/settings/AnalyticsSettingsForm";
import AppearanceSettingsForm from "@/components/admin/settings/AppearanceSettingsForm";
import { toast } from "sonner";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  // Ayarları yüklemek için kullanılan fonksiyon
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/settings");
      if (!response.ok) {
        throw new Error("Ayarlar yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      console.log("Ayarlar yüklendi:", data.settings);
      setSettings(data.settings);
    } catch (error) {
      console.error("Ayarlar yüklenirken hata:", error);
      toast.error("Ayarlar yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sayfa yüklendiğinde ayarları getir
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings, lastUpdated]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Ayarlar güncellendiğinde sayfayı yenilemek için kullanılacak fonksiyon
  const handleSettingsUpdated = () => {
    console.log("Ayarlar güncellendi, yeniden yükleniyor...");
    setLastUpdated(Date.now());
  };

  return (
    <div className="container py-4 md:py-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Site Ayarları</h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">
          Sitenin genel ayarlarını, ödeme sistemlerini ve görünümünü buradan yönetebilirsiniz.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ayarlar</CardTitle>
          <CardDescription>
            Tüm site ayarlarını buradan yapılandırabilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" onValueChange={handleTabChange} value={activeTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1">
              <TabsTrigger value="general">Genel</TabsTrigger>
              <TabsTrigger value="payment">Ödeme</TabsTrigger>
              <TabsTrigger value="sms">SMS</TabsTrigger>
              <TabsTrigger value="analytics">Analitik</TabsTrigger>
              <TabsTrigger value="appearance">Görünüm</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="general">
                <GeneralSettingsForm 
                  settings={settings} 
                  isLoading={isLoading}
                  onSettingsUpdated={handleSettingsUpdated}
                />
              </TabsContent>
              
              <TabsContent value="payment">
                <PaymentSettingsForm 
                  settings={settings} 
                  isLoading={isLoading}
                  onSettingsUpdated={handleSettingsUpdated} 
                />
              </TabsContent>
              
              <TabsContent value="sms">
                <SmsSettingsForm 
                  settings={settings} 
                  isLoading={isLoading}
                  onSettingsUpdated={handleSettingsUpdated}
                />
              </TabsContent>
              
              <TabsContent value="analytics">
                <AnalyticsSettingsForm 
                  settings={settings} 
                  isLoading={isLoading}
                  onSettingsUpdated={handleSettingsUpdated}
                />
              </TabsContent>
              
              <TabsContent value="appearance">
                <AppearanceSettingsForm 
                  settings={settings} 
                  isLoading={isLoading}
                  onSettingsUpdated={handleSettingsUpdated}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 