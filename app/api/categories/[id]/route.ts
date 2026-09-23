
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, image } = body;

        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;
        if (url && authToken) {
            try {
                const { createClient } = await import("@libsql/client");
                const client = createClient({ url, authToken });
                try {
                    await client.execute('ALTER TABLE "Category" ADD COLUMN "image" TEXT');
                } catch (e) {}

                await client.execute({
                    sql: 'UPDATE "Category" SET name = COALESCE(?, name), image = COALESCE(?, image), updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
                    args: [name ? name.trim() : null, image !== undefined ? image : null, params.id]
                });
                return NextResponse.json({ success: true, id: params.id, name, image });
            } catch (tursoErr) {
                console.warn("Direct Turso Category PATCH failed, fallback to Prisma:", tursoErr);
            }
        }

        const category = await (prisma.category as any).update({
            where: { id: params.id },
            data: {
                ...(name ? { name: name.trim() } : {}),
                ...(image !== undefined ? { image } : {})
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;
        if (url && authToken) {
            try {
                const { createClient } = await import("@libsql/client");
                const client = createClient({ url, authToken });
                await client.execute({
                    sql: 'DELETE FROM "Category" WHERE id = ?',
                    args: [params.id]
                });
                return NextResponse.json({ success: true });
            } catch (e) {}
        }

        await (prisma.category as any).delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}
