import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Tüm ürünleri getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    
    const products = await prisma.$queryRaw`
      SELECT p.*, c.name as categoryName,
        CASE WHEN (SELECT COUNT(*) FROM productvariation WHERE productId = p.id) > 0 THEN true ELSE false END as hasVariations
      FROM product p
      LEFT JOIN category c ON p.categoryId = c.id
      ORDER BY p.createdAt DESC
    `;
    
    // Ürünleri ve varyasyonları düzenle
    const formattedProducts = [];
    
    for (const row of products as any[]) {
      const product: any = {
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        basePrice: row.basePrice,
        hasStock: row.hasStock,
        stockQuantity: row.stockQuantity,
        inStock: row.stockQuantity > 0,
        image: row.image,
        ingredients: row.ingredients ? (typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : row.ingredients) : [],
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        hasVariations: row.hasVariations === 1 || row.hasVariations === true,
        category: row.categoryId && row.categoryName ? {
          id: row.categoryId,
          name: row.categoryName,
        } : null
      };
      
      // Varyasyon bilgilerini getir
      if (product.hasVariations) {
        const variations = await prisma.$queryRaw`
          SELECT v.id, v.name, COUNT(vo.id) as optionCount
          FROM variation v
          JOIN productvariation pv ON v.id = pv.variationId
          JOIN variationoption vo ON v.id = vo.variationId
          WHERE pv.productId = ${row.id}
          GROUP BY v.id, v.name
        `;
        
        product.variations = variations;
      }
      
      formattedProducts.push(product);
    }
    
    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error("Ürünler alınırken hata:", error);
    return NextResponse.json(
      { error: "Ürünler alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Yeni ürün oluştur
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    
    const body = await request.json();
    const {
      name,
      description,
      price,
      basePrice,
      categoryId,
      hasStock,
      stockQuantity,
      image,
      ingredients,
      hasVariations,
      variationIds,
      noIndex
    } = body;

    // Validasyon
    if (!name) {
      return NextResponse.json(
        { error: "Ürün adı zorunludur" },
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

    if (hasStock && (stockQuantity === undefined || parseInt(stockQuantity.toString()) < 0)) {
      return NextResponse.json(
        { error: "Geçerli bir stok miktarı girmelisiniz" },
        { status: 400 }
      );
    }

    // Yeni ürün oluştur
    const productId = uuidv4();
    
    // Ürünü ekle
    await prisma.$executeRaw`
      INSERT INTO product (
        id, name, description, price, basePrice, categoryId, hasStock, stockQuantity, 
        image, ingredients, noIndex, slug, updatedAt, createdAt
      ) VALUES (
        ${productId}, 
        ${name}, 
        ${description || ""}, 
        ${hasVariations ? 0 : parseFloat(price)}, 
        ${hasVariations ? parseFloat(basePrice) : 0}, 
        ${categoryId}, 
        ${hasStock}, 
        ${hasStock ? parseInt(stockQuantity) : 0}, 
        ${image || ""}, 
        ${JSON.stringify(ingredients || [])},
        ${noIndex === false ? false : true},
        ${body.slug || name.toLowerCase().replace(/\s+/g, "-")},
        NOW(), 
        NOW()
      )
    `;
    
    // Varyasyonlu ürünse varyasyonları ekle
    if (hasVariations && variationIds.length > 0) {
      for (const variationId of variationIds) {
        const pvId = uuidv4();
        await prisma.$executeRaw`
          INSERT INTO productvariation (id, productId, variationId, createdAt, updatedAt)
          VALUES (${pvId}, ${productId}, ${variationId}, NOW(), NOW())
        `;
      }
    }

    // Oluşturulan ürünü getir
    const product = await prisma.$queryRaw`
      SELECT p.*, c.name as categoryName
      FROM product p
      LEFT JOIN category c ON p.categoryId = c.id
      WHERE p.id = ${productId}
    `;

    let variations: any[] = [];
    if (hasVariations) {
      variations = await prisma.$queryRaw`
        SELECT v.id, v.name 
        FROM variation v
        JOIN productvariation pv ON v.id = pv.variationId
        WHERE pv.productId = ${productId}
      ` as any[];
    }

    return NextResponse.json(
      { 
        message: "Ürün başarıyla oluşturuldu", 
        product: { 
          ...(product as any[])[0], 
          variations,
          category: (product as any[])[0].categoryId && (product as any[])[0].categoryName ? {
            id: (product as any[])[0].categoryId,
            name: (product as any[])[0].categoryName,
          } : null
        } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ürün oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Ürün oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
} 