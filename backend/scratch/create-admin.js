const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  await client.connect();

  const email = 'admin@portal.com';
  const plainPassword = 'adminpassword';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  
  // Check if admin already exists
  const existing = await client.query('SELECT id FROM "User" WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    console.log(`Admin user already exists!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${plainPassword}`);
    await client.end();
    return;
  }
  
  // 1. Insert into User table
  const userRes = await client.query(
    'INSERT INTO "User" (id, email, password, role, name, "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id',
    [
      '57366fa7-ea31-419b-a010-09311cb93d7c',
      email,
      hashedPassword,
      'ADMIN',
      'System Admin',
      true
    ]
  );
  
  const userId = userRes.rows[0].id;
  
  // 2. Insert into admins table
  await client.query(
    'INSERT INTO admins (id, "userId", "employeeId", "firstName", "lastName", department, designation, role, status, "permissionLevel", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())',
    [
      'c85fe66b-45c1-4cb3-9114-f58c732ee783',
      userId,
      'EMP-ADMIN-01',
      'System',
      'Admin',
      'Administration',
      'System Director',
      'SUPER_ADMIN', // SUPER_ADMIN role bypasses all RBAC permission checks
      'ACTIVE',
      5
    ]
  );

  console.log(`Admin user created successfully!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${plainPassword}`);
  
  await client.end();
}

main().catch(console.error);
