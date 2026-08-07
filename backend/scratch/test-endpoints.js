const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  await client.connect();
  // Find student sahithya
  const res = await client.query('SELECT id, email, role FROM "User" WHERE email = $1', ['sahi@gmail.com']);
  const user = res.rows[0];
  if (!user) {
    console.error("User sahi@gmail.com not found!");
    await client.end();
    return;
  }
  console.log("Found user:", user);
  await client.end();

  // Sign token
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
  console.log("Signed Token:", token);

  // Helper to fetch
  const testUrl = async (url) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const text = await response.text();
      console.log(`\nURL: ${url}`);
      console.log(`STATUS: ${response.status}`);
      try {
        console.log("RESPONSE:", JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        console.log("RESPONSE TEXT:", text.substring(0, 500));
      }
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
    }
  };

  await testUrl('http://localhost:5000/api/students/profile');
  await testUrl('http://localhost:5000/api/ps/me');
  await testUrl('http://localhost:5000/api/notifications');
}

main().catch(console.error);
