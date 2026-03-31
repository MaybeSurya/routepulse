import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/client";
import bcrypt from "bcryptjs";
import pg from "pg";

// Using the verified connection string found in packages/db/.env
const DATABASE_URL = "postgresql://postgres.vwegdroqpyfxifjgysrs:HVkzUPuYgPGlJHyC@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres";

async function main() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const email = "adn@routepulse.com";
  const password = "password123";
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  console.log(`[Seed] Connecting to database...`);
  
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { 
        role: "super_admin", 
        passwordHash,
        isVerified: true
      },
      create: {
        email,
        passwordHash,
        role: "super_admin",
        isVerified: true
      }
    });

    console.log(`[Seed] SUCCESS: Super Admin created/updated: ${email}`);
  } catch (err) {
    console.error(`[Seed] FAILED:`, err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(console.error);
