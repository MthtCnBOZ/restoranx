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
import { ArrowLeft, Loader2, Plus, X, Image as ImageIcon, PlusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { use } from "react";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState([]);
  const [extras, setExtras] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingExtras, setLoadingExtras] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    hasStock: false,
    stockQuantity: "0",
    image: "",
    ingredients: [] as string[],
    extraIds: [] as string[],
    noIndex: true,
    slug: "",
    metaTitle: "",
    metaDesc: "",
    hasVariations: false,
    basePrice: ""
  });

  // Verileri getir
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Kategorileri getir
        const categoryResponse = await fetch("/api/admin/categories");
        if (!categoryResponse.ok) {
          throw new Error("Kategoriler alınamadı");
        }
        
        const categoryData = await categoryResponse.json();
        setCategories(categoryData.categories);
        setLoadingCategories(false);
        
        // Ekstra malzemeleri getir
        const extrasResponse = await fetch("/api/admin/extras");
        if (!extrasResponse.ok) {
          throw new Error("Ekstra malzemeler alınamadı");
        }
        
        const extrasData = await extrasResponse.json();
        setExtras(extrasData.extras);
        setLoadingExtras(false);
        
        // Ürün bilgilerini getir
        const productResponse = await fetch(`/api/admin/products/${id}`);
        if (!productResponse.ok) {
          throw new Error("Ürün bilgileri alınamadı");
        }
        
        const data = await productResponse.json();
        const product = data.product;
        
        // Form verilerini doldur
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          categoryId: product.categoryId || "",
          hasStock: product.hasStock || false,
          stockQuantity: product.stockQuantity?.toString() || "0",
          image: product.image || "",
          ingredients: Array.isArray(product.ingredients) 
            ? product.ingredients 
            : (typeof product.ingredients === "string" 
              ? JSON.parse(product.ingredients || "[]") 
              : []),
          extraIds: product.extras ? product.extras.map((e: { id: string }) => e.id) : [],
          noIndex: product.noIndex !== false,
          slug: product.slug || "",
          metaTitle: product.metaTitle || "",
          metaDesc: product.metaDesc || "",
          hasVariations: product.hasVariations || false,
          basePrice: product.basePrice?.toString() || ""
        });
      } catch (error) {
        console.error("Veri getirme hatası:", error);
        toast.error("Veriler yüklenirken bir hata oluştu");
        router.push("/admin/products");
      } finally {
        setFetching(false);
      }
    };
    
    fetchData();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Fiyat için sadece sayı ve nokta kabul et
    if (name === "price" || name === "basePrice") {
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
    if (formData.name && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(prev.name)
      }));
    }
  }, [formData.name]);

  const handleExtraChange = (extraId: string) => {
    const updatedExtraIds = formData.extraIds.includes(extraId)
      ? formData.extraIds.filter(id => id !== extraId)
      : [...formData.extraIds, extraId];
    
    setFormData({ ...formData, extraIds: updatedExtraIds });
  };

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

      if (!formData.hasVariations) {
        if (!formData.price || parseFloat(formData.price) <= 0) {
          toast.error("Geçerli bir fiyat girmelisiniz");
          setLoading(false);
          return;
        }
      } else {
        if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
          toast.error("Geçerli bir temel fiyat girmelisiniz");
          setLoading(false);
          return;
        }
      }

      if (!formData.categoryId) {
        toast.error("Kategori seçimi zorunludur");
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
        price: parseFloat(formData.price || "0"),
        basePrice: parseFloat(formData.basePrice || "0"),
        stockQuantity: parseInt(formData.stockQuantity)
      };

      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ürün güncellenirken bir hata oluştu");
      }

      toast.success("Ürün başarıyla güncellendi");
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Ürün güncelleme hatası:", error);
      toast.error(error.message || "Ürün güncellenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Ürün bilgileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/products" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Ürünü Düzenle</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Ürün Bilgileri</CardTitle>
            <CardDescription>
              Ürün bilgilerini düzenlemek için aşağıdaki alanları güncelleyin
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
                
                {!formData.hasVariations ? (
                  <div className="space-y-2">
                    <Label htmlFor="price">Fiyat (₺) <span className="text-red-500">*</span></Label>
                    <Input
                      id="price"
                      name="price"
                      placeholder="Örn: 129.90"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      type="text"
                      inputMode="decimal"
                    />
                  </div>
                ) : (
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
                  </div>
                )}
                
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

                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Başlık</Label>
                  <Input
                    id="metaTitle"
                    name="metaTitle"
                    placeholder="SEO başlığı (opsiyonel)"
                    value={formData.metaTitle}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Boş bırakırsanız ürün adı kullanılır.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDesc">Meta Açıklama</Label>
                  <Textarea
                    id="metaDesc"
                    name="metaDesc"
                    placeholder="SEO açıklaması (opsiyonel)"
                    value={formData.metaDesc}
                    onChange={handleChange}
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    Boş bırakırsanız ürün açıklaması kullanılır.
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
            
            {/* Ekstra Malzemeler */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">Ekstra Malzemeler</h3>
                  <p className="text-sm text-muted-foreground">
                    Müşterilerin sipariş verirken ekleyebileceği ekstra malzemeleri seçin
                  </p>
                </div>
              </div>
              
              {loadingExtras ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Ekstra malzemeler yükleniyor...</span>
                </div>
              ) : extras.length === 0 ? (
                <p className="text-sm text-muted-foreground">Henüz ekstra malzeme eklenmemiş</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {extras.map((extra) => (
                    <div
                      key={extra.id}
                      className="flex items-center space-x-2 bg-muted/40 rounded-md px-3 py-2"
                    >
                      <input
                        type="checkbox"
                        id={`extra-${extra.id}`}
                        checked={formData.extraIds.includes(extra.id)}
                        onChange={() => handleExtraChange(extra.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor={`extra-${extra.id}`} className="flex-1 cursor-pointer flex items-center justify-between">
                        <span>{extra.name}</span>
                        <span className="text-sm font-medium text-muted-foreground">+{extra.price} ₺</span>
                      </Label>
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
                  Güncelleniyor...
                </>
              ) : (
                "Değişiklikleri Kaydet"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 