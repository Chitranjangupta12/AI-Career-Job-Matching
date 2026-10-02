/**
 * Database Initializer and Migration Runner
 * Sets up the career_guidance PostgreSQL database, runs schema.sql and seed.sql
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env or root .env
const envPath = path.resolve(__dirname, '../backend/.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT, 10) || 5432;
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'career_guidance';

async function initializeDatabase() {
  console.log('====================================================');
  console.log('🚀 AI Career Guidance & Job Matching Database Setup');
  console.log('====================================================');
  console.log(`Connecting to PostgreSQL at ${dbHost}:${dbPort} as user "${dbUser}"...`);

  // Step 1: Connect to default 'postgres' database to check/create target database
  const rootClient = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await rootClient.connect();
    console.log('Connected to PostgreSQL server.');

    const checkDbRes = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1;`,
      [dbName]
    );

    if (checkDbRes.rowCount === 0) {
      console.log(`Database "${dbName}" does not exist. Creating...`);
      await rootClient.query(`CREATE DATABASE "${dbName}";`);
      console.log(` Database "${dbName}" created successfully.`);
    } else {
      console.log(` Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error(' Error connecting to PostgreSQL server:');
    console.error(`Message: ${err.message}`);
    console.error('Please verify DB_HOST, DB_PORT, DB_USER, and DB_PASSWORD in backend/.env');
    process.exit(1);
  } finally {
    await rootClient.end();
  }

  // Step 2: Connect to target 'career_guidance' database and apply schema and seed
  const appClient = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    ssl: { rejectUnauthorized: false }
});

  try {
    await appClient.connect();
    console.log(`Connected to database "${dbName}".`);

    // Execute Schema
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('Applying database schema from schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await appClient.query(schemaSql);
      console.log(' Database schema applied successfully.');
    }

    // Execute Seed Data
    const seedPath = path.resolve(__dirname, 'seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log('Applying seed data from seed.sql...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await appClient.query(seedSql);
      console.log(' Seed data inserted successfully.');
    }

    console.log('====================================================');
    console.log(' Database initialization completed successfully!');
    console.log('====================================================');
  } catch (err) {
    console.error(' Error executing schema/seed:');
    console.error(`Message: ${err.message}`);
    process.exit(1);
  } finally {
    await appClient.end();
  }
}

initializeDatabase();
