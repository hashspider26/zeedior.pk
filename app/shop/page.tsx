import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Sprout } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/shared/loading-skeletons";

// Helper for formatting currency
function formatPrice(amount: number) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ShopPage({
    searchParams,
}: {
    searchParams: { category?: string; subCategory?: string; sort?: string };
}) {
    const category = searchParams.category ? decodeURIComponent(searchParams.category) : undefined;
    const subCategory = searchParams.subCategory ? decodeURIComponent(searchParams.subCategory) : undefined;

    let allProducts: any[] = [];
    let categoriesWithSubs: any[] = [];

    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (url && authToken) {
        try {
            const { createClient } = await import("@libsql/client");
            const client = createClient({ url, authToken });

            let productSql = 'SELECT * FROM "Product"';
            const args: any[] = [];

            if (subCategory) {
                productSql += ' WHERE subCategory = ?';
                args.push(subCategory);
            } else if (category) {
                productSql += ' WHERE category = ?';
                args.push(category);
            }

            productSql += ' ORDER BY position ASC, createdAt DESC';

            const prodRes = await client.execute({ sql: productSql, args });
            allProducts = prodRes.rows.map((row: any) => ({
                ...row,
                id: String(row.id),
                title: String(row.title),
                price: Number(row.price),
                salePrice: row.salePrice ? Number(row.salePrice) : null,
                images: String(row.images || "[]"),
                category: String(row.category),
                subCategory: row.subCategory ? String(row.subCategory) : null,
            }));

            const catRes = await client.execute('SELECT * FROM "Category" ORDER BY name ASC');
            const subRes = await client.execute('SELECT * FROM "SubCategory" ORDER BY name ASC');

            const subMap: Record<string, any[]> = {};
            subRes.rows.forEach((sub: any) => {
                const cId = String(sub.categoryId);
                if (!subMap[cId]) subMap[cId] = [];
                subMap[cId].push({ id: String(sub.id), name: String(sub.name) });
            });

            categoriesWithSubs = catRes.rows.map((c: any) => ({
                id: String(c.id),
                name: String(c.name),
                subcategories: subMap[String(c.id)] || []
            }));
        } catch (e) {
            console.error("Direct Turso fetch in ShopPage failed, fallback to Prisma:", e);
        }
    }

    if (allProducts.length === 0 && categoriesWithSubs.length === 0) {
        const [dbProds, dbCats] = await Promise.all([
            prisma.product.findMany({
                where: (subCategory ? {
                    subCategory: { equals: subCategory }
                } : category ? {
                    OR: [
                        { category: { equals: category } },
                        { category: { equals: category.toLowerCase() } }
                    ]
                } : undefined) as any,
                orderBy: [
                    { position: 'asc' },
                    { createdAt: 'desc' }
                ]
            }),
            (prisma.category as any).findMany({
                include: { subcategories: true },
                orderBy: { name: 'asc' }
            })
        ]);
        allProducts = dbProds;
        categoriesWithSubs = dbCats;
    }

    const activeCategoryObj = categoriesWithSubs.find(c => c.name === category);
    const activeSubcategories = activeCategoryObj?.subcategories || [];

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 pb-20">
            {/* Header */}
            <div className="bg-black border-b border-zinc-800 py-8 px-4">
                <div className="mx-auto max-w-6xl">
                    <h1 className="text-3xl font-bold tracking-tight text-white uppercase tracking-wider">
                        {subCategory ? `${subCategory}` : category ? `${category}` : "All Products"}
                    </h1>
                    <p className="text-zinc-400 mt-2 text-xs sm:text-sm uppercase tracking-widest">
                        {subCategory
                            ? `Showing items in ${category} → ${subCategory}`
                            : category
                                ? `Explore items in ${category}`
                                : "Browse our collection of products and accessories."}
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 mt-8 space-y-4">
                {/* Main Categories Pill Bar */}
                <div className="-mx-4 px-4">
                    <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 hide-scrollbar">
                        <Link
                            href="/shop"
                            className={`whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest border transition-all ${!category
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-white text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 hover:border-zinc-400"}`}
                        >
                            All Products
                        </Link>
                        {categoriesWithSubs.map((c: any) => (
                            <Link
                                key={c.id}
                                href={`/shop?category=${encodeURIComponent(c.name)}`}
                                className={`whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest border transition-all ${category === c.name
                                    ? "bg-primary text-white border-primary shadow-sm"
                                    : "bg-white text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 hover:border-zinc-400"}`}
                            >
                                {c.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Subcategories Horizontal Bar (Visible when a Category with subcategories is selected) */}
                {category && activeSubcategories.length > 0 && (
                    <div className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block mb-1.5 sm:mb-2">
                            Subcategories in {category}
                        </span>
                        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 hide-scrollbar">
                            <Link
                                href={`/shop?category=${encodeURIComponent(category)}`}
                                className={`whitespace-nowrap px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-extrabold uppercase tracking-wider border transition-all ${!subCategory
                                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-sm"
                                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"}`}
                            >
                                All {category}
                            </Link>
                            {activeSubcategories.map((sub: any) => (
                                <Link
                                    key={sub.id}
                                    href={`/shop?category=${encodeURIComponent(category)}&subCategory=${encodeURIComponent(sub.name)}`}
                                    className={`whitespace-nowrap px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-extrabold uppercase tracking-wider border transition-all ${subCategory === sub.name
                                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-sm"
                                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"}`}
                                >
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Product Grid */}
                <Suspense fallback={<ProductGridSkeleton count={8} />}>
                    {allProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
                            {allProducts.map((p: any) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Sprout className="h-12 w-12 text-zinc-300 mb-4" />
                            <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No products found</h3>
                            <p className="text-zinc-500 max-w-sm mt-2">
                                We couldn't find any products in this category. Try checking back later or browsing all products.
                            </p>
                            <Link href="/shop" className="mt-6 inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90">
                                Clear Filters
                            </Link>
                        </div>
                    )}
                </Suspense>
            </div>
        </div>
    );
}
