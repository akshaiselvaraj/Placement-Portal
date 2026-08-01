import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import prisma from '../src/config/database';

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      name: true,
      isActive: true,
    }
  });
  console.log("USERS:", JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
