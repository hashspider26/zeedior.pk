import { prisma } from "@/lib/prisma";

export async function Footer() {
  const categoryDocs = await prisma.category.findMany({
    orderBy: { name: "asc" },
    take: 5,
  });

  const categories = categoryDocs.map((c: any) => c.name);

  return (
    <footer className="border-t border-zinc-700 bg-zinc-900 py-12 text-sm text-zinc-400">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-4">
        <div className="flex flex-col gap-4">
          <span className="font-extrabold text-lg text-white">
            zeedior<span className="text-zinc-400">.pk</span>
          </span>
          <p className="text-zinc-400">
            Your go-to store for custom-made products &amp; gadgets. Rings, wallets, cups, and more — crafted to your style.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-white">Shop</h3>
          <a href="/shop" className="hover:text-white transition-colors">All Products</a>
          {categories.map((c: string) => (
            <a
              key={c}
              href={`/shop?category=${encodeURIComponent(c)}`}
              className="hover:text-white transition-colors capitalize"
            >
              {c}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-white">Company</h3>
          <a href="/about" className="hover:text-white transition-colors">About Us</a>
          <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-white">Contact</h3>
          <p>Mianwali, Punjab, Pakistan</p>
          <p>0326-1347455</p>
          <p>0341-4255047</p>
          <p>0319-7214187</p>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-6xl border-t border-zinc-700 pt-8 px-4 text-center">
        <p>© {new Date().getFullYear()} Zeedior.pk. All rights reserved.</p>
      </div>
    </footer>
  );
}
