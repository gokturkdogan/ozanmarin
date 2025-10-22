import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/lib/language";
import { LanguageLoader } from "@/components/language-loader";
import { LanguageModalWrapper } from "@/components/language-modal-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ozan Marin - Denizcilik Tekstili",
  description: "Yat ve tekne kumaş kılıfları, minderleri, brandaları için premium denizcilik tekstili çözümleri",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
            <LanguageProvider>
              <Header />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
              <Toaster />
              <LanguageLoader />
              <LanguageModalWrapper />
            </LanguageProvider>
      </body>
    </html>
  );
}
