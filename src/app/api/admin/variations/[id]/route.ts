import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Belirli bir varyasyonu getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Varyasyonu getir
    const variationData = await prisma.$queryRaw`
      SELECT v.*, vo.id as optionId, vo.name as optionName, vo.price, vo.isDefault, vo.createdAt as optionCreatedAt, vo.updatedAt as optionUpdatedAt
      FROM variation v
      LEFT JOIN variationoption vo ON v.id = vo.variationId
      WHERE v.id = ${id}
      ORDER BY vo.createdAt ASC
    `;

    if (!Array.isArray(variationData) || variationData.length === 0) {
      return NextResponse.json(
        { error: "Varyasyon bulunamadı" },
        { status: 404 }
      );
    }

    // İlişkili ürünleri getir
    const productVariations = await prisma.$queryRaw`
      SELECT pv.*, p.name as productName, p.image as productImage
      FROM productvariation pv
      JOIN product p ON pv.productId = p.id
      WHERE pv.variationId = ${id}
    `;

    // Varyasyon ve seçeneklerini formatla
    const variation = {
      id: variationData[0].id,
      name: variationData[0].name,
      description: variationData[0].description,
      createdAt: variationData[0].createdAt,
      updatedAt: variationData[0].updatedAt,
      variationoption: variationData[0].optionId ? variationData.map((item: any) => ({
        id: item.optionId,
        variationId: item.id,
        name: item.optionName,
        price: item.price,
        isDefault: item.isDefault,
        createdAt: item.optionCreatedAt,
        updatedAt: item.optionUpdatedAt
      })) : [],
      productvariation: Array.isArray(productVariations) ? productVariations.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        variationId: item.variationId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        product: {
          id: item.productId,
          name: item.productName,
          image: item.productImage
        }
      })) : []
    };

    return NextResponse.json({ variation });
  } catch (error) {
    console.error("Varyasyon alınırken hata:", error);
    return NextResponse.json(
      { error: "Varyasyon alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Varyasyonu güncelle
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const { name, description, options } = body;

    // Validasyon
    if (!name || !options || !Array.isArray(options) || options.length === 0) {
      return NextResponse.json(
        { error: "Varyasyon adı ve en az bir seçenek zorunludur" },
        { status: 400 }
      );
    }

    // Varyasyonun var olup olmadığını kontrol et
    const existingVariation = await prisma.$queryRaw`
      SELECT * FROM variation WHERE id = ${id}
    `;

    if (!Array.isArray(existingVariation) || existingVariation.length === 0) {
      return NextResponse.json(
        { error: "Varyasyon bulunamadı" },
        { status: 404 }
      );
    }

    // Mevcut seçenekleri getir
    const existingOptions = await prisma.$queryRaw`
      SELECT * FROM variationoption WHERE variationId = ${id}
    `;

    // Varyasyonu güncelle
    await prisma.$executeRaw`
      UPDATE variation 
      SET name = ${name}, description = ${description}, updatedAt = NOW() 
      WHERE id = ${id}
    `;

    // Mevcut seçeneklerin ID'lerini topla
    const existingOptionIds = (existingOptions as any[]).map(option => option.id);
    const optionsToKeep = options.filter(option => option.id && existingOptionIds.includes(option.id));
    const optionsToCreate = options.filter(option => !option.id);
    
    // Silinecek seçenekleri bul
    const optionIdsToKeep = optionsToKeep.map(option => option.id);
    const optionIdsToDelete = existingOptionIds.filter(id => !optionIdsToKeep.includes(id));

    // Silme işlemi
    if (optionIdsToDelete.length > 0) {
      for (const optionId of optionIdsToDelete) {
        await prisma.$executeRaw`DELETE FROM variationoption WHERE id = ${optionId}`;
      }
    }

    // Güncelleme işlemi
    for (const option of optionsToKeep) {
      await prisma.$executeRaw`
        UPDATE variationoption 
        SET name = ${option.name}, price = ${parseFloat(option.price || "0")}, isDefault = ${option.isDefault || false}, updatedAt = NOW()
        WHERE id = ${option.id}
      `;
    }

    // Yeni seçenekleri ekle
    for (const option of optionsToCreate) {
      const optionId = uuidv4();
      await prisma.$executeRaw`
        INSERT INTO variationoption (id, variationId, name, price, isDefault, createdAt, updatedAt)
        VALUES (${optionId}, ${id}, ${option.name}, ${parseFloat(option.price || "0")}, ${option.isDefault || false}, NOW(), NOW())
      `;
    }

    // Güncellenmiş varyasyonu getir
    const updatedVariationData = await prisma.$queryRaw`
      SELECT v.*, vo.id as optionId, vo.name as optionName, vo.price, vo.isDefault, vo.createdAt as optionCreatedAt, vo.updatedAt as optionUpdatedAt
      FROM variation v
      LEFT JOIN variationoption vo ON v.id = vo.variationId
      WHERE v.id = ${id}
    `;

    // Varyasyon ve seçeneklerini formatla
    const updatedVariation = {
      id: (updatedVariationData as any[])[0].id,
      name: (updatedVariationData as any[])[0].name,
      description: (updatedVariationData as any[])[0].description,
      createdAt: (updatedVariationData as any[])[0].createdAt,
      updatedAt: (updatedVariationData as any[])[0].updatedAt,
      variationoption: (updatedVariationData as any[])[0].optionId ? (updatedVariationData as any[]).map(item => ({
        id: item.optionId,
        variationId: item.id,
        name: item.optionName,
        price: item.price,
        isDefault: item.isDefault,
        createdAt: item.optionCreatedAt,
        updatedAt: item.optionUpdatedAt
      })) : []
    };

    return NextResponse.json({
      message: "Varyasyon başarıyla güncellendi",
      variation: updatedVariation,
    });
  } catch (error) {
    console.error("Varyasyon güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Varyasyon güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Varyasyonu sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Varyasyonun var olup olmadığını kontrol et
    const existingVariation = await prisma.$queryRaw`
      SELECT * FROM variation WHERE id = ${id}
    `;

    if (!Array.isArray(existingVariation) || existingVariation.length === 0) {
      return NextResponse.json(
        { error: "Varyasyon bulunamadı" },
        { status: 404 }
      );
    }

    // İlişkili ürünleri kontrol et
    const productVariations = await prisma.$queryRaw`
      SELECT * FROM productvariation WHERE variationId = ${id}
    `;

    // Ürün ilişkilerini sil
    if (Array.isArray(productVariations) && productVariations.length > 0) {
      await prisma.$executeRaw`DELETE FROM productvariation WHERE variationId = ${id}`;
    }

    // Varyasyon seçeneklerini sil (Cascade olduğu için otomatik silinecek ama güvenlik için)
    await prisma.$executeRaw`DELETE FROM variationoption WHERE variationId = ${id}`;

    // Varyasyonu sil
    await prisma.$executeRaw`DELETE FROM variation WHERE id = ${id}`;

    return NextResponse.json({
      message: "Varyasyon başarıyla silindi",
    });
  } catch (error) {
    console.error("Varyasyon silinirken hata:", error);
    return NextResponse.json(
      { error: "Varyasyon silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 