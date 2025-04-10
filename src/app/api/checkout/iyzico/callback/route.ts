import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createIyzicoConfig, retrievePayment } from "@/lib/iyzico";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const token = formData.get('token') as string;

    if (!token) {
      return NextResponse.json(
        { error: "Token bilgisi gerekli." },
        { status: 400 }
      );
    }

    // Sipariş bilgisini bul
    const order = await prisma.order.findFirst({
      where: { 
        paymentId: token,
        paymentMethod: "IYZICO" 
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı." },
        { status: 404 }
      );
    }

    // Ayarlardan Iyzico bilgilerini al
    const settings = await prisma.setting.findFirst();
    
    if (!settings?.iyzicoKey || !settings?.iyzicoSecretKey) {
      return NextResponse.json(
        { error: "Iyzico API bilgileri ayarlanmamış." },
        { status: 400 }
      );
    }

    // Iyzico config oluştur
    const config = createIyzicoConfig(
      settings.iyzicoKey,
      settings.iyzicoSecretKey,
      !!settings.iyzicoSandboxMode
    );

    // Ödeme durumunu sorgula
    const paymentResult = await retrievePayment(config, token);

    // Ödeme durumuna göre sipariş güncelle
    if (paymentResult.paymentStatus === "SUCCESS") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PROCESSING"
        }
      });

      // Başarılı ödeme sayfasına yönlendir
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`
      );
    } else {
      // Başarısız ödeme durumunda
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED"
        }
      });

      // Başarısız ödeme sayfasına yönlendir
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/checkout/error?orderId=${order.id}&error=${paymentResult.errorMessage || "Ödeme işlemi başarısız oldu."}`
      );
    }
  } catch (error: any) {
    console.error("Iyzico callback hatası:", error);
    
    // Hata durumunda error sayfasına yönlendir
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/checkout/error?error=${error.message || "Ödeme sonucu işlenirken bir hata oluştu."}`
    );
  }
} 