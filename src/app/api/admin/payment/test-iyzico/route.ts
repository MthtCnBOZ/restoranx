import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { createIyzicoConfig, testIyzicoConnection } from "@/lib/iyzico";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    // Oturum kontrolü
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok." },
        { status: 403 }
      );
    }

    const { apiKey, secretKey, sandbox } = await request.json();
    
    console.log("İyzico test istenen ayarlar:", { apiKey: apiKey?.slice(0, 5) + "...", secretKey: secretKey?.slice(0, 5) + "...", sandbox });

    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { error: "API Key ve Secret Key zorunludur." },
        { status: 400 }
      );
    }

    // Sandbox modunu boolean'a çevir
    const sandboxMode = sandbox === true || sandbox === "true";
    console.log("Sandbox modu (düzeltilmiş):", sandboxMode);

    // Iyzico config oluştur
    const config = createIyzicoConfig(apiKey, secretKey, sandboxMode);

    // Bağlantıyı test et
    const success = await testIyzicoConnection(config);

    if (!success) {
      return NextResponse.json(
        { error: "Iyzico bağlantı testi başarısız oldu. Lütfen API anahtarlarınızı kontrol edin." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "Iyzico bağlantı testi başarılı!",
        status: "success",
        sandbox: sandboxMode
      }, 
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Iyzico test hatası:", error);
    return NextResponse.json(
      { error: error.message || "Iyzico bağlantı testi sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
} 