import type { Metadata } from "next";
import { Inter, Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import SplashScreen from "@/components/SplashScreen";
import PageTransition from "@/components/PageTransition";
import prisma from "@/lib/prisma";
import { Toaster } from "react-hot-toast";
import { ConfirmProvider } from "@/providers/ConfirmProvider";

export const preferredRegion = ['sin1']

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Development Plans | THE WEB SENSEI",
  description: "Crafting super modern, highly functional, and fully custom web solutions tailored to elevate your business.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await prisma.appSettings.findFirst();
  const whatsappNumber = settings?.whatsappNumber || process.env.WHATSAPP_NUMBER || undefined;

  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${space.variable} ${outfit.variable} font-sans bg-zinc-950 text-white min-h-screen flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200 cursor-none`}>
        <SplashScreen />
        <CustomCursor />
        <ScrollProgress />
        <Navbar />
        <ConfirmProvider>
          <Toaster 
            position="top-center" 
            toastOptions={{ 
              style: { 
                background: '#18181b', 
                color: '#fff', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                fontFamily: 'var(--font-outfit)',
                fontSize: '14px',
                padding: '12px 24px'
              } 
            }} 
          />
          <main className="flex-1">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <Footer
            contactEmail={settings?.contactEmail || process.env.CONTACT_EMAIL || undefined}
            whatsappNumber={whatsappNumber}
          />
          <WhatsAppFloat whatsappNumber={whatsappNumber} />
          <BackToTop />
        </ConfirmProvider>
      </body>
    </html>
  );
}
