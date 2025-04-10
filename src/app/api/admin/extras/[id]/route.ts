import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Belirli bir ekstra malzemeyi getir
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

    const extra = await prisma.extra.findUnique({
      where: { id },
      include: {
        productextra: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!extra) {
      return NextResponse.json(
        { error: "Ekstra malzeme bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ extra });
  } catch (error) {
    console.error("Ekstra malzeme alınırken hata:", error);
    return NextResponse.json(
      { error: "Ekstra malzeme alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Ekstra malzemeyi güncelle
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
    const { name, price } = body;

    // Validasyon
    if (!name || !price) {
      return NextResponse.json(
        { error: "İsim ve fiyat zorunludur" },
        { status: 400 }
      );
    }

    // Ekstra malzemenin var olup olmadığını kontrol et
    const existingExtra = await prisma.extra.findUnique({
      where: { id },
    });

    if (!existingExtra) {
      return NextResponse.json(
        { error: "Ekstra malzeme bulunamadı" },
        { status: 404 }
      );
    }

    // Ekstra malzemeyi güncelle
    const updatedExtra = await prisma.extra.update({
      where: { id },
      data: {
        name,
        price: parseFloat(price),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Ekstra malzeme başarıyla güncellendi",
      extra: updatedExtra,
    });
  } catch (error) {
    console.error("Ekstra malzeme güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Ekstra malzeme güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Ekstra malzemeyi sil
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

    // Ekstra malzemenin var olup olmadığını kontrol et
    const existingExtra = await prisma.extra.findUnique({
      where: { id },
      include: {
        productextra: true,
      },
    });

    if (!existingExtra) {
      return NextResponse.json(
        { error: "Ekstra malzeme bulunamadı" },
        { status: 404 }
      );
    }

    // Ürünlerle ilişkilerini kontrol et
    if (existingExtra.productextra.length > 0) {
      // İlişkili ürünleri temizle
      await prisma.productextra.deleteMany({
        where: { extraId: id },
      });
    }

    // Ekstra malzemeyi sil
    await prisma.extra.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Ekstra malzeme başarıyla silindi",
    });
  } catch (error) {
    console.error("Ekstra malzeme silinirken hata:", error);
    return NextResponse.json(
      { error: "Ekstra malzeme silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 