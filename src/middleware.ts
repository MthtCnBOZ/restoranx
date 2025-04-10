import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("Middleware çalışıyor - URL:", request.nextUrl.pathname);
  
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isAuthenticated = !!token;
  console.log("Token:", JSON.stringify(token, null, 2)); // Tüm token içeriğini göster

  const isAdminPanel = request.nextUrl.pathname.startsWith("/admin");
  const isAuthRoute = 
    request.nextUrl.pathname.startsWith("/giris") ||
    request.nextUrl.pathname.startsWith("/kayit");

  // Admin paneli koruma
  if (isAdminPanel) {
    console.log("Admin panel erişimi kontrol ediliyor");
    
    if (!isAuthenticated) {
      console.log("Kullanıcı giriş yapmamış, giriş sayfasına yönlendiriliyor");
      return NextResponse.redirect(new URL("/giris", request.url));
    }

    // Role bilgisini doğrudan ve büyük-küçük harf duyarsız olarak kontrol et
    const userRole = token?.role?.toString().toUpperCase();
    console.log("Kullanıcı rolü:", userRole);
    
    if (userRole !== "ADMIN") {
      console.log("Role kontrolü başarısız. Rol:", userRole);
      return NextResponse.redirect(new URL("/", request.url));
    }
    
    console.log("Admin kontrolü başarılı, erişime izin verildi");
  }

  // Giriş yapılmışsa giriş/kayıt sayfalarını engelle
  if (isAuthRoute && isAuthenticated) {
    console.log("Kullanıcı zaten giriş yapmış, ana sayfaya yönlendiriliyor");
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/giris",
    "/kayit",
  ],
}; 