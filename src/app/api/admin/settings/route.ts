import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Mevcut ayarları getir
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

    // İlk ayarları getir, yoksa oluştur
    let settings = await prisma.setting.findFirst();
    
    if (!settings) {
      settings = await prisma.setting.create({
        data: {
          id: Date.now().toString(),
          siteName: "RestoranX",
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error("Ayarlar getirilirken hata:", error);
    return NextResponse.json(
      { error: "Ayarlar getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// PUT: Ayarları güncelle
export async function PUT(request: Request) {
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
    
    // İlk kaydı bul, yoksa oluştur
    let settings = await prisma.setting.findFirst();
    
    if (settings) {
      // Mevcut ayarları güncelle
      settings = await prisma.setting.update({
        where: { id: settings.id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } else {
      // Yeni ayarlar oluştur - tüm gerekli alanları tanımla
      const currentDate = new Date();
      settings = await prisma.setting.create({
        data: {
          id: Date.now().toString(),
          siteName: data.siteName || "RestoranX",
          logo: data.logo || null,
          favicon: data.favicon || null,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          metaTitle: data.metaTitle || null,
          metaDescription: data.metaDescription || null,
          googleLoginKey: data.googleLoginKey || null,
          // Iyzico ayarları
          iyzicoKey: data.iyzicoKey || null,
          iyzicoSecretKey: data.iyzicoSecretKey || null,
          iyzicoSandboxMode: data.iyzicoSandboxMode || false,
          // PayTR ayarları
          paytrKey: data.paytrKey || null,
          paytrSalt: data.paytrSalt || null,
          paytrMerchantId: data.paytrMerchantId || null,
          // SMS ayarları
          smsApiKey: data.smsApiKey || null,
          smsApiSecret: data.smsApiSecret || null,
          smsApiSender: data.smsApiSender || null,
          // Diğer ayarlar
          navbarColor: data.navbarColor || "#ffffff",
          footerColor: data.footerColor || "#f8f9fa",
          primaryColor: data.primaryColor || "#3b82f6",
          secondaryColor: data.secondaryColor || "#6b7280",
          googleAnalyticsId: data.googleAnalyticsId || null,
          googleConsoleId: data.googleConsoleId || null,
          createdAt: currentDate,
          updatedAt: currentDate,
        },
      });
    }

    return NextResponse.json(
      { message: "Ayarlar başarıyla güncellendi.", settings },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ayarlar güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Ayarlar güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
} 