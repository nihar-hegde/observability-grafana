import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
  ssl: {
    ca: readFileSync(resolve(__dirname, "../server-ca.pem")),
    rejectUnauthorized: false,
  },
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const users = Array.from({ length: 10 }).map((_, i) => ({
    email: `user${i + 1}@test.com`,
    name: `User ${i + 1}`,
  }));

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log("Seeded users");
}

main().finally(() => prisma.$disconnect());
