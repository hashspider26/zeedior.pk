import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, categoryId } = body;

        if (!name || !categoryId) {
            return NextResponse.json({ error: "Name and Category ID are required" }, { status: 400 });
        }

        const id = "subcat_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;
        if (url && authToken) {
            try {
                const { createClient } = await import("@libsql/client");
                const client = createClient({ url, authToken });
                await client.execute({
                    sql: `INSERT INTO "SubCategory" (id, name, categoryId, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                    args: [id, name, categoryId]
                });
                return NextResponse.json({ id, name, categoryId });
            } catch (e: any) {
                console.error("Turso client subcategory create error:", e);
            }
        }

        const subCategory = await (prisma as any).subCategory.create({
            data: { id, name, categoryId }
        });

        return NextResponse.json(subCategory);
    } catch (error: any) {
        console.error("Failed to create subcategory:", error);
        return NextResponse.json({ error: "Failed to create subcategory" }, { status: 500 });
    }
}
