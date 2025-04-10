import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Bu API, sadece geliştirme sürecinde kullanılacak, 
// daha sonra kaldırılmalıdır
export async function POST(request: Request) {
  try {
    // Geliştirme ortamında olduğumuzdan emin olalım
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { message: "Bu endpoint sadece geliştirme ortamında kullanılabilir." },
        { status: 403 }
      );
    }
    
    const { name, email, password } = await request.json();
    
    // Gerekli alanları kontrol et
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Tüm alanları doldurun!" },
        { status: 400 }
      );
    }
    
    // E-postanın zaten kullanımda olup olmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { message: "Bu e-posta adresi zaten kullanımda!" },
        { status: 400 }
      );
    }
    
    // Şifreyi hashle
    const hashedPassword = await hash(password, 10);
    
    // Admin kullanıcısını oluştur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    
    // Hassas bilgileri kaldırarak kullanıcı nesnesini döndür
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      {
        message: "Admin kullanıcısı başarıyla oluşturuldu!",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin oluşturma hatası:", error);
    return NextResponse.json(
      { message: "Admin kullanıcısı oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
} 