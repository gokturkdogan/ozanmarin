import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const Iyzipay = require("iyzipay");
    const body = await request.json();

    console.log("\n========================================");
    console.log("🔄 İyzico Init API çağrılıyor...");
    console.log("⏰ Timestamp:", new Date().toISOString());
    console.log("========================================");
    
    // Env kontrolü
    const IYZICO_API_KEY = process.env.IYZICO_API_KEY;
    const IYZICO_SECRET_KEY = process.env.IYZICO_SECRET_KEY;
    const IYZICO_BASE_URL = process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com";
    
    console.log("📋 Environment Check:");
    console.log("  API Key:", IYZICO_API_KEY ? `✅ Var (${IYZICO_API_KEY.substring(0, 10)}...)` : "❌ YOK!");
    console.log("  Secret Key:", IYZICO_SECRET_KEY ? `✅ Var (${IYZICO_SECRET_KEY.substring(0, 10)}...)` : "❌ YOK!");
    console.log("  Base URL:", IYZICO_BASE_URL);
    
    // API key yoksa hemen hata dön
    if (!IYZICO_API_KEY || !IYZICO_SECRET_KEY) {
      console.error("❌ İyzico API credentials eksik!");
      return NextResponse.json(
        { 
          success: false, 
          status: "failure",
          error: "İyzico API ayarları eksik. Lütfen sistem yöneticisiyle iletişime geçin." 
        },
        { status: 500 }
      );
    }

    console.log("\n📦 Request Body:");
    console.log(JSON.stringify(body, null, 2));

    const iyzipay = new Iyzipay({
      apiKey: IYZICO_API_KEY,
      secretKey: IYZICO_SECRET_KEY,
      uri: IYZICO_BASE_URL,
    });

    console.log("\n🚀 İyzico SDK çağrılıyor...");
    
    // Promise wrapper ile SDK callback'ini async/await'e çeviriyoruz
    const result = await new Promise<any>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("İyzico SDK timeout (30s)"));
      }, 30000);

      iyzipay.checkoutFormInitialize.create(body, (err: any, res: any) => {
        clearTimeout(timeoutId);
        
        const elapsed = Date.now() - startTime;
        console.log(`\n📥 İyzico Callback çalıştı (${elapsed}ms)`);
        
        if (err) {
          console.error("❌ İyzico SDK Error:");
          console.error(JSON.stringify(err, null, 2));
          
          // SDK error'ları bile response olarak dön (reject etme)
          resolve({
            success: false,
            status: "failure",
            errorCode: err.errorCode,
            errorMessage: err.errorMessage || "İyzico hatası",
          });
        } else {
          console.log("✅ İyzico Success!");
          console.log("  Status:", res.status);
          console.log("  Token:", res.token);
          console.log("  Payment URL:", res.paymentPageUrl);
          console.log(JSON.stringify(res, null, 2));
          
          resolve(res);
        }
      });
      
      console.log("⏳ SDK callback bekleniyor...");
    });
    
    const elapsed = Date.now() - startTime;
    console.log(`\n✅ İşlem tamamlandı (${elapsed}ms)`);
    console.log("========================================\n");
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.error("\n💥 FATAL ERROR:");
    console.error("  Name:", error.name);
    console.error("  Message:", error.message);
    console.error("  Stack:", error.stack);
    console.error("  Elapsed:", elapsed + "ms");
    console.error("========================================\n");
    
    return NextResponse.json(
      { 
        success: false, 
        status: "failure",
        error: error.message || "İyzico bağlantı hatası",
        elapsed: elapsed + "ms"
      },
      { status: 500 }
    );
  }
}
