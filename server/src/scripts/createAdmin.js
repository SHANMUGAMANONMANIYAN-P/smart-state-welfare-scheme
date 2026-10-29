import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { query, initializeDatabase } from '../config/db.js';

dotenv.config();

async function createAdmin() {
  const args = process.argv.slice(2);
  const email = (process.env.ADMIN_EMAIL || args[0] || 'shanmugamanonmaniyan@gmail.com').trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD || args[1] || 'manon';

  console.log('==================================================');
  console.log('Secure Administrator Account Provisioning');
  console.log('==================================================');
  console.log(`Target Email: ${email}`);

  await initializeDatabase();

  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await query('SELECT id FROM users WHERE email = ?', [email]);

  if (existing && existing.length > 0) {
    await query('UPDATE users SET password_hash = ?, role = ? WHERE id = ?', [
      passwordHash,
      'admin',
      existing[0].id,
    ]);
    console.log(`✅ Administrator account updated with role="admin" for ${email}.`);
  } else {
    await query('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [
      email,
      passwordHash,
      'admin',
    ]);
    console.log(`✅ New Administrator created successfully with email: ${email}`);
  }

  console.log('\nStatus: Administrator provisioning complete.');
  console.log(`  Email:    ${email}`);
  console.log('  Password: [SECURED / HASHED WITH BCRYPT - NEVER LOGGED]');
  console.log('==================================================');
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('Error creating admin:', err.message);
  process.exit(1);
});
