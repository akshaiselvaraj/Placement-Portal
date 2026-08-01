import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

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
  const newPassword = 'password123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    console.log(`Updated password for ${user.email} (${user.role}) to: ${newPassword}`);
  }
  
  pool.end();
}

main().catch(err => {
  console.error(err);
  pool.end();
});
