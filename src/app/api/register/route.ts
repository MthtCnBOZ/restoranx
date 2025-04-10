import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    
    // Gerekli alanları kontrol et
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Tüm alanları doldurun!" },
        { status: 400 }
      );
    }
    
    // E-posta formatını doğrula
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Geçerli bir e-posta adresi girin!" },
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
    
    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });
    
    // Hassas bilgileri kaldırarak kullanıcı nesnesini döndür
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      {
        message: "Kullanıcı başarıyla oluşturuldu!",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Kayıt hatası:", error);
    return NextResponse.json(
      { message: "Kullanıcı kaydı sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
} 