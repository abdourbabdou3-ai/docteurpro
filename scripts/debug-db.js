
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkDb(url, name, authToken = null) {
    console.log(`\n=== Checking Database: ${name} ===`);
    try {
        const client = createClient({ url, authToken });

        const tables = ["users", "doctors", "patients", "patient_files"];
        for (const table of tables) {
            try {
                const count = await client.execute(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`${table}: ${count.rows[0].count} records`);
            } catch (e) {
                console.log(`${table}: Table not found or error`);
            }
        }

        console.log("\nLatest Doctors:");
        const docs = await client.execute("SELECT id, name FROM doctors ORDER BY id DESC LIMIT 3;");
        console.table(docs.rows);

        console.log("\nLatest Patient Files:");
        const files = await client.execute("SELECT id, doctor_id, patient_id, file_path FROM patient_files ORDER BY id DESC LIMIT 3;");
        console.table(files.rows);

    } catch (err) {
        console.error(`Error connecting to ${name}:`, err.message);
    }
}

async function main() {
    // Check Turso
    await checkDb(process.env.TURSO_DATABASE_URL, "Turso", process.env.TURSO_AUTH_TOKEN);

    // Check Local
    const localUrl = `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`;
    await checkDb(localUrl, "Local dev.db");
}

main().catch(console.error);
