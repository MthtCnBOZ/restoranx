"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Plus, X, ArrowUpDown, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { v4 as uuidv4 } from "uuid";
import { use } from "react";

export default function EditVariationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [options, setOptions] = useState<any[]>([]);

  // Varyasyon bilgilerini getir
  useEffect(() => {
    const fetchVariation = async () => {
      try {
        const response = await fetch(`/api/admin/variations/${id}`);
        
        if (!response.ok) {
          throw new Error("Varyasyon bilgileri alınamadı");
        }
        
        const data = await response.json();
        setFormData({
          name: data.variation.name,
          description: data.variation.description || "",
        });
        
        setOptions(data.variation.variationoption.map((option: any) => ({
          id: option.id,
          name: option.name,
          price: option.price.toString(),
          isDefault: option.isDefault,
        })));
      } catch (error) {
        console.error("Varyasyon getirme hatası:", error);
        toast.error("Varyasyon bilgileri yüklenirken bir hata oluştu");
        router.push("/admin/variations");
      } finally {
        setFetching(false);
      }
    };

    fetchVariation();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOptionChange = (index: number, field: string, value: string | boolean) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, { name: "", price: "", isDefault: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length === 1) {
      toast.error("En az bir seçenek gereklidir");
      return;
    }
    
    const newOptions = [...options];
    newOptions.splice(index, 1);
    
    // Eğer varsayılan seçenek silindiyse, ilk seçeneği varsayılan yap
    if (options[index].isDefault && newOptions.length > 0) {
      newOptions[0].isDefault = true;
    }
    
    setOptions(newOptions);
  };

  const handleSetDefault = (index: number) => {
    const newOptions = options.map((option, i) => ({
      ...option,
      isDefault: i === index,
    }));
    setOptions(newOptions);
  };

  const moveOption = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) || 
      (direction === "down" && index === options.length - 1)
    ) {
      return;
    }

    const newOptions = [...options];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    [newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]];
    
    setOptions(newOptions);
  };

  const validatePrice = (value: string) => {
    const regex = /^[0-9]*\.?[0-9]*$/;
    return value === "" || regex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validasyon
      if (!formData.name) {
        toast.error("Varyasyon adı zorunludur");
        setLoading(false);
        return;
      }

      if (options.some(option => !option.name)) {
        toast.error("Tüm seçenekler için isim belirtilmelidir");
        setLoading(false);
        return;
      }

      // Varsayılan seçenek kontrolü
      if (!options.some(option => option.isDefault)) {
        toast.warning("Varsayılan bir seçenek belirtilmedi. İlk seçenek varsayılan olarak ayarlanacak.");
        const newOptions = [...options];
        newOptions[0].isDefault = true;
        setOptions(newOptions);
      }

      const response = await fetch(`/api/admin/variations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          options,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Varyasyon güncellenirken bir hata oluştu");
      }

      toast.success("Varyasyon başarıyla güncellendi");
      router.push("/admin/variations");
    } catch (error: any) {
      console.error("Varyasyon güncelleme hatası:", error);
      toast.error(error.message || "Varyasyon güncellenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Varyasyon bilgileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/variations" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Varyasyon Düzenle</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Varyasyon Bilgileri</CardTitle>
            <CardDescription>
              Varyasyon bilgilerini ve seçeneklerini düzenleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Varyasyon Adı <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                placeholder="Örn: Pizza Boyutu"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Varyasyon hakkında açıklama (opsiyonel)"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Varyasyon Seçenekleri</h3>
                <Button type="button" onClick={handleAddOption} variant="outline" size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Yeni Seçenek Ekle
                </Button>
              </div>

              <div className="space-y-4">
                {options.map((option, index) => (
                  <div key={option.id || index} className="border rounded-md p-4 relative">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-5">
                        <Label htmlFor={`option-name-${index}`}>Seçenek Adı <span className="text-red-500">*</span></Label>
                        <Input
                          id={`option-name-${index}`}
                          placeholder="Örn: Büyük Boy"
                          value={option.name}
                          onChange={(e) => handleOptionChange(index, "name", e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-3">
                        <Label htmlFor={`option-price-${index}`}>Ek Fiyat (₺)</Label>
                        <Input
                          id={`option-price-${index}`}
                          placeholder="Örn: 10.50"
                          value={option.price}
                          onChange={(e) => {
                            if (validatePrice(e.target.value)) {
                              handleOptionChange(index, "price", e.target.value);
                            }
                          }}
                          className="mt-1"
                          type="text"
                          inputMode="decimal"
                        />
                      </div>
                      <div className="col-span-4 flex items-end space-x-2">
                        <div className="flex items-center space-x-2 mt-1">
                          <Switch
                            id={`option-default-${index}`}
                            checked={option.isDefault}
                            onCheckedChange={() => handleSetDefault(index)}
                          />
                          <Label htmlFor={`option-default-${index}`} className="cursor-pointer">
                            Varsayılan
                          </Label>
                        </div>
                        <div className="flex space-x-1 mt-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => moveOption(index, "up")}
                            disabled={index === 0}
                            className="h-8 w-8"
                          >
                            <ArrowUpDown className="h-4 w-4" />
                            <span className="sr-only">Sırayı Değiştir</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveOption(index)}
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Sil</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/variations")}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Varyasyonu Güncelle"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 