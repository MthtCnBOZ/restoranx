import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createIyzicoConfig, createPaymentCheckoutForm } from "@/lib/iyzico";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız." },
        { status: 401 }
      );
    }

    const { orderId, callbackUrl } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Sipariş ID zorunludur." },
        { status: 400 }
      );
    }

    // Sipariş detaylarını al
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        orderitem: {
          include: {
            product: true
          }
        }
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

    // Basket items oluştur
    const basketItems = order.orderitem.map(item => {
      return {
        id: item.id,
        name: item.product.name,
        category1: "Yemek",
        itemType: "PHYSICAL",
        price: item.price.toString()
      };
    });

    const clientIp = req.headers.get('x-forwarded-for') || "85.34.78.112";

    // Ödeme isteği hazırla
    const paymentRequest = {
      locale: "tr",
      conversationId: orderId,
      price: order.total.toString(),
      paidPrice: order.total.toString(),
      currency: "TRY",
      basketId: orderId,
      paymentGroup: "PRODUCT",
      callbackUrl: callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/result`,
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: order.user.id,
        name: order.user.name?.split(' ')[0] || "İsimsiz",
        surname: order.user.name?.split(' ').slice(1).join(' ') || "Kullanıcı",
        gsmNumber: order.phone || "+905555555555",
        email: order.user.email,
        identityNumber: "11111111111", // TC Kimlik No zorunlu
        registrationAddress: order.address || "Adres bilgisi yok",
        ip: clientIp,
        city: "Istanbul",
        country: "Turkey"
      },
      shippingAddress: {
        contactName: order.user.name || "İsimsiz Kullanıcı",
        city: "Istanbul",
        country: "Turkey",
        address: order.address || "Adres bilgisi yok"
      },
      billingAddress: {
        contactName: order.user.name || "İsimsiz Kullanıcı",
        city: "Istanbul",
        country: "Turkey",
        address: order.address || "Adres bilgisi yok"
      },
      basketItems
    };

    // Ödeme formunu başlat
    const response = await createPaymentCheckoutForm(config, paymentRequest);

    // Sipariş verisini güncelle
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: response.token,
        paymentMethod: "IYZICO"
      }
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Iyzico ödeme hatası:", error);
    return NextResponse.json(
      { error: error.message || "Ödeme işlemi sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
} 