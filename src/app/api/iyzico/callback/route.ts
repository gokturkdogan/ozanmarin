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
    // Token ile order'ı bul
    const iyzicoToken = paymentResult.token;
    
    console.log("Iyzico Token:", iyzicoToken);
    
    if (!iyzicoToken) {
      console.error("No token found in payment result");
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/payment/failure',
        },
      });
    }
    
    try {
      // Find order by Iyzico token
      const order = await prisma.order.findFirst({
        where: { iyzicoToken: iyzicoToken }
      });
      
      if (!order) {
        console.error("Order not found with token:", iyzicoToken);
        return new Response(null, {
          status: 302,
          headers: {
            'Location': '/payment/failure',
          },
        });
      }
      
      // Update order payment status to paid
      await prisma.order.update({
        where: { id: order.id },
        data: { 
          paymentStatus: 'paid',
          iyzicoPaymentId: paymentResult.paymentId || paymentResult.token,
        },
      });

      console.log("✅ Payment confirmed for order:", order.id);
      console.log("=== iyzico Callback Completed Successfully ===");
      
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `/payment/success?paymentId=${order.id}&method=iyzico`,
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
