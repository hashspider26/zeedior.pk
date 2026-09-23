import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  image: string;
  itemCount?: number;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: "custom-rings",
    name: "Custom Rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
    itemCount: 24,
  },
  {
    id: "engraved-wallets",
    name: "Engraved Wallets",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800",
    itemCount: 18,
  },
  {
    id: "printed-cups",
    name: "Printed Cups",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
    itemCount: 32,
  },
  {
    id: "tech-gadgets",
    name: "Tech Gadgets",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800",
    itemCount: 40,
  },
];

interface CategoryGridProps {
  categories?: { name: string }[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const displayCategories: CategoryItem[] =
    categories && categories.length > 0
      ? categories.map((cat, idx) => ({
          id: cat.name.toLowerCase().replace(/\s+/g, "-"),
          name: cat.name,
          image: DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length].image,
          itemCount: Math.floor(Math.random() * 20) + 10,
        }))
      : DEFAULT_CATEGORIES;

  return (
    <section className="py-10 sm:py-20 px-4 md:px-8 bg-zinc-950 text-white border-t border-zinc-900">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-12 border-b border-zinc-800 pb-4 sm:pb-6">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 block mb-1 sm:mb-2">
              Collections &amp; Categories
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
              Shop By Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="mt-3 md:mt-0 text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.2em] text-zinc-300 hover:text-white transition-colors flex items-center gap-1 group"
          >
            View All Categories <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${encodeURIComponent(category.name)}`}
              className="group relative h-[180px] sm:h-[300px] md:h-[420px] rounded-lg sm:rounded-none overflow-hidden block bg-zinc-900 border border-zinc-800"
            >
              {/* Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: `url('${category.image}')` }}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 transition-all duration-300" />

              {/* Text content */}
              <div className="absolute inset-0 p-3 sm:p-6 flex flex-col justify-between z-10">
                <div className="flex justify-end">
                  <span className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                    <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-2xl font-black uppercase tracking-wider text-white group-hover:tracking-widest transition-all duration-300">
                    {category.name}
                  </h3>
                  <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    Explore →
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
