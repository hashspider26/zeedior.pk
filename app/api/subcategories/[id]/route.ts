import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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
                    sql: `DELETE FROM "SubCategory" WHERE id = ?`,
                    args: [params.id]
                });
                return NextResponse.json({ success: true });
            } catch (e: any) {
                console.error("Turso client subcategory delete error:", e);
            }
        }

        await (prisma as any).subCategory.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to delete subcategory:", error);
        return NextResponse.json({ error: "Failed to delete subcategory" }, { status: 500 });
    }
}
