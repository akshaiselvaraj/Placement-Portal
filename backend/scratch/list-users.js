const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT email, role, name FROM "User"');
  console.log("USERS:", JSON.stringify(res.rows, null, 2));
  await client.end();
}

main().catch(console.error);
