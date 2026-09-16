import Link from "next/link";
import { ArrowRight, Truck, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/product-card";

export const revalidate = 3600; // Cache for 1 hour

export default async function Home() {
  const latestProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full min-h-screen min-h-[100dvh] flex flex-col items-center justify-center py-20 px-4 md:py-32 overflow-hidden bg-zinc-950">
        {/* Subtle depth overlays */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-white/[0.03] blur-3xl" />
          {/* Decorative grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="mx-auto max-w-6xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-semibold text-white/80 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="h-4 w-4" />
            <span>Custom Made. Premium Quality.</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-7xl mb-6 leading-tight">
            Your Style,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-white">
              Your Way
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400 mb-8">
            Discover unique gadgets, custom rings, engraved wallets, printed cups, and one-of-a-kind products.
            Handcrafted &amp; delivered across Pakistan with Cash on Delivery.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/40 transition-all hover:bg-zinc-100 hover:scale-105"
            >
              Shop Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex h-12 items-center justify-center rounded-full border-2 border-white/30 bg-transparent px-8 text-sm font-medium text-white/80 transition-all hover:bg-white/10 hover:border-white/60"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white border-y border-zinc-100">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-zinc-100 rounded-full text-zinc-900">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg">Fully Customizable</h3>
            <p className="text-zinc-500 text-sm">Personalize with your name, design, or message. Every product is made just for you.</p>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-zinc-100 rounded-full text-zinc-900">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg">Nationwide Delivery</h3>
            <p className="text-zinc-500 text-sm">Fast shipping to all cities in Pakistan via TCS/Leopards. Cash on Delivery available.</p>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-zinc-100 rounded-full text-zinc-900">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg">Quality Guarantee</h3>
            <p className="text-zinc-500 text-sm">Premium craftsmanship on every product. Not satisfied? We&apos;ll make it right.</p>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-20 px-4 bg-zinc-50">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Latest Products</h2>
              <p className="text-sm text-zinc-500 mt-1">Freshly added to the store</p>
            </div>
            <Link href="/shop" className="text-zinc-900 hover:underline text-sm font-medium">View All →</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {latestProducts.length > 0 ? (
              latestProducts.map((p: any, i: number) => (
                <div key={p.id} className={i === 4 ? 'hidden md:block' : ''}>
                  <ProductCard product={p} />
                </div>
              ))
            ) : (
              <div className="col-span-5 text-center py-12 text-zinc-500">
                No products yet. Check back soon!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4 bg-zinc-950">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-semibold text-white/80 mb-6">
            <Zap className="h-4 w-4" />
            <span>Cash on Delivery Available</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Order Something Unique?
          </h2>
          <p className="text-lg text-zinc-400 mb-8">
            Custom rings, engraved wallets, printed cups, gadgets &amp; more — delivered to your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/shop"
              className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white text-zinc-950 font-semibold hover:bg-zinc-100 transition-all shadow-lg hover:scale-105"
            >
              Browse Products
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-transparent border-2 border-white/30 text-white/80 font-semibold hover:bg-white/10 hover:border-white/60 transition-all"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
