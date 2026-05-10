#!/usr/bin/env node

/**
 * This script switches the Prisma schema between SQLite (development) 
 * and PostgreSQL (production/Vercel) based on the DATABASE_URL environment variable.
 * 
 * Usage: node scripts/switch-provider.js
 * 
 * If DATABASE_URL contains "postgresql" or "neon.tech", it uses the PostgreSQL schema.
 * Otherwise, it uses the SQLite schema.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const sqliteSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.sqlite.prisma');
const postgresSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prod.prisma');

const dbUrl = process.env.DATABASE_URL || '';

if (dbUrl.includes('postgresql') || dbUrl.includes('neon.tech') || dbUrl.includes('supabase') || process.env.VERCEL) {
  console.log('🔧 Production mode detected - switching to PostgreSQL schema');
  if (fs.existsSync(postgresSchemaPath)) {
    fs.copyFileSync(postgresSchemaPath, schemaPath);
    console.log('✅ PostgreSQL schema activated');
  } else {
    console.log('⚠️ schema.prod.prisma not found, keeping current schema');
  }
} else {
  console.log('🔧 Development mode detected - using SQLite schema');
  if (fs.existsSync(sqliteSchemaPath)) {
    fs.copyFileSync(sqliteSchemaPath, schemaPath);
    console.log('✅ SQLite schema activated');
  } else {
    console.log('⚠️ schema.sqlite.prisma not found, keeping current schema');
  }
}
