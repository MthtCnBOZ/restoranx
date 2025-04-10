"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle, Pencil, Copy, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Kategorileri getir
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/admin/categories");
        if (!response.ok) {
          throw new Error("Kategoriler alınırken bir hata oluştu");
        }
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error("Kategoriler yüklenirken hata:", error);
        toast.error("Kategoriler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Kategori silme işlemi
  const handleDelete = async (id: string) => {
    if (confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
      setDeleting(id);
      try {
        const response = await fetch(`/api/admin/categories/${id}`, {
          method: "DELETE",
        });

        const errorData = await response.json();
        
        if (!response.ok) {
          console.log("Sunucudan dönen hata:", errorData);
          
          // API'den dönen hata mesajını doğru şekilde yakala
          const errorMessage = errorData.error 
            ? errorData.error 
            : "Kategori silinirken bir hata oluştu";
            
          throw new Error(errorMessage);
        }

        // Kategoriyi listeden kaldır
        setCategories(categories.filter((category) => category.id !== id));
        toast.success(errorData.message || "Kategori başarıyla silindi");
      } catch (error: any) {
        console.error("Kategori silme hatası:", error);
        toast.error(error.message || "Kategori silinirken bir hata oluştu");
      } finally {
        setDeleting(null);
      }
    }
  };

  // Kategori kopyalama işlemi
  const handleDuplicate = async (id: string) => {
    try {
      const category = categories.find((c) => c.id === id);
      if (!category) return;

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...category,
          id: undefined,
          name: `${category.name} (Kopya)`,
          slug: `${category.slug}-kopya-${Date.now()}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Kategori kopyalanırken bir hata oluştu");
      }

      const data = await response.json();
      
      // Yeni kategoriyi listeye ekle
      setCategories([...categories, data.category]);
      toast.success("Kategori başarıyla kopyalandı");
    } catch (error) {
      console.error("Kategori kopyalama hatası:", error);
      toast.error("Kategori kopyalanırken bir hata oluştu");
    }
  };

  // HTML içeriğinden etiketleri temizleyen fonksiyon
  const stripHtml = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Kategoriler</h1>
        <Button asChild>
          <Link href="/admin/categories/new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Yeni Kategori Ekle
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tüm Kategoriler</CardTitle>
          <CardDescription>Menü kategorilerini düzenleyin, silin veya yenilerini ekleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b p-4 font-medium">
                <div className="grid grid-cols-8 md:grid-cols-10 gap-2 w-full">
                  <span className="col-span-1">ID</span>
                  <span className="col-span-2">İkon</span>
                  <span className="col-span-3 md:col-span-5">İsim</span>
                  <span className="col-span-2">İşlemler</span>
                </div>
              </div>
              
              {loading ? (
                <div className="p-4 text-center text-sm">
                  Kategoriler yükleniyor...
                </div>
              ) : categories.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Henüz kategori eklenmemiş.
                </div>
              ) : (
                categories.map((category) => (
                  <div 
                    key={category.id} 
                    className="flex items-center justify-between border-b p-4 text-sm"
                  >
                    <div className="grid grid-cols-8 md:grid-cols-10 gap-2 w-full items-center">
                      <span className="col-span-1 text-xs text-muted-foreground">
                        {category.id.substring(0, 8)}...
                      </span>
                      <span className="col-span-2">
                        {category.icon ? (
                          <div className="h-8 w-8 relative">
                            <Image 
                              src={category.icon} 
                              alt={category.name}
                              fill
                              sizes="(max-width: 768px) 32px, 32px"
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 bg-gray-100 rounded-full"></div>
                        )}
                      </span>
                      <span className="col-span-3 md:col-span-5 font-medium">
                        {category.name}
                        {category.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {stripHtml(category.description).substring(0, 100)}
                            {stripHtml(category.description).length > 100 ? '...' : ''}
                          </p>
                        )}
                      </span>
                      <div className="col-span-2 flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => router.push(`/admin/categories/${category.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Düzenle</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDuplicate(category.id)}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Kopyala</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(category.id)}
                          disabled={deleting === category.id}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Sil</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          asChild
                        >
                          <Link href={`/category/${category.slug}`} target="_blank">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Görüntüle</span>
                          </Link>
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