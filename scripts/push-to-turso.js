const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env");
    process.exit(1);
}

const client = createClient({ url, authToken });

async function pushSchema() {
    try {
        const sqlPath = path.join(__dirname, '..', 'prisma', 'migration.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("🚀 Pushing schema to Turso...");

        // Split SQL by semicolons, but be careful with possible semicolons in strings
        // For migration.sql from Prisma, simple splitting is usually okay
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            await client.execute(statement);
        }

        console.log("✅ Schema pushed successfully!");
    } catch (error) {
        console.error("❌ Error pushing schema:", error);
        process.exit(1);
    } finally {
        client.close();
    }
}

pushSchema();
