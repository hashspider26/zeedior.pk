import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@libsql/client";

export const dynamic = "force-dynamic";

const DEFAULT_BANNERS = [
  {
    key: "hero-banner-1",
    mediaType: "IMAGE",
    mediaUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920",
    showContent: true,
    badge: "ZEEDIOR EXCLUSIVE 2026",
    title: "LUXURY & CUSTOM CRAFTSMANSHIP",
    subtitle: "Discover personalized rings, engraved wallets, custom printed cups, and unique accessories crafted to perfection.",
    buttonText: "EXPLORE COLLECTION",
    buttonUrl: "/shop",
    align: "center",
  },
  {
    key: "mid-banner-2",
    mediaType: "IMAGE",
    mediaUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1920",
    showContent: true,
    badge: "SEASONAL SPOTLIGHT",
    title: "PERSONALIZED GIFTS & UNIQUE GADGETS",
    subtitle: "Unmatched quality personalized products designed to leave a lasting impression for your loved ones.",
    buttonText: "SHOP FEATURED",
    buttonUrl: "/shop",
    align: "left",
  },
];

function getLibsqlClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (url && authToken) {
    return createClient({ url, authToken });
  }
  return null;
}

async function fetchBannersFromDb() {
  const client = getLibsqlClient();

  if (client) {
    const res = await client.execute('SELECT * FROM "Banner"');
    return res.rows.map((row: any) => ({
      id: String(row.id),
      key: String(row.key),
      mediaType: String(row.mediaType || "IMAGE"),
      mediaUrl: String(row.mediaUrl || ""),
      showContent: row.showContent === 1 || row.showContent === true || row.showContent === "1",
      badge: row.badge ? String(row.badge) : "",
      title: row.title ? String(row.title) : "",
      subtitle: row.subtitle ? String(row.subtitle) : "",
      buttonText: row.buttonText ? String(row.buttonText) : "",
      buttonUrl: row.buttonUrl ? String(row.buttonUrl) : "/shop",
      align: row.align ? String(row.align) : "center",
    }));
  }

  if ((prisma as any).banner) {
    return await (prisma as any).banner.findMany();
  }

  try {
    const rows: any[] = await prisma.$queryRawUnsafe('SELECT * FROM "Banner"');
    return rows.map((row: any) => ({
      ...row,
      showContent: row.showContent === 1 || row.showContent === true,
    }));
  } catch (e) {
    return [];
  }
}

async function saveBannerToDb(item: any) {
  const client = getLibsqlClient();
  const id = item.id || ("c" + Date.now().toString(36) + Math.random().toString(36).substring(2, 7));
  const showContentVal = item.showContent !== false ? 1 : 0;

  if (client) {
    try {
      await client.execute({
        sql: `INSERT INTO "Banner" (id, key, mediaType, mediaUrl, showContent, badge, title, subtitle, buttonText, buttonUrl, align, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
              ON CONFLICT(key) DO UPDATE SET
                mediaType = excluded.mediaType,
                mediaUrl = excluded.mediaUrl,
                showContent = excluded.showContent,
                badge = excluded.badge,
                title = excluded.title,
                subtitle = excluded.subtitle,
                buttonText = excluded.buttonText,
                buttonUrl = excluded.buttonUrl,
                align = excluded.align,
                updatedAt = CURRENT_TIMESTAMP`,
        args: [
          id,
          item.key,
          item.mediaType || "IMAGE",
          item.mediaUrl || "",
          showContentVal,
          item.badge || "",
          item.title || "",
          item.subtitle || "",
          item.buttonText || "",
          item.buttonUrl || "/shop",
          item.align || "center",
        ],
      });
      return item;
    } catch (err: any) {
      if (err.message && err.message.includes("no column named showContent")) {
        try {
          await client.execute('ALTER TABLE "Banner" ADD COLUMN "showContent" BOOLEAN DEFAULT 1');
          await client.execute({
            sql: `INSERT INTO "Banner" (id, key, mediaType, mediaUrl, showContent, badge, title, subtitle, buttonText, buttonUrl, align, updatedAt)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                  ON CONFLICT(key) DO UPDATE SET
                    mediaType = excluded.mediaType,
                    mediaUrl = excluded.mediaUrl,
                    showContent = excluded.showContent,
                    badge = excluded.badge,
                    title = excluded.title,
                    subtitle = excluded.subtitle,
                    buttonText = excluded.buttonText,
                    buttonUrl = excluded.buttonUrl,
                    align = excluded.align,
                    updatedAt = CURRENT_TIMESTAMP`,
            args: [
              id,
              item.key,
              item.mediaType || "IMAGE",
              item.mediaUrl || "",
              showContentVal,
              item.badge || "",
              item.title || "",
              item.subtitle || "",
              item.buttonText || "",
              item.buttonUrl || "/shop",
              item.align || "center",
            ],
          });
          return item;
        } catch (retryErr) {}
      }
      throw err;
    }
  }

  if ((prisma as any).banner) {
    return await (prisma as any).banner.upsert({
      where: { key: item.key },
      update: {
        mediaType: item.mediaType || "IMAGE",
        mediaUrl: item.mediaUrl || "",
        showContent: item.showContent !== false,
        badge: item.badge || "",
        title: item.title || "",
        subtitle: item.subtitle || "",
        buttonText: item.buttonText || "",
        buttonUrl: item.buttonUrl || "/shop",
        align: item.align || "center",
      },
      create: {
        key: item.key,
        mediaType: item.mediaType || "IMAGE",
        mediaUrl: item.mediaUrl || "",
        showContent: item.showContent !== false,
        badge: item.badge || "",
        title: item.title || "",
        subtitle: item.subtitle || "",
        buttonText: item.buttonText || "",
        buttonUrl: item.buttonUrl || "/shop",
        align: item.align || "center",
      },
    });
  }

  await prisma.$executeRawUnsafe(
    `INSERT INTO "Banner" (id, key, mediaType, mediaUrl, showContent, badge, title, subtitle, buttonText, buttonUrl, align, updatedAt)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET
       mediaType = $3, mediaUrl = $4, showContent = $5, badge = $6, title = $7, subtitle = $8, buttonText = $9, buttonUrl = $10, align = $11, updatedAt = CURRENT_TIMESTAMP`,
    id,
    item.key,
    item.mediaType || "IMAGE",
    item.mediaUrl || "",
    showContentVal,
    item.badge || "",
    item.title || "",
    item.subtitle || "",
    item.buttonText || "",
    item.buttonUrl || "/shop",
    item.align || "center"
  );

  return item;
}

export async function GET() {
  try {
    const banners = await fetchBannersFromDb();

    const bannerMap: Record<string, any> = {};
    banners.forEach((b: any) => {
      bannerMap[b.key] = b;
    });

    const result = DEFAULT_BANNERS.map((def) => {
      return bannerMap[def.key] ? bannerMap[def.key] : def;
    });

    return NextResponse.json({ banners: result });
  } catch (error: any) {
    console.error("GET /api/admin/banners error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const body = await req.json();
    const { banners } = body;

    if (!Array.isArray(banners)) {
      return NextResponse.json({ error: "Invalid payload format. Expected 'banners' array." }, { status: 400 });
    }

    const savedBanners = [];
    for (const item of banners) {
      if (!item.key) continue;
      const updated = await saveBannerToDb(item);
      savedBanners.push(updated);
    }

    return NextResponse.json({ success: true, banners: savedBanners });
  } catch (error: any) {
    console.error("POST /api/admin/banners error:", error);
    return NextResponse.json({ error: error.message || "Failed to save banners" }, { status: 500 });
  }
}
