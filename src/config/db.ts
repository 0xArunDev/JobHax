import 'dotenv/config';
import mysql2 from "mysql2/promise"
import { drizzle } from "drizzle-orm/mysql2";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error(
        "DATABASE_URL is not set. Add it to .env locally and to " +
        "Project Settings > Environment Variables on Vercel, then redeploy."
    );
}

const pool = mysql2.createPool({
    uri: databaseUrl,
})

export const db = drizzle(pool);
