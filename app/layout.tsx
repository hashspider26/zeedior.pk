import type { Metadata } from "next";
import { Roboto, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AppProviders } from "@/lib/providers";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { TopLoadingBar } from "@/components/shared/loading";
import { GlobalLinkHandler } from "@/components/shared/global-link-handler";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { AnalyticsTracker } from "@/components/analytics/tracker";

const geistSans = Roboto({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zeedior.pk | Custom Products & Gadgets in Pakistan",
  description: "Zeedior.pk — Your one-stop shop for custom-made rings, wallets, cups, gadgets, and unique personalized products in Pakistan. Fast delivery, Cash on Delivery.",
};

import { GoogleAnalytics } from "@next/third-parties/google";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.documentElement.classList.remove('dark');
              document.documentElement.classList.add('light');
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white text-zinc-900`}>
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <MetaPixel />
        <AppProviders>
          <GlobalLinkHandler />
          <Suspense fallback={null}>
            <TopLoadingBar />
            <AnalyticsTracker />
          </Suspense>
          <Navbar />
          <main className="min-h-[calc(100vh-7rem)]">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
