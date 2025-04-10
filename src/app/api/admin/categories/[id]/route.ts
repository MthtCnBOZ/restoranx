import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Dinamik route'dan id parametresi
interface Params {
  params: { id: string };
}

// GET: Belirli bir kategoriyi getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    
    // Params'i await ediyoruz
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Kategoriyi getir
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Kategori bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ category }, { status: 200 });
  } catch (error) {
    console.error("Kategori getirilirken hata:", error);
    return NextResponse.json(
      { error: "Kategori getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// PUT: Belirli bir kategoriyi güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    
    // Params'i await ediyoruz
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const data = await request.json();
    
    // Gerekli alanları kontrol et
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: "Kategori adı ve slug zorunludur." },
        { status: 400 }
      );
    }
    
    // Kategoriyi bul
    const category = await prisma.category.findUnique({
      where: { id },
    });
    
    if (!category) {
      return NextResponse.json(
        { error: "Kategori bulunamadı." },
        { status: 404 }
      );
    }
    
    // Slug değişmişse benzersiz mi kontrol et
    if (data.slug !== category.slug) {
      const existingCategory = await prisma.category.findUnique({
        where: { slug: data.slug },
      });
      
      if (existingCategory && existingCategory.id !== id) {
        return NextResponse.json(
          { error: "Bu slug zaten kullanılıyor. Lütfen farklı bir slug deneyin." },
          { status: 400 }
        );
      }
    }
    
    // Kategori verisini hazırla
    const categoryData = {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      icon: data.icon || null,
      showIcon: data.showIcon || false,
      metaTitle: data.metaTitle || null,
      metaDesc: data.metaDesc || null,
      updatedAt: new Date(),
    };
    
    // ParentId ve isIndexed alanlarını ekle (type-casting ile)
    if (data.parentId && data.parentId !== "none") {
      (categoryData as any).parentId = data.parentId;
    } else {
      (categoryData as any).parentId = null;
    }
    
    (categoryData as any).isIndexed = data.isIndexed !== false;
    
    // Kategoriyi güncelle - type-casting ile
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: categoryData as any,
    });
    
    return NextResponse.json(
      { message: "Kategori başarıyla güncellendi.", category: updatedCategory },
      { status: 200 }
    );
  } catch (error) {
    console.error("Kategori güncelleme hatası:", error);
    return NextResponse.json(
      { error: "Kategori güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// DELETE: Belirli bir kategoriyi sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    
    // Params'i await ediyoruz
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    try {
      // Önce direct olarak kategoriyi kontrol et
      const category = await prisma.category.findUnique({
        where: { id },
      });
      
      if (!category) {
        return NextResponse.json(
          { error: "Kategori bulunamadı." },
          { status: 404 }
        );
      }
      
      // İlişkili ürünleri ayrı sorgula
      const relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: id
        }
      });
      
      // İlişkili ürünler varsa silmeyi engelle
      if (relatedProducts.length > 0) {
        return NextResponse.json(
          { error: "Bu kategoriye ait ürünler var. Önce ürünleri silmelisiniz." },
          { status: 400 }
        );
      }
      
      // Alt kategorileri ayrıca kontrol et
      const childCategories = await prisma.category.findMany({
        where: {
          parentId: id
        } as any
      });
      
      // Alt kategoriler varsa silmeyi engelle
      if (childCategories.length > 0) {
        return NextResponse.json(
          { error: "Bu kategorinin alt kategorileri var. Önce alt kategorileri silmelisiniz." },
          { status: 400 }
        );
      }
      
      // Kategoriyi sil
      await prisma.category.delete({
        where: { id },
      });
      
      return NextResponse.json(
        { message: "Kategori başarıyla silindi." },
        { status: 200 }
      );
    } catch (innerError: any) {
      console.error("Kategori silme iç hata:", innerError);
      return NextResponse.json(
        { error: "Kategori silinirken bir iç hata oluştu: " + (innerError.message || "Bilinmeyen hata") },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Kategori silme hatası:", error);
    return NextResponse.json(
      { error: "Kategori silinirken bir hata oluştu: " + (error.message || "Bilinmeyen hata") },
      { status: 500 }
    );
  }
} 