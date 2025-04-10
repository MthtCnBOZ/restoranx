"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function VariationsPage() {
  const router = useRouter();
  const [variations, setVariations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Varyasyonları getir
  useEffect(() => {
    const fetchVariations = async () => {
      try {
        const response = await fetch("/api/admin/variations");
        if (!response.ok) {
          throw new Error("Varyasyonlar alınırken bir hata oluştu");
        }
        const data = await response.json();
        setVariations(data.variations);
      } catch (error) {
        console.error("Varyasyonlar yüklenirken hata:", error);
        toast.error("Varyasyonlar yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchVariations();
  }, []);

  // Varyasyon silme işlemi
  const handleDelete = async (id: string) => {
    if (confirm("Bu varyasyonu silmek istediğinize emin misiniz?")) {
      setDeleting(id);
      try {
        const response = await fetch(`/api/admin/variations/${id}`, {
          method: "DELETE",
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Varyasyon silinirken bir hata oluştu");
        }

        // Varyasyonu listeden kaldır
        setVariations(variations.filter((variation) => variation.id !== id));
        toast.success(data.message || "Varyasyon başarıyla silindi");
      } catch (error: any) {
        console.error("Varyasyon silme hatası:", error);
        toast.error(error.message || "Varyasyon silinirken bir hata oluştu");
      } finally {
        setDeleting(null);
      }
    }
  };

  // Fiyat formatını güzelleştirme
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Varyasyonlar</h1>
        <Button asChild>
          <Link href="/admin/variations/new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Yeni Varyasyon Ekle
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tüm Varyasyonlar</CardTitle>
          <CardDescription>Ürünlere eklenebilecek varyasyon seçeneklerini düzenleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b p-4 font-medium">
                <div className="grid grid-cols-12 gap-2 w-full">
                  <span className="col-span-2">ID</span>
                  <span className="col-span-3">İsim</span>
                  <span className="col-span-5">Seçenekler</span>
                  <span className="col-span-2">İşlemler</span>
                </div>
              </div>
              
              {loading ? (
                <div className="p-4 text-center text-sm">
                  Varyasyonlar yükleniyor...
                </div>
              ) : variations.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Henüz varyasyon eklenmemiş.
                </div>
              ) : (
                variations.map((variation) => (
                  <div 
                    key={variation.id} 
                    className="flex items-center justify-between border-b p-4 text-sm"
                  >
                    <div className="grid grid-cols-12 gap-2 w-full items-center">
                      <span className="col-span-2 text-xs text-muted-foreground">
                        {variation.id.substring(0, 8)}...
                      </span>
                      <span className="col-span-3 font-medium">
                        {variation.name}
                      </span>
                      <div className="col-span-5 flex flex-wrap gap-1">
                        {variation.variationoption && variation.variationoption.map((option: any) => (
                          <Badge key={option.id} variant="outline" className="text-xs">
                            {option.name}{option.price > 0 ? ` (${formatPrice(option.price)})` : ''}
                            {option.isDefault && <span className="ml-1 text-green-500">★</span>}
                          </Badge>
                        ))}
                      </div>
                      <div className="col-span-2 flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => router.push(`/admin/variations/${variation.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Düzenle</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(variation.id)}
                          disabled={deleting === variation.id}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Sil</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 