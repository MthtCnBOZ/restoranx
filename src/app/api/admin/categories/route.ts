import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from 'uuid';

// GET: Tüm kategorileri getir
export async function GET() {
  try {
    const session = await getAuthSession();

    // Oturum kontrolü
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok." },
        { status: 403 }
      );
    }

    // Tüm kategorileri getir
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error("Kategoriler getirilirken hata:", error);
    return NextResponse.json(
      { error: "Kategoriler getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// POST: Yeni kategori oluştur
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    // Oturum kontrolü
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok." },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    // Gerekli alanları kontrol et
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: "Kategori adı ve slug zorunludur." },
        { status: 400 }
      );
    }
    
    // Slug'ın benzersiz olup olmadığını kontrol et
    const existingCategory = await prisma.category.findUnique({
      where: { slug: data.slug },
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor. Lütfen farklı bir slug deneyin." },
        { status: 400 }
      );
    }
    
    // Benzersiz ID oluştur
    const uniqueId = uuidv4();
    
    // Kategori nesnesini hazırla
    const categoryData = {
      id: uniqueId,
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
    
    // Yeni kategori oluştur - type-casting ile
    const category = await prisma.category.create({
      data: categoryData as any,
    });
    
    return NextResponse.json(
      { message: "Kategori başarıyla oluşturuldu.", category },
      { status: 201 }
    );
  } catch (error) {
    console.error("Kategori oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Kategori oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
} 