"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, X, Image as ImageIcon, PlusCircle, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function AddVariationProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [variations, setVariations] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingVariations, setLoadingVariations] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    categoryId: "",
    hasStock: false,
    stockQuantity: "0",
    image: "",
    ingredients: [] as string[],
    variationIds: [] as string[],
    noIndex: true,
    slug: "",
  });

  // Kategorileri ve varyasyonları getir
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Kategorileri getir
        const categoriesResponse = await fetch("/api/admin/categories");
        if (!categoriesResponse.ok) {
          throw new Error("Kategoriler alınamadı");
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories);
        setLoadingCategories(false);
        
        // Varyasyonları getir
        const variationsResponse = await fetch("/api/admin/variations");
        if (!variationsResponse.ok) {
          throw new Error("Varyasyonlar alınamadı");
        }
        const variationsData = await variationsResponse.json();
        setVariations(variationsData.variations);
        setLoadingVariations(false);
      } catch (error) {
        console.error("Veri getirme hatası:", error);
        toast.error("Veriler yüklenirken bir hata oluştu");
        setLoadingCategories(false);
        setLoadingVariations(false);
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Fiyat için sadece sayı ve nokta kabul et
    if (name === "basePrice") {
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (value === "" || regex.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
      return;
    }
    
    // Stok için sadece sayı kabul et
    if (name === "stockQuantity") {
      if (value === "" || /^[0-9]*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSwitchChange = (checked: boolean, name: string) => {
    setFormData({ ...formData, [name]: checked });
  };

  // Resim yükleme işlemi
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya türü kontrolü
    const validFileTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validFileTypes.includes(file.type)) {
      toast.error("Sadece JPEG, PNG veya WEBP formatında resim yükleyebilirsiniz");
      return;
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resim boyutu 5MB'dan küçük olmalıdır");
      return;
    }

    // Resim boyutlarını kontrol et
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      // Resim boyutları minimum 500x500
      if (img.width < 500 || img.height < 500) {
        toast.error("Resim en az 500x500 piksel boyutunda olmalıdır");
        return;
      }

      try {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "product");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Resim yüklenirken bir hata oluştu");
        }

        const data = await response.json();
        setFormData(prev => ({ ...prev, image: data.url }));
        toast.success("Resim başarıyla yüklendi");
      } catch (error) {
        console.error("Resim yükleme hatası:", error);
        toast.error("Resim yüklenirken bir hata oluştu");
      } finally {
        setUploadingImage(false);
      }
    };

    img.src = objectUrl;
  };

  // Standart malzeme ekleme ve kaldırma
  const [newIngredient, setNewIngredient] = useState("");

  const addIngredient = () => {
    if (!newIngredient.trim()) return;
    
    if (formData.ingredients.includes(newIngredient.trim())) {
      toast.error("Bu malzeme zaten eklenmiş");
      return;
    }
    
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, newIngredient.trim()],
    });
    setNewIngredient("");
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients.splice(index, 1);
    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  // Varyasyon ekleme ve kaldırma
  const handleVariationChange = (variationId: string, isChecked: boolean) => {
    const updatedVariationIds = isChecked
      ? [...formData.variationIds, variationId]
      : formData.variationIds.filter(id => id !== variationId);
    
    setFormData({ ...formData, variationIds: updatedVariationIds });
  };

  // Değerlendirme işlemi için slug alanını kontrol et ve temizle
  const generateSlug = (text: string) => {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  // İsim değiştiğinde slug oluştur
  useEffect(() => {
    if (formData.name) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(prev.name)
      }));
    }
  }, [formData.name]);

  // Form gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validasyon
      if (!formData.name) {
        toast.error("Ürün adı zorunludur");
        setLoading(false);
        return;
      }

      if (!formData.slug) {
        toast.error("Slug alanı zorunludur");
        setLoading(false);
        return;
      }

      if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
        toast.error("Geçerli bir temel fiyat girmelisiniz");
        setLoading(false);
        return;
      }

      if (!formData.categoryId) {
        toast.error("Kategori seçimi zorunludur");
        setLoading(false);
        return;
      }

      if (formData.variationIds.length === 0) {
        toast.error("En az bir varyasyon seçmelisiniz");
        setLoading(false);
        return;
      }

      if (!formData.ingredients || formData.ingredients.length === 0) {
        toast.error("En az bir standart malzeme eklemelisiniz");
        setLoading(false);
        return;
      }

      if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) {
        toast.error("Geçerli bir stok miktarı girmelisiniz");
        setLoading(false);
        return;
      }

      // API çağrısı
      const productData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        stockQuantity: parseInt(formData.stockQuantity),
        hasVariations: true,
      };

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ürün eklenirken bir hata oluştu");
      }

      toast.success("Ürün başarıyla eklendi");
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Ürün ekleme hatası:", error);
      toast.error(error.message || "Ürün eklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/products" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Yeni Varyasyonlu Ürün Ekle</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Ürün Bilgileri</CardTitle>
            <CardDescription>
              Yeni bir varyasyonlu ürün eklemek için aşağıdaki bilgileri doldurun
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ürün Adı <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ürün adını girin"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Temel Fiyat (₺) <span className="text-red-500">*</span></Label>
                  <Input
                    id="basePrice"
                    name="basePrice"
                    placeholder="Örn: 129.90"
                    value={formData.basePrice}
                    onChange={handleChange}
                    required
                    type="text"
                    inputMode="decimal"
                  />
                  <p className="text-xs text-muted-foreground">
                    Not: Varyasyon seçenekleri ek fiyatları temel fiyata ekleyecektir
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori <span className="text-red-500">*</span></Label>
                  {loadingCategories ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Kategoriler yükleniyor...</span>
                    </div>
                  ) : (
                    <Select 
                      value={formData.categoryId} 
                      onValueChange={(value) => handleSelectChange(value, "categoryId")}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Ürün açıklaması (opsiyonel)"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug <span className="text-red-500">*</span></Label>
                  <Input
                    id="slug"
                    name="slug"
                    placeholder="urun-url-adresi"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Bu alan ürünün URL adresini belirler. Boş bırakırsanız otomatik oluşturulur.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Ürün Resmi</Label>
                  <div className="border rounded-md p-4">
                    {formData.image ? (
                      <div className="relative aspect-square w-full max-w-[300px] mx-auto mb-2 rounded-md overflow-hidden">
                        <img 
                          src={formData.image} 
                          alt="Ürün Resmi" 
                          className="object-cover w-full h-full"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full"
                          onClick={() => setFormData({ ...formData, image: "" })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="aspect-square w-full max-w-[300px] mx-auto mb-4 bg-muted rounded-md flex flex-col items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Henüz resim yüklenmedi</p>
                        <p className="text-xs text-muted-foreground">500x500 veya daha büyük önerilir</p>
                      </div>
                    )}
                    
                    <div className="flex justify-center">
                      <div className="relative">
                        <Input
                          id="image"
                          type="file"
                          accept="image/jpeg, image/png, image/webp"
                          onChange={handleImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          disabled={uploadingImage}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Yükleniyor...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-4 w-4 mr-2" />
                              {formData.image ? "Resmi Değiştir" : "Resim Yükle"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hasStock" className="cursor-pointer">Stok Takibi</Label>
                    <Switch
                      id="hasStock"
                      checked={formData.hasStock}
                      onCheckedChange={(checked) => handleSwitchChange(checked, "hasStock")}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formData.hasStock 
                      ? "Ürün stok takibi etkinleştirildi." 
                      : "Stok takibi devre dışı. Ürün stoksuz olarak satılabilir."}
                  </p>
                  
                  <div className="pt-2">
                    <Label htmlFor="stockQuantity">Stok Miktarı</Label>
                    <Input
                      id="stockQuantity"
                      name="stockQuantity"
                      type="number"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={handleChange}
                      placeholder="Stok adedi"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="noIndex" className="cursor-pointer">Arama Motorlarından Gizle</Label>
                    <Switch
                      id="noIndex"
                      checked={formData.noIndex}
                      onCheckedChange={(checked) => handleSwitchChange(checked, "noIndex")}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formData.noIndex 
                      ? "Bu ürün arama motorlarında dizine eklenmeyecek (noindex)" 
                      : "Bu ürün arama motorlarında görünür olacak"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Varyasyonlar */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">Varyasyonlar <span className="text-red-500">*</span></h3>
                  <p className="text-sm text-muted-foreground">
                    Ürün için kullanılacak varyasyonları seçin
                  </p>
                </div>
                <Link href="/admin/variations/add" className="text-sm text-primary">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/variations/add">
                      <Plus className="h-4 w-4 mr-1" />
                      Yeni Varyasyon Ekle
                    </Link>
                  </Button>
                </Link>
              </div>
              
              {loadingVariations ? (
                <div className="flex items-center space-x-2 py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Varyasyonlar yükleniyor...</span>
                </div>
              ) : variations.length === 0 ? (
                <div className="text-center py-8 border rounded-md bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-2">Henüz hiç varyasyon eklenmemiş</p>
                  <Button variant="outline" size="sm" asChild className="mt-2">
                    <Link href="/admin/variations/add">
                      <Plus className="h-4 w-4 mr-1" />
                      Varyasyon Ekle
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {variations.map((variation: any) => (
                    <div key={variation.id} className="flex items-start space-x-2 p-3 border rounded-md hover:bg-accent/20 transition-colors">
                      <Checkbox
                        id={`variation-${variation.id}`}
                        checked={formData.variationIds.includes(variation.id)}
                        onCheckedChange={(checked) => handleVariationChange(variation.id, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`variation-${variation.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {variation.name}
                        </Label>
                        {variation.description && (
                          <p className="text-sm text-muted-foreground mt-1">{variation.description}</p>
                        )}
                        {variation.variationoption && variation.variationoption.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {variation.variationoption.map((option: any) => (
                              <Badge key={option.id} variant="outline" className="text-xs">
                                {option.name}
                                {option.price > 0 && ` (+${option.price} ₺)`}
                                {option.isDefault && " (Varsayılan)"}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {formData.variationIds.length === 0 && !loadingVariations && variations.length > 0 && (
                <p className="text-sm text-red-500 mt-2">Lütfen en az bir varyasyon seçin</p>
              )}
            </div>
            
            {/* Standart Malzemeler */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">Standart Malzemeler <span className="text-red-500">*</span></h3>
                  <p className="text-sm text-muted-foreground">
                    Müşteriler sipariş verirken çıkarabileceği standart malzemeleri ekleyin
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Input
                  placeholder="Yeni bir malzeme ekleyin"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addIngredient();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={addIngredient} 
                  variant="outline"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ekle
                </Button>
              </div>
              
              {formData.ingredients.length === 0 ? (
                <p className="text-sm text-red-500 italic">En az bir malzeme eklemelisiniz</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.ingredients.map((ingredient, index) => (
                    <div 
                      key={index} 
                      className="flex items-center bg-accent px-3 py-1 rounded-full text-sm"
                    >
                      <span>{ingredient}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => removeIngredient(index)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Kaldır</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/products")}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading || uploadingImage}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                "Ürünü Kaydet"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 