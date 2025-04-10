import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Tüm varyasyonları getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    
    const variations = await prisma.$queryRaw`
      SELECT v.*, vo.* FROM variation v
      LEFT JOIN variationoption vo ON v.id = vo.variationId
      ORDER BY v.createdAt DESC
    `;

    // Varyasyonları ve seçenekleri doğru formatta düzenle
    const formattedVariations = [];
    const variationMap = new Map();

    for (const row of variations as any[]) {
      if (!variationMap.has(row.id)) {
        variationMap.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          variationoption: []
        });
        formattedVariations.push(variationMap.get(row.id));
      }

      // Eğer variationoption varsa ekle
      if (row.variationId) {
        variationMap.get(row.id).variationoption.push({
          id: row.id,
          variationId: row.variationId,
          name: row.name,
          price: row.price,
          isDefault: row.isDefault,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        });
      }
    }

    return NextResponse.json({ variations: formattedVariations });
  } catch (error) {
    console.error("Varyasyonlar alınırken hata:", error);
    return NextResponse.json(
      { error: "Varyasyonlar alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Yeni varyasyon oluştur
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, description, options } = body;

    // Validasyon
    if (!name || !options || !Array.isArray(options) || options.length === 0) {
      return NextResponse.json(
        { error: "Varyasyon adı ve en az bir seçenek zorunludur" },
        { status: 400 }
      );
    }

    // Varyasyon seçeneklerinin doğru formatta olduğunu kontrol et
    for (const option of options) {
      if (!option.name) {
        return NextResponse.json(
          { error: "Tüm varyasyon seçenekleri için isim zorunludur" },
          { status: 400 }
        );
      }
    }

    // Yeni varyasyon oluştur
    const variationId = uuidv4();
    
    // Varyasyonu ekle
    await prisma.$executeRaw`INSERT INTO variation (id, name, description, updatedAt, createdAt) 
      VALUES (${variationId}, ${name}, ${description}, NOW(), NOW())`;
    
    // Seçenekleri ekle
    for (const option of options) {
      const optionId = uuidv4();
      const price = parseFloat(option.price || "0");
      const isDefault = option.isDefault || false;
      
      await prisma.$executeRaw`INSERT INTO variationoption (id, variationId, name, price, isDefault, updatedAt, createdAt)
        VALUES (${optionId}, ${variationId}, ${option.name}, ${price}, ${isDefault}, NOW(), NOW())`;
    }

    // Oluşturulan varyasyonu getir
    const variation = await prisma.$queryRaw`
      SELECT v.*, vo.* FROM variation v
      LEFT JOIN variationoption vo ON v.id = vo.variationId
      WHERE v.id = ${variationId}
    `;

    return NextResponse.json(
      { message: "Varyasyon başarıyla oluşturuldu", variation },
      { status: 201 }
    );
  } catch (error) {
    console.error("Varyasyon oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Varyasyon oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
} 