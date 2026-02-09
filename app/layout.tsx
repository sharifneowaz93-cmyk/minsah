// ============================================
// app/layout.tsx
// ============================================

import type { Metadata } from "next";
import "./globals.css";
import SocialFloatingButtons from "./components/SocialFloatingButtons";
import { FacebookPixel } from "@/lib/facebook/pixel";
import AllPixels from "@/lib/tracking/pixels/AllPixels";
import { TrackingProvider } from "@/contexts/TrackingContext";
import { CartProvider } from "@/contexts/CartContext";

export const metadata: Metadata = {
  title: "Minsah Beauty - Beauty & Care Products",
  description: "Nourish your skin with toxin-free cosmetic products. Premium beauty and care products for your skincare routine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tenor+Sans&family=Lato:wght@300;400;700&family=Inter:wght@400;500;600&family=Mrs+Saint+Delafield&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <FacebookPixel />
        <AllPixels />
        <TrackingProvider>
          <CartProvider>
            {children}
            <SocialFloatingButtons />
          </CartProvider>
        </TrackingProvider>
      </body>
    </html>
  );
}
