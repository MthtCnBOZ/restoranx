import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Belirli bir ürünü getir
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

    // Ürünü getir
    const productData = await prisma.$queryRaw`
      SELECT p.*, c.name as categoryName,
        CASE WHEN (SELECT COUNT(*) FROM productvariation WHERE productId = p.id) > 0 THEN true ELSE false END as hasVariations
      FROM product p
      LEFT JOIN category c ON p.categoryId = c.id
      WHERE p.id = ${id}
    `;

    if (!Array.isArray(productData) || productData.length === 0) {
      return NextResponse.json(
        { error: "Ürün bulunamadı" },
        { status: 404 }
      );
    }

    const productRow = (productData as any[])[0];
    const product: any = {
      id: productRow.id,
      name: productRow.name,
      slug: productRow.slug,
      description: productRow.description,
      price: productRow.price,
      basePrice: productRow.basePrice,
      hasStock: productRow.hasStock,
      stockQuantity: productRow.stockQuantity,
      inStock: productRow.stockQuantity > 0,
      image: productRow.image,
      ingredients: productRow.ingredients || [],
      createdAt: productRow.createdAt,
      updatedAt: productRow.updatedAt,
      hasVariations: productRow.hasVariations,
      categoryId: productRow.categoryId,
      metaTitle: productRow.metaTitle,
      metaDesc: productRow.metaDesc,
      noIndex: productRow.noIndex,
      category: productRow.categoryName ? {
        id: productRow.categoryId,
        name: productRow.categoryName,
      } : null
    };

    // Ekstra malzemeleri getir
    const extras = await prisma.$queryRaw`
      SELECT e.*
      FROM extra e
      JOIN productextra pe ON e.id = pe.extraId
      WHERE pe.productId = ${id}
    ` as any[];
    
    product.extras = extras;
    
    // Varyasyon bilgilerini getir
    if (product.hasVariations) {
      const variations = await prisma.$queryRaw`
        SELECT v.id, v.name, v.description
        FROM variation v
        JOIN productvariation pv ON v.id = pv.variationId
        WHERE pv.productId = ${id}
      ` as any[];
      
      // Her varyasyonun seçeneklerini getir
      const enhancedVariations = await Promise.all(
        variations.map(async (variation: any) => {
          const options = await prisma.$queryRaw`
            SELECT id, name, price, isDefault
            FROM variationoption
            WHERE variationId = ${variation.id}
            ORDER BY createdAt ASC
          ` as any[];
          
          return {
            ...variation,
            options
          };
        })
      );
      
      product.variations = enhancedVariations;
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Ürün alınırken hata:", error);
    return NextResponse.json(
      { error: "Ürün alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Ürünü güncelle
export async function PATCH(
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
    const body = await request.json();
    const {
      name,
      slug,
      description,
      price,
      basePrice,
      categoryId,
      hasStock,
      stockQuantity,
      image,
      ingredients,
      extraIds,
      hasVariations,
      variationIds,
      metaTitle,
      metaDesc,
      noIndex
    } = body;

    // Ürünün var olup olmadığını kontrol et
    const existingProduct = await prisma.$queryRaw`
      SELECT * FROM product WHERE id = ${id}
    `;

    if (!Array.isArray(existingProduct) || existingProduct.length === 0) {
      return NextResponse.json(
        { error: "Ürün bulunamadı" },
        { status: 404 }
      );
    }

    // Validasyon
    if (!name) {
      return NextResponse.json(
        { error: "Ürün adı zorunludur" },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Slug alanı zorunludur" },
        { status: 400 }
      );
    }

    if (hasVariations) {
      if (!basePrice || parseFloat(basePrice.toString()) <= 0) {
        return NextResponse.json(
          { error: "Geçerli bir temel fiyat girmelisiniz" },
          { status: 400 }
        );
      }
      
      if (!variationIds || !Array.isArray(variationIds) || variationIds.length === 0) {
        return NextResponse.json(
          { error: "En az bir varyasyon seçmelisiniz" },
          { status: 400 }
        );
      }
    } else {
      if (!price || parseFloat(price.toString()) <= 0) {
        return NextResponse.json(
          { error: "Geçerli bir fiyat girmelisiniz" },
          { status: 400 }
        );
      }
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: "Kategori seçimi zorunludur" },
        { status: 400 }
      );
    }

    // Ürünü güncelle
    await prisma.$executeRaw`
      UPDATE product 
      SET 
        name = ${name},
        slug = ${slug},
        description = ${description || ""},
        price = ${hasVariations ? 0 : parseFloat(price)},
        basePrice = ${hasVariations ? parseFloat(basePrice) : 0},
        categoryId = ${categoryId},
        hasStock = ${hasStock},
        stockQuantity = ${hasStock ? parseInt(stockQuantity) : 0},
        image = ${image || ""},
        ingredients = ${JSON.stringify(ingredients || [])},
        metaTitle = ${metaTitle || ""},
        metaDesc = ${metaDesc || ""},
        noIndex = ${noIndex === false ? false : true},
        updatedAt = NOW()
      WHERE id = ${id}
    `;

    // Ekstra malzemeleri güncelle
    if (extraIds && Array.isArray(extraIds)) {
      // Mevcut tüm ekstraları sil
      await prisma.$executeRaw`DELETE FROM productextra WHERE productId = ${id}`;
      
      // Yeni ekstraları ekle
      for (const extraId of extraIds) {
        const peId = uuidv4();
        await prisma.$executeRaw`
          INSERT INTO productextra (id, productId, extraId, createdAt, updatedAt)
          VALUES (${peId}, ${id}, ${extraId}, NOW(), NOW())
        `;
      }
    }

    // Varyasyon bilgilerini güncelle
    if (hasVariations) {
      // Mevcut tüm varyasyonları sil
      await prisma.$executeRaw`DELETE FROM productvariation WHERE productId = ${id}`;
      
      // Yeni varyasyonları ekle
      for (const variationId of variationIds) {
        const pvId = uuidv4();
        await prisma.$executeRaw`
          INSERT INTO productvariation (id, productId, variationId, createdAt, updatedAt)
          VALUES (${pvId}, ${id}, ${variationId}, NOW(), NOW())
        `;
      }
    } else {
      // Ürün artık varyasyonsuz ise tüm varyasyon ilişkilerini kaldır
      await prisma.$executeRaw`DELETE FROM productvariation WHERE productId = ${id}`;
    }

    // Güncellenmiş ürünü getir
    const updatedProductData = await prisma.$queryRaw`
      SELECT p.*, c.name as categoryName,
        CASE WHEN (SELECT COUNT(*) FROM productvariation WHERE productId = p.id) > 0 THEN true ELSE false END as hasVariations
      FROM product p
      LEFT JOIN category c ON p.categoryId = c.id
      WHERE p.id = ${id}
    `;

    const updatedProductRow = (updatedProductData as any[])[0];
    const updatedProduct: any = {
      id: updatedProductRow.id,
      name: updatedProductRow.name,
      slug: updatedProductRow.slug,
      description: updatedProductRow.description,
      price: updatedProductRow.price,
      basePrice: updatedProductRow.basePrice,
      hasStock: updatedProductRow.hasStock,
      stockQuantity: updatedProductRow.stockQuantity,
      inStock: updatedProductRow.stockQuantity > 0,
      image: updatedProductRow.image,
      ingredients: updatedProductRow.ingredients || [],
      createdAt: updatedProductRow.createdAt,
      updatedAt: updatedProductRow.updatedAt,
      hasVariations: updatedProductRow.hasVariations,
      categoryId: updatedProductRow.categoryId,
      metaTitle: updatedProductRow.metaTitle,
      metaDesc: updatedProductRow.metaDesc,
      noIndex: updatedProductRow.noIndex,
      category: updatedProductRow.categoryName ? {
        id: updatedProductRow.categoryId,
        name: updatedProductRow.categoryName,
      } : null
    };

    // Varyasyon bilgilerini getir
    if (updatedProduct.hasVariations) {
      const variations = await prisma.$queryRaw`
        SELECT v.id, v.name
        FROM variation v
        JOIN productvariation pv ON v.id = pv.variationId
        WHERE pv.productId = ${id}
      ` as any[];
      
      updatedProduct.variations = variations;
    }

    return NextResponse.json({
      message: "Ürün başarıyla güncellendi",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Ürün güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Ürün güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Ürünü sil
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

    // Ürünün var olup olmadığını kontrol et
    const existingProduct = await prisma.$queryRaw`
      SELECT * FROM product WHERE id = ${id}
    `;

    if (!Array.isArray(existingProduct) || existingProduct.length === 0) {
      return NextResponse.json(
        { error: "Ürün bulunamadı" },
        { status: 404 }
      );
    }

    // Ürüne ait varyasyon ilişkilerini sil
    await prisma.$executeRaw`DELETE FROM productvariation WHERE productId = ${id}`;

    // Sepet/sipariş öğelerini kontrol et (varsa)
    try {
      await prisma.$executeRaw`DELETE FROM cartitem WHERE productId = ${id}`;
      await prisma.$executeRaw`DELETE FROM orderitem WHERE productId = ${id}`;
    } catch (e) {
      console.log("Sepet/sipariş öğeleri silinirken hata (ilişki olmayabilir):", e);
    }

    // Ürünü sil
    await prisma.$executeRaw`DELETE FROM product WHERE id = ${id}`;

    return NextResponse.json({
      message: "Ürün başarıyla silindi",
    });
  } catch (error) {
    console.error("Ürün silinirken hata:", error);
    return NextResponse.json(
      { error: "Ürün silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 