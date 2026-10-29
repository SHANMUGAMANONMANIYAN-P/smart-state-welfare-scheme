import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initMySQL() {
  console.log('==================================================');
  console.log('Initializing MySQL Database for Smart Welfare Engine');
  console.log('==================================================');

  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'welfare_schemes_db';

  console.log(`Connecting to MySQL at ${host}:${port} as ${user}...`);

  let connection;
  try {
    // 1. Connect without database to create if missing
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });

    console.log('✅ Connected to MySQL server.');

    // 2. Create database
    console.log(`Ensuring database "${database}" exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${database}\`;`);
    console.log(`✅ Using database "${database}".`);

    // 3. Read and execute schema.sql
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log(`Reading schema from ${schemaPath}...`);
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      console.log('✅ Schema executed successfully (8 tables created).');
    }

    // 4. Read and execute seed.sql
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log(`Reading seed data from ${seedPath}...`);
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await connection.query(seedSql);
      console.log('✅ Demonstration seed data loaded successfully.');
    }

    console.log('\n🎉 MySQL Database initialization complete!');
    await connection.end();
  } catch (err) {
    console.error('\n❌ MySQL Initialization Failed:', err.message);
    console.error('Please verify your DB_PASSWORD in server/.env and ensure MySQL80 service is running.');
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

initMySQL();
