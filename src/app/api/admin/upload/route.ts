import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getAuthSession } from "@/lib/auth";

// Dosyaları işleyen yardımcı fonksiyon
async function saveFile(formData: FormData, fieldName: string): Promise<string | null> {
  const file = formData.get(fieldName) as File;
  
  if (!file) {
    return null;
  }
  
  // Dosya türünü kontrol et
  const validTypes = ['image/png', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    throw new Error(`Geçersiz dosya türü: ${file.type}. Sadece PNG ve SVG dosyaları kabul edilir.`);
  }
  
  // Dosya boyutunu kontrol et (max 1MB)
  if (file.size > 1024 * 1024) {
    throw new Error("Dosya boyutu 1MB'dan büyük olamaz.");
  }
  
  // Dosyanın içeriğini al
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Dosya adını oluştur (benzersiz olması için timestamp ekle)
  const timestamp = Date.now();
  const extension = file.type === 'image/png' ? 'png' : 'svg';
  const filename = `${fieldName}_${timestamp}.${extension}`;
  
  // Hedef dizini ve tam dosya yolunu oluştur
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  const filePath = join(uploadsDir, filename);
  
  try {
    // Klasör yoksa oluştur
    await mkdir(uploadsDir, { recursive: true });
    // Dosyayı yaz
    await writeFile(filePath, buffer);
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Dosya kaydetme hatası:', error);
    throw new Error("Dosya kaydedilemedi.");
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    
    // Yetki kontrolü
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok." },
        { status: 403 }
      );
    }
    
    const formData = await request.formData();
    const result: {
      logoPath?: string;
      faviconPath?: string;
      iconPath?: string;
    } = {};
    
    // Logo dosyasını işle
    try {
      const logoPath = await saveFile(formData, 'logo');
      if (logoPath) {
        result.logoPath = logoPath;
      }
    } catch (error) {
      console.error("Logo yükleme hatası:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Logo yüklenirken bir hata oluştu." },
        { status: 400 }
      );
    }
    
    // Favicon dosyasını işle
    try {
      const faviconPath = await saveFile(formData, 'favicon');
      if (faviconPath) {
        result.faviconPath = faviconPath;
      }
    } catch (error) {
      console.error("Favicon yükleme hatası:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Favicon yüklenirken bir hata oluştu." },
        { status: 400 }
      );
    }
    
    // İkon dosyasını işle
    try {
      const iconPath = await saveFile(formData, 'icon');
      if (iconPath) {
        result.iconPath = iconPath;
      }
    } catch (error) {
      console.error("İkon yükleme hatası:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "İkon yüklenirken bir hata oluştu." },
        { status: 400 }
      );
    }
    
    // Hiçbir dosya yüklenmediyse hata döndür
    if (!result.logoPath && !result.faviconPath && !result.iconPath) {
      return NextResponse.json(
        { error: "Hiçbir dosya yüklenmedi." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Dosya yükleme hatası:", error);
    return NextResponse.json(
      { error: "Dosya yükleme sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
} 