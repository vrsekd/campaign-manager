import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupTestDatabase(): Promise<PrismaClient> {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "file::memory:",
      },
    },
  });

  await prisma.$connect();

  const schemaSql = execSync(
    `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`,
    {
      cwd: path.join(__dirname, ".."),
      encoding: "utf-8",
    },
  );

  const statements = schemaSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }

  return prisma;
}

export async function teardownTestDatabase(prisma: PrismaClient) {
  await prisma.$disconnect();
}
