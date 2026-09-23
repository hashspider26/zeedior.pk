
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function GET() {
    try {
        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;
        if (url && authToken) {
            try {
                const { createClient } = await import("@libsql/client");
                const client = createClient({ url, authToken });
                const catRes = await client.execute('SELECT * FROM "Category" ORDER BY name ASC');
                const subRes = await client.execute('SELECT * FROM "SubCategory" ORDER BY name ASC');

                const subMap: Record<string, any[]> = {};
                subRes.rows.forEach((sub: any) => {
                    const cId = String(sub.categoryId);
                    if (!subMap[cId]) subMap[cId] = [];
                    subMap[cId].push({
                        id: String(sub.id),
                        name: String(sub.name),
                        categoryId: String(sub.categoryId)
                    });
                });

                const result = catRes.rows.map((c: any) => ({
                    id: String(c.id),
                    name: String(c.name),
                    subcategories: subMap[String(c.id)] || []
                }));

                return NextResponse.json(result);
            } catch (e) {
                console.warn("Turso direct category GET failed, falling to Prisma:", e);
            }
        }

        const categories = await (prisma.category as any).findMany({
            include: { subcategories: true },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: { name },
        });

        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}
