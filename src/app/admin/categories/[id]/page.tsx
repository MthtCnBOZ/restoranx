"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import Link from "next/link";
import RichTextEditor from "@/components/admin/editor/RichTextEditor";

export default function CategoryEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const isNew = id === "new";
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: "none", // Ana kategori veya alt kategori
    icon: "",
    showIcon: false,
    metaTitle: "",
    metaDesc: "",
    isIndexed: true,
  });

  // URL için slug oluştur
  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }, []);

  // Input değişikliklerini takip et
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Eğer isim değişirse otomatik slug oluştur
    if (name === "name") {
      setFormData({
        ...formData,
        name: value,
        slug: generateSlug(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Switch ve Checkbox değişikliklerini takip et
  const handleToggleChange = (field: string, value: boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Select değişikliklerini takip et
  const handleSelectChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Dosya yükleme
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Dosyayı önizle
    const reader = new FileReader();
    reader.onload = () => {
      setIconPreview(reader.result as string);
      setIconFile(file);
    };
    reader.readAsDataURL(file);
  };

  // Kategoriyi yükle (düzenleme durumunda)
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
      }
    };

    fetchCategories();

    if (!isNew) {
      const fetchCategory = async () => {
        try {
          const response = await fetch(`/api/admin/categories/${id}`);
          if (!response.ok) {
            throw new Error("Kategori alınırken bir hata oluştu");
          }
          
          const data = await response.json();
          const category = data.category;
          
          setFormData({
            name: category.name || "",
            slug: category.slug || "",
            description: category.description || "",
            parentId: category.parentId || "none",
            icon: category.icon || "",
            showIcon: category.showIcon || false,
            metaTitle: category.metaTitle || "",
            metaDesc: category.metaDesc || "",
            isIndexed: category.isIndexed !== false, // Varsayılan olarak true
          });

          if (category.icon) {
            setIconPreview(category.icon);
          }
        } catch (error) {
          console.error("Kategori yüklenirken hata:", error);
          toast.error("Kategori yüklenirken bir hata oluştu");
        } finally {
          setLoading(false);
        }
      };

      fetchCategory();
    }
  }, [id, isNew]);

  // Kategori kaydet
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Önce ikon dosyası varsa yükle
      let iconPath = formData.icon;
      
      if (iconFile) {
        const uploadData = new FormData();
        uploadData.append('icon', iconFile);
        
        const uploadResponse = await fetch("/api/admin/upload", {
          method: "POST",
          body: uploadData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error("İkon yüklenirken bir hata oluştu");
        }
        
        const uploadResult = await uploadResponse.json();
        
        if (uploadResult.iconPath) {
          iconPath = uploadResult.iconPath;
        }
      }

      // Kategoriyi kaydet
      const apiUrl = isNew 
        ? "/api/admin/categories" 
        : `/api/admin/categories/${id}`;
      
      const method = isNew ? "POST" : "PUT";
      
      const response = await fetch(apiUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          icon: iconPath,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kategori kaydedilirken bir hata oluştu");
      }

      toast.success(`Kategori başarıyla ${isNew ? "oluşturuldu" : "güncellendi"}!`);
      router.push("/admin/categories");
    } catch (error: any) {
      console.error("Kategori kaydetme hatası:", error);
      toast.error(error.message || "Kategori kaydedilirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/categories")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">
            {isNew ? "Yeni Kategori Ekle" : "Kategori Düzenle"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Temel Bilgiler</CardTitle>
              <CardDescription>
                Kategori temel bilgilerini burada düzenleyebilirsiniz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Kategori Adı</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Kategori adı"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL (Slug)</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="kategori-url"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Kategori adı girildiğinde otomatik oluşturulur, değiştirebilirsiniz
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentId">Ana Kategori</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => handleSelectChange("parentId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ana Kategori Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ana Kategori (Üst kategori yok)</SelectItem>
                    {categories
                      .filter((c) => c.id !== id) // Kendisini filtreliyoruz
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Eğer bu bir alt kategori ise, ana kategorisini seçin
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Kategori Açıklaması</Label>
                <RichTextEditor 
                  value={formData.description} 
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      description: value,
                    });
                  }}
                  placeholder="Kategori açıklaması yazın..."
                />
                <p className="text-xs text-muted-foreground">
                  Zengin metin düzenleyicisini kullanarak açıklama ekleyebilirsiniz
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kategori İkonu</CardTitle>
              <CardDescription>
                Kategori için bir ikon belirleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="icon">İkon</Label>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center gap-3">
                    <Input
                      id="icon"
                      name="icon"
                      type="file"
                      accept=".png,.svg"
                      className="max-w-sm"
                      onChange={handleFileChange}
                    />
                  </div>
                  
                  {iconPreview && (
                    <div className="border rounded-md p-2 max-w-[100px]">
                      <div className="relative aspect-square w-full bg-gray-100 flex items-center justify-center overflow-hidden rounded">
                        <img 
                          src={iconPreview} 
                          alt="İkon önizleme" 
                          className="object-contain max-h-[64px]"
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">Yalnızca PNG ve SVG formatları kabul edilir. Maksimum boyut: 1MB</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showIcon"
                  checked={formData.showIcon}
                  onCheckedChange={(checked) => handleToggleChange("showIcon", checked)}
                />
                <Label htmlFor="showIcon">İkonu menüde göster</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Ayarları</CardTitle>
              <CardDescription>
                Kategori sayfası için SEO ayarlarını yapılandırın
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
                  placeholder="Kategori meta başlığı"
                />
                <p className="text-xs text-muted-foreground">
                  Boş bırakırsanız, kategori adı kullanılacaktır
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDesc">Meta Açıklama</Label>
                <Textarea
                  id="metaDesc"
                  name="metaDesc"
                  value={formData.metaDesc}
                  onChange={handleChange}
                  placeholder="Kategori meta açıklaması"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isIndexed"
                  checked={formData.isIndexed}
                  onCheckedChange={(checked) => handleToggleChange("isIndexed", checked as boolean)}
                />
                <Label htmlFor="isIndexed">
                  Arama motorları bu sayfayı indeksleyebilir (index)
                </Label>
              </div>
            </CardContent>
          </Card>

          <CardFooter className="flex justify-between px-0">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push("/admin/categories")}
            >
              İptal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>Kaydet</>
              )}
            </Button>
          </CardFooter>
        </div>
      </form>
    </div>
  );
} 