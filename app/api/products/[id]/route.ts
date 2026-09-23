import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { multiDelete } from "@/lib/cloudinary-server";
import { extractPublicId } from "@/lib/cloudinary";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;
        if (url && authToken) {
            try {
                const { createClient } = await import("@libsql/client");
                const client = createClient({ url, authToken });
                const res = await client.execute({
                    sql: 'SELECT * FROM "Product" WHERE id = ?',
                    args: [params.id]
                });
                if (res.rows.length > 0) {
                    const row: any = res.rows[0];
                    const variationsRes = await client.execute({
                        sql: 'SELECT * FROM "ProductVariation" WHERE productId = ?',
                        args: [params.id]
                    });
                    return NextResponse.json({
                        id: String(row.id),
                        title: String(row.title),
                        slug: String(row.slug),
                        description: String(row.description),
                        price: Number(row.price),
                        salePrice: row.salePrice ? Number(row.salePrice) : null,
                        category: String(row.category),
                        stock: Number(row.stock),
                        isCustomizable: row.isCustomizable === 1 || row.isCustomizable === true || row.isCustomizable === "1",
                        images: String(row.images || "[]"),
                        isFeatured: row.isFeatured === 1 || row.isFeatured === true || row.isFeatured === "1",
                        deliveryFee: Number(row.deliveryFee || 0),
                        weight: Number(row.weight || 0),
                        advanceDiscount: Number(row.advanceDiscount || 0),
                        advanceDiscountType: String(row.advanceDiscountType || "PKR"),
                        variations: variationsRes.rows.map((v: any) => ({
                            id: String(v.id),
                            productId: String(v.productId),
                            title: String(v.title),
                            discountLabel: v.discountLabel ? String(v.discountLabel) : null,
                            price: Number(v.price),
                            originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
                            image: v.image ? String(v.image) : null,
                            stock: Number(v.stock),
                            deliveryFee: Number(v.deliveryFee || 0),
                        }))
                    });
                }
            } catch (e) {
                console.warn("Direct Turso client GET failed, trying Prisma:", e);
            }
        }

        const product = await prisma.product.findUnique({
            where: { id: params.id },
            include: { variations: true }
        });
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
        return NextResponse.json({
            ...product,
            isCustomizable: (product as any).isCustomizable === 1 || (product as any).isCustomizable === true || (product as any).isCustomizable === "1"
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();

        // Handle image deletions if images were removed
        try {
            const oldProduct = await prisma.product.findUnique({ where: { id: params.id }, select: { images: true } });
            if (oldProduct) {
                const oldImages = JSON.parse(oldProduct.images || "[]");
                const newImages = body.images || [];

                // Find images that were in the old list but are not in the new list
                const removedImages = oldImages.filter((img: string) => !newImages.includes(img));

                for (const imgUrl of removedImages) {
                    if (imgUrl.includes('cloudinary.com')) {
                        const publicId = extractPublicId(imgUrl);
                        if (publicId) await multiDelete(publicId).catch(console.warn);
                    }
                }
            }
        } catch (e) {
            console.warn("Soft conflict during image cleanup in PUT:", e);
        }

        const isCustomizableVal = body.isCustomizable === true || body.isCustomizable === "true" || body.isCustomizable === 1 || body.isCustomizable === "1";

        try {
            const product = await prisma.product.update({
                where: { id: params.id },
                data: {
                    title: body.title,
                    description: body.description,
                    price: Number(body.price),
                    salePrice: body.salePrice ? Number(body.salePrice) : null,
                    category: body.category,
                    subCategory: body.subCategory || null,
                    stock: Number(body.stock),
                    isCustomizable: isCustomizableVal,
                    images: JSON.stringify(body.images || []),
                    isFeatured: body.isFeatured,
                    weight: body.weight !== undefined && body.weight !== "" ? Number(body.weight) : 0,
                    deliveryFee: body.deliveryFee !== undefined && body.deliveryFee !== "" ? Number(body.deliveryFee) : 0,
                    advanceDiscount: body.advanceDiscount ? Number(body.advanceDiscount) : 0,
                    advanceDiscountType: body.advanceDiscountType || "PKR",
                    variations: {
                        deleteMany: {},
                        ...(body.variations && body.variations.length > 0 && {
                            create: body.variations.map((v: any) => ({
                                title: v.title,
                                price: Number(v.price),
                                originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
                                discountLabel: v.discountLabel || null,
                                stock: Number(v.stock || 0),
                                deliveryFee: v.deliveryFee !== undefined ? Number(v.deliveryFee) : 0
                            }))
                        })
                    }
                } as any,
                include: { variations: true }
            });
            return NextResponse.json(product);
        } catch (dbError: any) {
            console.error("Prisma product update failed:", dbError);

            // Fallback via direct Turso SQL if column migration or Prisma client issue occurred
            const url = process.env.TURSO_DATABASE_URL;
            const authToken = process.env.TURSO_AUTH_TOKEN;
            if (url && authToken) {
                const { createClient } = await import("@libsql/client");
                const client = createClient({ url, authToken });

                // Try altering table to ensure isCustomizable exists
                try {
                    await client.execute('ALTER TABLE "Product" ADD COLUMN "isCustomizable" BOOLEAN DEFAULT 0');
                } catch (e) {}

                // Execute SQL update directly
                await client.execute({
                    sql: `UPDATE "Product" SET 
                            title = ?, 
                            description = ?, 
                            price = ?, 
                            salePrice = ?, 
                            category = ?, 
                            subCategory = ?,
                            stock = ?, 
                            isCustomizable = ?, 
                            images = ?, 
                            weight = ?, 
                            deliveryFee = ?, 
                            advanceDiscount = ?, 
                            advanceDiscountType = ?, 
                            updatedAt = CURRENT_TIMESTAMP 
                          WHERE id = ?`,
                    args: [
                        body.title,
                        body.description,
                        Number(body.price),
                        body.salePrice ? Number(body.salePrice) : null,
                        body.category,
                        body.subCategory || null,
                        Number(body.stock),
                        isCustomizableVal ? 1 : 0,
                        JSON.stringify(body.images || []),
                        body.weight !== undefined && body.weight !== "" ? Number(body.weight) : 0,
                        body.deliveryFee !== undefined && body.deliveryFee !== "" ? Number(body.deliveryFee) : 0,
                        body.advanceDiscount ? Number(body.advanceDiscount) : 0,
                        body.advanceDiscountType || "PKR",
                        params.id
                    ]
                });

                // Update variations
                await client.execute({
                    sql: `DELETE FROM "ProductVariation" WHERE productId = ?`,
                    args: [params.id]
                });

                if (body.variations && body.variations.length > 0) {
                    for (const v of body.variations) {
                        const vId = v.id || ("var_" + Date.now() + Math.random().toString(36).substring(2, 6));
                        await client.execute({
                            sql: `INSERT INTO "ProductVariation" (id, productId, title, price, originalPrice, discountLabel, stock, deliveryFee, updatedAt)
                                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                            args: [
                                vId,
                                params.id,
                                v.title,
                                Number(v.price),
                                v.originalPrice ? Number(v.originalPrice) : null,
                                v.discountLabel || null,
                                Number(v.stock || 0),
                                v.deliveryFee !== undefined ? Number(v.deliveryFee) : 0
                            ]
                        });
                    }
                }

                return NextResponse.json({ success: true, id: params.id });
            }

            throw dbError;
        }
    } catch (error: any) {
        console.error("Failed to update product:", error);
        return NextResponse.json({ error: "Failed to update product", details: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        // Get product first to access image URLs
        const product = await prisma.product.findUnique({
            where: { id: params.id },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Delete associated images from Cloudinary
        try {
            const images = product.images ? JSON.parse(product.images) : [];
            if (Array.isArray(images)) {
                for (const imageUrl of images) {
                    if (imageUrl && typeof imageUrl === 'string') {
                        // Check if it's a Cloudinary URL
                        if (imageUrl.includes('cloudinary.com')) {
                            const publicId = extractPublicId(imageUrl);
                            if (publicId) {
                                try {
                                    await multiDelete(publicId);
                                } catch (error) {
                                    console.warn(`Failed to delete Cloudinary image ${publicId}:`, error);
                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.warn("Error deleting product images:", error);
            // Continue with product deletion even if image deletion fails
        }

        // Delete the product
        await prisma.product.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete product error:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
