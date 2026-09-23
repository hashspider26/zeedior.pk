import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Package, Sprout } from "lucide-react";
import { OrderStatusManager } from "@/components/admin/order-status-manager";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";
import { LocalTime } from "@/components/shared/local-time";

export const revalidate = 0;

async function getOrders() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (url && authToken) {
        try {
            const { createClient } = await import("@libsql/client");
            const client = createClient({ url, authToken });
            const ordersRes = await client.execute('SELECT * FROM "Order" ORDER BY createdAt DESC');
            const itemsRes = await client.execute('SELECT * FROM "OrderItem"');
            const productsRes = await client.execute('SELECT * FROM "Product"');

            const productsMap: Record<string, any> = {};
            productsRes.rows.forEach((p: any) => {
                productsMap[String(p.id)] = p;
            });

            const itemsByOrder: Record<string, any[]> = {};
            itemsRes.rows.forEach((item: any) => {
                const orderId = String(item.orderId);
                if (!itemsByOrder[orderId]) itemsByOrder[orderId] = [];
                itemsByOrder[orderId].push({
                    id: String(item.id),
                    orderId: String(item.orderId),
                    productId: String(item.productId),
                    quantity: Number(item.quantity),
                    price: Number(item.price),
                    dealTitle: item.dealTitle ? String(item.dealTitle) : null,
                    product: productsMap[String(item.productId)] ? {
                        id: String(productsMap[String(item.productId)].id),
                        title: String(productsMap[String(item.productId)].title),
                        images: String(productsMap[String(item.productId)].images || "[]"),
                    } : { title: "Product", images: "[]" }
                });
            });

            return ordersRes.rows.map((row: any) => ({
                id: String(row.id),
                readableId: row.readableId ? String(row.readableId) : null,
                customerName: String(row.customerName),
                phone: String(row.phone),
                address: String(row.address),
                city: String(row.city),
                customizationNote: row.customizationNote ? String(row.customizationNote) : null,
                totalAmount: Number(row.totalAmount),
                discountAmount: Number(row.discountAmount || 0),
                paymentMethod: String(row.paymentMethod || "COD"),
                status: String(row.status || "PENDING"),
                createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
                items: itemsByOrder[String(row.id)] || [],
            }));
        } catch (e) {
            console.error("Direct Turso client fetch for orders failed, falling back to Prisma:", e);
        }
    }

    try {
        return await prisma.order.findMany({
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    } catch (e) {
        return [];
    }
}

export default async function OrdersPage() {
    const orders = await getOrders();

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 p-6">
            <div className="mx-auto max-w-5xl">
                <Link href="/admin/dashboard" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-6 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                </Link>

                <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-white">Orders Management</h1>

                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                            {(order as any).readableId || order.id.slice(0, 8)} - {order.customerName}
                                        </h3>
                                    </div>
                                    <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                        <p className="font-medium text-zinc-700 dark:text-zinc-300">{order.phone}</p>
                                        <p>{order.address}, {order.city}</p>
                                    </div>

                                    {/* Customization Note Display */}
                                    {(order as any).customizationNote && (
                                        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs">
                                            <span className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block mb-1">
                                                ✨ Customization Note:
                                            </span>
                                            <p className="text-amber-800 dark:text-amber-200 font-medium whitespace-pre-wrap">
                                                {(order as any).customizationNote}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${(order as any).paymentMethod === "ADVANCE"
                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                            }`}>
                                            {(order as any).paymentMethod || "COD"}
                                        </span>
                                        <OrderStatusManager orderId={order.id} currentStatus={order.status} />
                                        <DeleteOrderButton orderId={order.id} />
                                    </div>
                                    <p className="text-xs text-zinc-400">
                                        Ordered: <LocalTime date={order.createdAt} />
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 bg-zinc-50/30 dark:bg-zinc-900/30">
                                <h4 className="text-[10px] font-bold uppercase text-zinc-400 mb-4 tracking-widest px-1">Items Ordered</h4>
                                <ul className="space-y-4">
                                    {order.items.map((item) => {
                                        let imageUrl = null;
                                        try {
                                            const images = (item.product as any).images ? JSON.parse((item.product as any).images) : [];
                                            if (Array.isArray(images) && images.length > 0) imageUrl = images[0];
                                        } catch (e) { }

                                        return (
                                            <li key={item.id} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                                        {imageUrl ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={imageUrl} alt={item.product.title} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Sprout className="h-5 w-5 text-zinc-300" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm text-zinc-900 dark:text-zinc-200 group-hover:text-primary transition-colors">
                                                            {item.product.title}
                                                            {(item as any).dealTitle && <span className="ml-2 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-[10px] uppercase tracking-wider rounded-md text-zinc-600 dark:text-zinc-300">{(item as any).dealTitle}</span>}
                                                        </span>
                                                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                            Qty: {item.quantity} × PKR {item.price}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">PKR {item.price * item.quantity}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                                <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2 px-1">
                                    <div className="flex justify-between items-center text-xs text-zinc-500">
                                        <span>Subtotal</span>
                                        <span>PKR {order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-zinc-500">
                                        <span>Delivery Fee</span>
                                        <span>PKR {order.totalAmount - order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) + (order.discountAmount || 0)}</span>
                                    </div>
                                    {(order as any).discountAmount > 0 && (
                                        <div className="flex justify-between items-center text-xs text-green-600 font-bold">
                                            <span>Discount (Advance Payment)</span>
                                            <span>- PKR {(order as any).discountAmount}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                                        <span className="text-sm text-zinc-500 font-medium">Order Total</span>
                                        <p className="font-bold text-xl text-primary">PKR {order.totalAmount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {orders.length === 0 && (
                        <div className="text-center py-20 text-zinc-500 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-3">
                            <Package className="h-10 w-10 text-zinc-300" />
                            <p className="font-medium">No orders received yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
