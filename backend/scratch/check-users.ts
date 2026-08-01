import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = "postgresql://postgres.rgmfsmjhrupnckzwbpex:Akshai_22db@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=no-verify";
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users:", users);
  pool.end();
}

main().catch(err => {
  console.error(err);
  pool.end();
});
