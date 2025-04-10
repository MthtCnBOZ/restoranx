"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ExtrasPage() {
  const router = useRouter();
  const [extras, setExtras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Ekstra malzemeleri getir
  useEffect(() => {
    const fetchExtras = async () => {
      try {
        const response = await fetch("/api/admin/extras");
        if (!response.ok) {
          throw new Error("Ekstra malzemeler alınırken bir hata oluştu");
        }
        const data = await response.json();
        setExtras(data.extras);
      } catch (error) {
        console.error("Ekstra malzemeler yüklenirken hata:", error);
        toast.error("Ekstra malzemeler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchExtras();
  }, []);

  // Ekstra malzeme silme işlemi
  const handleDelete = async (id: string) => {
    if (confirm("Bu ekstra malzemeyi silmek istediğinize emin misiniz?")) {
      setDeleting(id);
      try {
        const response = await fetch(`/api/admin/extras/${id}`, {
          method: "DELETE",
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Ekstra malzeme silinirken bir hata oluştu");
        }

        // Ekstra malzemeyi listeden kaldır
        setExtras(extras.filter((extra) => extra.id !== id));
        toast.success(data.message || "Ekstra malzeme başarıyla silindi");
      } catch (error: any) {
        console.error("Ekstra malzeme silme hatası:", error);
        toast.error(error.message || "Ekstra malzeme silinirken bir hata oluştu");
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
        <h1 className="text-2xl md:text-3xl font-bold">Ekstra Malzemeler</h1>
        <Button asChild>
          <Link href="/admin/extras/new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Yeni Ekstra Malzeme Ekle
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tüm Ekstra Malzemeler</CardTitle>
          <CardDescription>Ürünlere eklenebilecek ekstra malzemeleri düzenleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b p-4 font-medium">
                <div className="grid grid-cols-12 gap-2 w-full">
                  <span className="col-span-2">ID</span>
                  <span className="col-span-5">İsim</span>
                  <span className="col-span-3">Fiyat</span>
                  <span className="col-span-2">İşlemler</span>
                </div>
              </div>
              
              {loading ? (
                <div className="p-4 text-center text-sm">
                  Ekstra malzemeler yükleniyor...
                </div>
              ) : extras.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Henüz ekstra malzeme eklenmemiş.
                </div>
              ) : (
                extras.map((extra) => (
                  <div 
                    key={extra.id} 
                    className="flex items-center justify-between border-b p-4 text-sm"
                  >
                    <div className="grid grid-cols-12 gap-2 w-full items-center">
                      <span className="col-span-2 text-xs text-muted-foreground">
                        {extra.id.substring(0, 8)}...
                      </span>
                      <span className="col-span-5 font-medium">
                        {extra.name}
                      </span>
                      <span className="col-span-3">
                        {formatPrice(extra.price)}
                      </span>
                      <div className="col-span-2 flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => router.push(`/admin/extras/${extra.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Düzenle</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(extra.id)}
                          disabled={deleting === extra.id}
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