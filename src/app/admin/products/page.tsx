"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PlusCircle, Loader2, Search, Trash2, Edit, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Ürünleri getir
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/products");
      
      if (!response.ok) {
        throw new Error("Ürünler alınırken bir hata oluştu");
      }
      
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error("Ürün listesi alınırken hata:", error);
      toast.error("Ürünler alınırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  // Silme işlemi
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Ürün silinirken bir hata oluştu");
      }

      setProducts(products.filter((p) => p.id !== productToDelete.id));
      toast.success("Ürün başarıyla silindi");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Ürün silinemedi:", error);
      toast.error("Ürün silinirken bir hata oluştu");
    } finally {
      setDeleting(false);
    }
  };

  // Ürün tipi seçme modalı
  const [showTypeSelection, setShowTypeSelection] = useState(false);

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Ürünler</h1>
        <Button onClick={() => setShowTypeSelection(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Yeni Ürün Ekle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ürün Listesi</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Ürün ara..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            Toplam {filteredProducts.length} ürün bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertTriangle className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Hiç ürün bulunamadı</p>
              <p className="text-muted-foreground mt-1">
                Yeni bir ürün eklemek için "Yeni Ürün Ekle" butonuna tıklayın
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Resim</th>
                    <th className="text-left p-2">Ürün Adı</th>
                    <th className="text-left p-2">Kategori</th>
                    <th className="text-left p-2">Fiyat</th>
                    <th className="text-left p-2">Stok</th>
                    <th className="text-left p-2">Varyasyon</th>
                    <th className="text-left p-2">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="p-2">
                        {product.image ? (
                          <div className="relative w-12 h-12 rounded-md overflow-hidden">
                            <Image 
                              src={product.image} 
                              alt={product.name}
                              fill
                              style={{ objectFit: "cover" }}
                              sizes="48px"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                            Resim yok
                          </div>
                        )}
                      </td>
                      <td className="p-2 font-medium">{product.name}</td>
                      <td className="p-2">
                        {product.category ? product.category.name : "-"}
                      </td>
                      <td className="p-2">{product.price} ₺</td>
                      <td className="p-2">
                        {product.hasStock ? (
                          product.inStock ? (
                            <Badge variant="success">Stokta</Badge>
                          ) : (
                            <Badge variant="destructive">Tükendi</Badge>
                          )
                        ) : (
                          <Badge variant="outline">Stoksuz Satış</Badge>
                        )}
                      </td>
                      <td className="p-2">
                        {product.variations && product.variations.length > 0 ? (
                          <Badge variant="outline">{product.variations.length} Varyasyon</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            asChild
                          >
                            <Link href={`/admin/products/${product.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Düzenle</span>
                            </Link>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Sil</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ürün Silme Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ürünü Sil</DialogTitle>
            <DialogDescription>
              <span className="font-semibold">{productToDelete?.name}</span> ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleting}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                "Ürünü Sil"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ürün Tipi Seçme Modalı */}
      <Dialog open={showTypeSelection} onOpenChange={setShowTypeSelection}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ürün Tipi Seçin</DialogTitle>
            <DialogDescription>
              Eklemek istediğiniz ürün tipini seçin
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <Link 
              href="/admin/products/add-single"
              onClick={() => setShowTypeSelection(false)}
              className="flex flex-col gap-2 p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="text-lg font-semibold">Tekil Ürün</h3>
              <p className="text-sm text-muted-foreground">
                Tek bir fiyatı olan standart ürün ekleyin
              </p>
            </Link>
            <Link 
              href="/admin/products/add-with-variations"
              onClick={() => setShowTypeSelection(false)}
              className="flex flex-col gap-2 p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="text-lg font-semibold">Varyasyonlu Ürün</h3>
              <p className="text-sm text-muted-foreground">
                Farklı boyut, seçenek veya özelliklerle ürün ekleyin
              </p>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 