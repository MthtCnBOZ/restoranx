import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Tüm ekstra malzemeleri getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    
    const extras = await prisma.extra.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ extras });
  } catch (error) {
    console.error("Ekstra malzemeler alınırken hata:", error);
    return NextResponse.json(
      { error: "Ekstra malzemeler alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Yeni ekstra malzeme oluştur
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, price } = body;

    // Validasyon
    if (!name || !price) {
      return NextResponse.json(
        { error: "İsim ve fiyat zorunludur" },
        { status: 400 }
      );
    }

    // Yeni ekstra malzeme oluştur
    const extra = await prisma.extra.create({
      data: {
        id: uuidv4(),
        name,
        price: parseFloat(price),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Ekstra malzeme başarıyla oluşturuldu", extra },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ekstra malzeme oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Ekstra malzeme oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
} 