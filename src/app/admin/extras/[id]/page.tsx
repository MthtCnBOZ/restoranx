"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { use } from "react";

export default function EditExtraPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
  });

  // Ekstra malzeme bilgilerini getir
  useEffect(() => {
    const fetchExtra = async () => {
      try {
        const response = await fetch(`/api/admin/extras/${id}`);
        
        if (!response.ok) {
          throw new Error("Ekstra malzeme bilgileri alınamadı");
        }
        
        const data = await response.json();
        setFormData({
          name: data.extra.name,
          price: data.extra.price.toString(),
        });
      } catch (error) {
        console.error("Ekstra malzeme getirme hatası:", error);
        toast.error("Ekstra malzeme bilgileri yüklenirken bir hata oluştu");
        router.push("/admin/extras");
      } finally {
        setFetching(false);
      }
    };

    fetchExtra();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Fiyatın sadece sayı ve nokta içermesini sağla
    if (name === "price") {
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (value === "" || regex.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validasyon
      if (!formData.name || !formData.price) {
        toast.error("Tüm alanları doldurun");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/extras/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ekstra malzeme güncellenirken bir hata oluştu");
      }

      toast.success("Ekstra malzeme başarıyla güncellendi");
      router.push("/admin/extras");
    } catch (error: any) {
      console.error("Ekstra malzeme güncelleme hatası:", error);
      toast.error(error.message || "Ekstra malzeme güncellenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Ekstra malzeme bilgileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/extras" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Ekstra Malzeme Düzenle</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Ekstra Malzeme Bilgileri</CardTitle>
            <CardDescription>Ekstra malzeme bilgilerini düzenleyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Malzeme Adı <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                placeholder="Örn: Ekstra Peynir"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Fiyat (₺) <span className="text-red-500">*</span></Label>
              <Input
                id="price"
                name="price"
                placeholder="Örn: 10.50"
                value={formData.price}
                onChange={handleChange}
                required
                type="text"
                inputMode="decimal"
              />
              <p className="text-sm text-muted-foreground">
                Ondalık ayırmak için nokta kullanın. Örn: 10.50
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/extras")}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Ekstra Malzemeyi Güncelle"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 