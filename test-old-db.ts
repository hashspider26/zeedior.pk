
import { createClient } from '@libsql/client';

const URL = process.env.TURSO_DATABASE_URL || "libsql://zeedior-hashspider.aws-ap-south-1.turso.io";
const TOKEN = process.env.TURSO_AUTH_TOKEN || "";

const client = createClient({
  url: URL,
  authToken: TOKEN,
});

async function testConnection() {
  console.log('Testing connection to old Turso database...');
  try {
    const result = await client.execute('SELECT name FROM sqlite_master WHERE type="table"');
    console.log('Connection successful!');
    console.log('Found tables:', result.rows.map(r => r.name).join(', '));
  } catch (error: any) {
    console.error('Failed to connect to old database:');
    console.error(error.message);
    if (error.message.includes('limit') || error.message.includes('quota')) {
      console.error('--- ALERT: YOUR ACCOUNT IS COMPLETELY LOCKED BY READ LIMITS ---');
    }
  }
}

testConnection();
