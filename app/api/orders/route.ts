import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendDiscordOrderNotification } from "@/lib/discord";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const session = await getServerSession(authOptions);

        // In a real app validate body via Zod
        const { firstName, lastName, phone, address, city, items } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items in order" }, { status: 400 });
        }

        let subtotal = 0;
        const orderItems: any[] = [];
        let totalWeightGrams = 0;
        let maxBaseDeliveryFee = 0;

        const productIds = items.map((i: any) => i.productId);
        const dbProducts = await prisma.product.findMany({
            where: { id: { in: productIds } },
            include: { variations: true }
        });

        for (const item of items) {
            const product = dbProducts.find(p => p.id === item.productId);
            if (!product) continue;

            let finalPrice = product.price;
            let variationTitle = item.variationTitle || null;
            if (item.variationId && product.variations) {
                const variation = product.variations.find((v: any) => v.id === item.variationId);
                if (variation) {
                    finalPrice = variation.price;
                    variationTitle = variation.title;
                }
            }

            const productTotal = finalPrice * item.quantity;
            subtotal += productTotal;
            const weight = (product as any).weight || 0;
            const deliveryFee = (product as any).deliveryFee || 0;
            totalWeightGrams += weight * item.quantity;
            if (deliveryFee > maxBaseDeliveryFee) maxBaseDeliveryFee = deliveryFee;

            orderItems.push({
                productId: product.id,
                quantity: item.quantity,
                price: finalPrice,
                dealTitle: variationTitle
            });
        }

        if (orderItems.length === 0) {
            return NextResponse.json({ error: "No valid products found" }, { status: 400 });
        }

        // Delivery: base fee for first 1000g, then +100 PKR per extra 1000g
        let deliverySurcharge = 0;
        if (totalWeightGrams > 1000) {
            const extraGrams = totalWeightGrams - 1000;
            deliverySurcharge = Math.ceil(extraGrams / 1000) * 100;
        }
        const totalDeliveryFee = maxBaseDeliveryFee + deliverySurcharge;
        const discountAmount = body.discountAmount || 0;
        const totalAmount = subtotal + totalDeliveryFee - discountAmount;

        const orderData = {
            customerName: firstName && lastName ? `${firstName} ${lastName}` : body.customerName || "Customer",
            phone,
            address,
            city,
            customizationNote: body.customizationNote || null,
            totalAmount,
            discountAmount,
            paymentMethod: body.paymentMethod || "COD",
            status: "PENDING" as const,
            userId: session?.user?.id || null,
            items: { create: orderItems }
        };

        let order: any = null;
        const maxAttempts = 5;

        // Find the last readable ID once outside the attempt loop to minimize reads
        // If it fails due to a collision, we refresh it inside the loop
        let lastOrder = await prisma.order.findFirst({
            where: { readableId: { startsWith: 'GVS-' } },
            orderBy: { readableId: 'desc' },
            select: { readableId: true }
        });

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            let maxNum = 0;
            if (lastOrder?.readableId) {
                const m = lastOrder.readableId.match(/^GVS-(\d+)$/);
                if (m) maxNum = parseInt(m[1], 10);
            }

            const nextIdNumber = maxNum + 1;
            const readableId = `GVS-${nextIdNumber.toString().padStart(5, "0")}`;

            try {
                order = await (prisma.order as any).create({
                    data: { readableId, ...orderData }
                });
                break;
            } catch (err: any) {
                console.error(`Order creation attempt ${attempt + 1} failed via Prisma:`, err);
                const isUniqueViolation = err?.code === "P2002" || (err?.message && String(err.message).includes("UNIQUE constraint failed"));
                if (isUniqueViolation && attempt < maxAttempts - 1) {
                    // Collision! Refresh lastOrder and try again
                    lastOrder = await prisma.order.findFirst({
                        where: { readableId: { startsWith: 'GVS-' } },
                        orderBy: { readableId: 'desc' },
                        select: { readableId: true }
                    });
                    continue;
                }

                // If error is due to missing customizationNote column or Prisma out of sync, perform direct Turso SQL fallback
                const url = process.env.TURSO_DATABASE_URL;
                const authToken = process.env.TURSO_AUTH_TOKEN;
                if (url && authToken) {
                    try {
                        const { createClient } = await import("@libsql/client");
                        const client = createClient({ url, authToken });

                        // Ensure column exists
                        try {
                            await client.execute('ALTER TABLE "Order" ADD COLUMN "customizationNote" TEXT');
                        } catch (e) {}

                        const id = "ord_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
                        await client.execute({
                            sql: `INSERT INTO "Order" (id, readableId, customerName, phone, address, city, customizationNote, totalAmount, discountAmount, paymentMethod, status, stockDeducted, userId, createdAt, updatedAt)
                                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                            args: [
                                id,
                                readableId,
                                orderData.customerName,
                                orderData.phone,
                                orderData.address,
                                orderData.city,
                                orderData.customizationNote,
                                orderData.totalAmount,
                                orderData.discountAmount,
                                orderData.paymentMethod,
                                "PENDING",
                                0,
                                orderData.userId
                            ]
                        });

                        for (const item of orderItems) {
                            const itemId = "item_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
                            await client.execute({
                                sql: `INSERT INTO "OrderItem" (id, orderId, productId, quantity, price, dealTitle)
                                      VALUES (?, ?, ?, ?, ?, ?)`,
                                args: [
                                    itemId,
                                    id,
                                    item.productId,
                                    item.quantity,
                                    item.price,
                                    item.dealTitle
                                ]
                            });
                        }

                        order = { id, readableId, ...orderData };
                        break;
                    } catch (tursoErr) {
                        console.error("Turso direct SQL fallback order creation failed:", tursoErr);
                    }
                }

                throw err;
            }
        }

        if (!order) {
            return NextResponse.json({ error: "Failed to create order (readableId)" }, { status: 500 });
        }

        // Auto-save user details to profile if logged in
        if (session?.user?.id) {
            try {
                // Use type casting to bypass temporary Prisma Client sync issues (EPERM during generate)
                await (prisma.user as any).update({
                    where: { id: session.user.id },
                    data: {
                        phone: phone || (session.user as any).phone,
                        address: address || (session.user as any).address,
                        city: city || (session.user as any).city,
                    }
                });
            } catch (profileError) {
                console.warn("User profile auto-save failed (likely client out of sync):", profileError);
            }
        }

        // Send Discord notification (fire and forget)
        let targetNotificationOrder = order;
        try {
            const fullOrder = await prisma.order.findUnique({
                where: { id: order.id },
                include: { items: { include: { product: true } } }
            });
            if (fullOrder) targetNotificationOrder = fullOrder;
        } catch (e) {
            console.warn("Prisma fetch for fullOrder failed, using order object:", e);
        }

        if (targetNotificationOrder) {
            targetNotificationOrder = {
                ...targetNotificationOrder,
                customizationNote: body.customizationNote || targetNotificationOrder.customizationNote || orderData.customizationNote || null
            };

            // 1. Send Discord notification
            sendDiscordOrderNotification(targetNotificationOrder).catch(err =>
                console.error("Delayed Discord notification failed:", err)
            );

            // 2. Track purchase via Meta Conversions API (CAPI) for deduplication
            const { trackPurchaseServer } = await import("@/lib/meta-capi");
            trackPurchaseServer(targetNotificationOrder).catch(err =>
                console.error("Meta CAPI tracking failed:", err)
            );
        }

        return NextResponse.json(order);
    } catch (error: any) {
        console.error("Order creation error:", error);
        return NextResponse.json({
            error: error?.message || "Failed to create order",
            details: error?.stack || String(error)
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    // Check auth - admin only
    try {
        const orders = await prisma.order.findMany({
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
