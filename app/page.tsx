import Link from "next/link";
import { ArrowRight, Truck, ShieldCheck, Sparkles, Zap, Award } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/product-card";
import { MegaCover } from "@/components/home/mega-cover";
import { CategoryGrid } from "@/components/home/category-grid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getBanners() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (url && authToken) {
    try {
      const { createClient } = await import("@libsql/client");
      const client = createClient({ url, authToken });
      const res = await client.execute('SELECT * FROM "Banner"');
      return res.rows.map((row: any) => ({
        id: String(row.id),
        key: String(row.key),
        mediaType: String(row.mediaType || "IMAGE"),
        mediaUrl: String(row.mediaUrl || ""),
        showContent: row.showContent === 1 || row.showContent === true || row.showContent === "1",
        badge: row.badge ? String(row.badge) : "",
        title: row.title ? String(row.title) : "",
        subtitle: row.subtitle ? String(row.subtitle) : "",
        buttonText: row.buttonText ? String(row.buttonText) : "",
        buttonUrl: row.buttonUrl ? String(row.buttonUrl) : "/shop",
        align: row.align ? String(row.align) : "center",
      }));
    } catch (e) {
      console.error("Failed to fetch banners via libsql client in home:", e);
    }
  }

  if ((prisma as any).banner) {
    try {
      return await (prisma as any).banner.findMany();
    } catch (e) {}
  }

  try {
    const rows: any[] = await prisma.$queryRawUnsafe('SELECT * FROM "Banner"');
    return rows.map((row: any) => ({
      ...row,
      showContent: row.showContent === 1 || row.showContent === true,
    }));
  } catch (e) {
    return [];
  }
}

const DEFAULT_BANNER_1 = {
  key: "hero-banner-1",
  mediaType: "IMAGE",
  mediaUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920",
  showContent: true,
  badge: "ZEEDIOR EXCLUSIVE 2026",
  title: "LUXURY & CUSTOM CRAFTSMANSHIP",
  subtitle: "Discover personalized rings, engraved wallets, custom printed cups, and unique accessories crafted to perfection.",
  buttonText: "EXPLORE COLLECTION",
  buttonUrl: "/shop",
  align: "center",
};

const DEFAULT_BANNER_2 = {
  key: "mid-banner-2",
  mediaType: "IMAGE",
  mediaUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1920",
  showContent: true,
  badge: "SEASONAL SPOTLIGHT",
  title: "PERSONALIZED GIFTS & UNIQUE GADGETS",
  subtitle: "Unmatched quality personalized products designed to leave a lasting impression for your loved ones.",
  buttonText: "SHOP FEATURED",
  buttonUrl: "/shop",
  align: "left",
};

export default async function Home() {
  const [trendingProducts, dbCategories, dbBanners] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.category.findMany({
      take: 4,
    }),
    getBanners(),
  ]);

  const bannerMap: Record<string, any> = {};
  if (Array.isArray(dbBanners)) {
    dbBanners.forEach((b: any) => {
      bannerMap[b.key] = b;
    });
  }

  const banner1 = bannerMap["hero-banner-1"] || DEFAULT_BANNER_1;
  const banner2 = bannerMap["mid-banner-2"] || DEFAULT_BANNER_2;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white font-sans">
      {/* ─── 1. MEGA COVER 1 (HERO COVER - 16:9 ASPECT RATIO) ─── */}
      <MegaCover
        badge={banner1.badge}
        title={banner1.title}
        subtitle={banner1.subtitle}
        primaryCtaText={banner1.buttonText}
        primaryCtaLink={banner1.buttonUrl}
        mediaType={banner1.mediaType}
        mediaUrl={banner1.mediaUrl}
        align={banner1.align || "center"}
        aspectRatio="aspect-[16/9]"
        showContent={Boolean(banner1.showContent !== false && banner1.showContent !== 0 && banner1.showContent !== "0" && banner1.showContent !== "false")}
      />

      {/* ─── BRAND VALUES STRIP ─── */}
      <section className="py-8 bg-black border-y border-zinc-900 px-4">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center gap-4 py-2 border-b md:border-b-0 md:border-r border-zinc-800/80">
            <Truck className="h-6 w-6 text-white" />
            <div className="text-left">
              <h4 className="text-xs font-black uppercase tracking-widest text-white">Nationwide Shipping</h4>
              <p className="text-[11px] text-zinc-400">Cash on Delivery across Pakistan</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 py-2 border-b md:border-b-0 md:border-r border-zinc-800/80">
            <Award className="h-6 w-6 text-white" />
            <div className="text-left">
              <h4 className="text-xs font-black uppercase tracking-widest text-white">Custom Craftsmanship</h4>
              <p className="text-[11px] text-zinc-400">Every item personalized with care</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 py-2">
            <ShieldCheck className="h-6 w-6 text-white" />
            <div className="text-left">
              <h4 className="text-xs font-black uppercase tracking-widest text-white">100% Quality Guaranteed</h4>
              <p className="text-[11px] text-zinc-400">Satisfied or hassle-free replacement</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. MEGA COVER 2 (SPOTLIGHT COVER - 16:9 ASPECT RATIO) ─── */}
      <MegaCover
        badge={banner2.badge}
        title={banner2.title}
        subtitle={banner2.subtitle}
        primaryCtaText={banner2.buttonText}
        primaryCtaLink={banner2.buttonUrl}
        mediaType={banner2.mediaType}
        mediaUrl={banner2.mediaUrl}
        align={banner2.align || "left"}
        aspectRatio="aspect-[16/9]"
        showContent={Boolean(banner2.showContent !== false && banner2.showContent !== 0 && banner2.showContent !== "0" && banner2.showContent !== "false")}
      />

      {/* ─── 3. SHOP BY CATEGORY SECTION ─── */}
      <CategoryGrid categories={dbCategories} />

      {/* ─── 4. TRENDING SECTION (TRENDING NOW) ─── */}
      <section className="py-24 px-4 md:px-8 bg-white text-zinc-950 border-t border-zinc-200">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-zinc-200 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-3 rounded-full bg-zinc-950 text-white border border-zinc-800 text-[11px] font-black uppercase tracking-[0.2em]">
                <Zap className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span>HOT IN STORE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-zinc-950">
                Trending Now
              </h2>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 mt-2">
                Handpicked Bestsellers &amp; Customer Favorites
              </p>
            </div>

            <Link
              href="/shop"
              className="mt-4 md:mt-0 text-xs font-extrabold uppercase tracking-[0.2em] text-zinc-950 hover:text-zinc-600 transition-colors inline-flex items-center gap-2 group"
            >
              View Full Catalog <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Trending Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {trendingProducts.length > 0 ? (
              trendingProducts.map((product) => (
                <div key={product.id} className="transition-transform duration-300 hover:-translate-y-1">
                  <ProductCard product={product as any} showQuickBuy={false} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-zinc-50 border border-zinc-200">
                <p className="text-zinc-500 font-medium">No trending items loaded yet.</p>
                <Link
                  href="/shop"
                  className="mt-4 inline-block px-6 py-2.5 bg-zinc-950 text-white font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                >
                  Explore Shop
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA BANNER ─── */}
      <section className="py-20 px-4 bg-gradient-to-t from-black to-zinc-950 border-t border-zinc-900 text-center">
        <div className="mx-auto max-w-4xl space-y-6">
          <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-xs font-black uppercase tracking-[0.25em] text-zinc-300 border border-white/10">
            ZEEDIOR PAKISTAN
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            Ready to Create Something Custom?
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
            Order your personalized rings, engraved wallets, custom printed cups, or unique gadgets today. Nationwide Cash on Delivery available across Pakistan.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="px-8 py-4 bg-white text-zinc-950 font-extrabold text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all hover:tracking-[0.25em]"
            >
              Start Shopping Now
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-transparent border border-white/30 text-white font-extrabold text-xs uppercase tracking-[0.2em] hover:bg-white/10 hover:border-white transition-all"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
