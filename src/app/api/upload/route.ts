import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    // Multipart form verilerini al
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string || "general";
    
    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    // Dosya tipini kontrol et
    const validFileTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validFileTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Desteklenmeyen dosya türü. Sadece JPEG, PNG ve WebP desteklenir." },
        { status: 400 }
      );
    }

    // Dosyayı oku
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Resmi işle
    const processedImage = await sharp(buffer)
      .resize(500, 500, {
        fit: "cover",
        position: "center"
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Klasör yolunu belirle
    const uploadDir = path.join(process.cwd(), "public", "uploads", type);
    
    // Klasör yoksa oluştur
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Benzersiz dosya adı oluştur
    const fileName = `${uuidv4()}.webp`;
    const filePath = path.join(uploadDir, fileName);
    
    // Dosyayı kaydet
    await writeFile(filePath, processedImage);
    
    // Dosya URL'ini oluştur
    const fileUrl = `/uploads/${type}/${fileName}`;

    return NextResponse.json({ 
      url: fileUrl,
      message: "Dosya başarıyla yüklendi"
    });
  } catch (error) {
    console.error("Dosya yükleme hatası:", error);
    return NextResponse.json(
      { error: "Dosya yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 