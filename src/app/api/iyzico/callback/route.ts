import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function getBaseUrl(request: NextRequest): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  const host = request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || 
                   (process.env.NODE_ENV === "production" ? "https" : "http");
  
  if (host) {
    return `${protocol}://${host}`;
  }
  
  return "http://localhost:3000";
}

export async function POST(request: NextRequest) {
  try {
    const Iyzipay = require("iyzipay");
    const formData = await request.formData();
    const token = formData.get("token") as string;
    const status = formData.get("status") as string;
    
    const baseUrl = getBaseUrl(request);
    console.log("=== iyzico Callback Started ===");
    console.log("Base URL:", baseUrl);
    console.log("Token:", token);
    console.log("Status:", status);

    if (!token) {
      console.error("No token received");
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/payment/failure',
        },
      });
    }

    // İyzico'dan ödeme sonucunu al
    const iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY,
      secretKey: process.env.IYZICO_SECRET_KEY,
      uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
    });

    const paymentResult = await new Promise<any>((resolve) => {
      iyzipay.checkoutForm.retrieve({ locale: "tr", token }, (err: any, result: any) => {
        if (err) {
          console.error("İyzico Retrieve Error:", err);
          resolve({ status: "failure", error: err });
        } else {
          console.log("İyzico Retrieve Success:", result);
          resolve(result);
        }
      });
    });

    console.log("Payment Result:", JSON.stringify(paymentResult, null, 2));

    if (paymentResult.status !== "success" || paymentResult.paymentStatus !== "SUCCESS") {
      console.error("Payment not successful:", paymentResult.status, paymentResult.paymentStatus);
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/payment/failure',
        },
      });
    }

    // Siparişi bul ve güncelle
    const conversationId = paymentResult.conversationId || paymentResult.basketId || paymentResult.token;
    
    console.log("ConversationId:", conversationId);
    console.log("BasketId:", paymentResult.basketId);
    console.log("Token:", paymentResult.token);
    
    if (!conversationId) {
      console.error("No conversationId, basketId or token found");
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/payment/failure',
        },
      });
    }
    
    try {
      // Ödeme başarılı, order'ı oluştur
      const order = await prisma.order.create({
        data: {
          userId: null, // Guest order için null
          totalPrice: parseFloat(paymentResult.paidPrice),
          status: 'received', // Sipariş alındı
          paymentStatus: 'paid', // Ödeme yapıldı
          paymentMethod: 'iyzico',
          iyzicoPaymentId: paymentResult.paymentId || paymentResult.token,
          shippingAddress: {
            // Iyzico'dan gelen buyer bilgilerini kullan
            fullName: `${paymentResult.buyer?.name || 'Gokturk'} ${paymentResult.buyer?.surname || 'Dogan'}`,
            email: paymentResult.buyer?.email || 'gokturk.dogan@hotmail.com',
            phone: paymentResult.buyer?.phoneNumber || '+905398226918',
            city: paymentResult.buyer?.city || 'istanbul',
            district: 'Yenisehir',
            address: paymentResult.buyer?.address || 'yenisehir mahallesi millet caddesi alp sitesi b blok',
            country: 'Türkiye'
          },
          items: {
            create: paymentResult.itemTransactions?.map((item: any) => ({
              productId: item.itemId,
              productName: item.itemId === 'shipping' ? 'Kargo' : 'Ürün',
              productPrice: parseFloat(item.price),
              quantity: 1,
              size: null,
              color: null,
              hasEmbroidery: false,
              embroideryFile: null,
              embroideryPrice: 0
            })) || []
          }
        },
        include: {
          items: true
        }
      });

      console.log("✅ Payment confirmed for order:", order.id);
      console.log("=== iyzico Callback Completed Successfully ===");
      
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `/payment/success?paymentId=${paymentResult.paymentId || paymentResult.token}`,
        },
      });
    } catch (dbError) {
      console.error("❌ Database error:", dbError);
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/payment/failure',
        },
      });
    }
  } catch (error) {
    console.error("=== iyzico Callback Error ===");
    console.error("Error:", error);
    console.error("Error details:", error instanceof Error ? error.message : "Unknown error");
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/payment/failure',
      },
    });
  }
}
