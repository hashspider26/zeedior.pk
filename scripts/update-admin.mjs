import { createClient } from "@libsql/client";
import { createHash } from "crypto";

// bcrypt via pure JS (node has no built-in bcrypt, use a simple workaround)
// We'll use the bcryptjs npm package which is already in the project
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs");

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env");
  process.exit(1);
}

const client = createClient({ url, authToken });

const EMAIL = "admin@zeedior.pk";
const PASSWORD = "zzzdior@26";
const NAME = "Admin";

async function run() {
  console.log("🔐 Hashing password...");
  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  console.log(`👤 Upserting admin user: ${EMAIL}`);

  // Check if user exists
  const existing = await client.execute({
    sql: `SELECT id FROM "User" WHERE email = ?`,
    args: [EMAIL],
  });

  // Also check for old admin email
  const oldAdmin = await client.execute({
    sql: `SELECT id FROM "User" WHERE email = ? AND isAdmin = 1`,
    args: ["admin@greenvalley.pk"],
  });

  if (existing.rows.length > 0) {
    // Update existing
    await client.execute({
      sql: `UPDATE "User" SET password = ?, isAdmin = 1, name = ?, updatedAt = CURRENT_TIMESTAMP WHERE email = ?`,
      args: [hashedPassword, NAME, EMAIL],
    });
    console.log(`✅ Updated existing user: ${EMAIL}`);
  } else {
    // Generate a cuid-like ID
    const id = "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

    await client.execute({
      sql: `INSERT INTO "User" (id, email, name, password, isAdmin, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: [id, EMAIL, NAME, hashedPassword],
    });
    console.log(`✅ Created new admin user: ${EMAIL}`);
  }

  // Remove old admin if different email
  if (oldAdmin.rows.length > 0) {
    await client.execute({
      sql: `DELETE FROM "User" WHERE email = ? AND isAdmin = 1`,
      args: ["admin@greenvalley.pk"],
    });
    console.log(`🗑️  Removed old admin: admin@greenvalley.pk`);
  }

  console.log("\n🎉 Done! Admin credentials:");
  console.log(`   Email:    ${EMAIL}`);
  console.log(`   Password: ${PASSWORD}`);
}

run().catch(console.error);
