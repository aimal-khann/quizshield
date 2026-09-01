import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle pg client:", err);
});

const adapter = new PrismaPg(pool, {
  onPoolError: (err) => console.error("Prisma PG Pool Error:", err),
  onConnectionError: (err) => console.error("Prisma PG Connection Error:", err),
});

const prisma = new PrismaClient({ adapter });

export default prisma;

