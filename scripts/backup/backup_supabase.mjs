#!/usr/bin/env node
/**
 * Automated Supabase / PostgreSQL Backup Runner
 * HMorix Enterprise Platform
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const TABLES = [
  'users',
  'invoices',
  'projects',
  'tickets',
  'profiles'
];

async function runSupabaseBackup() {
  console.log('=== Starting Supabase / PostgreSQL Backup ===');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups', 'supabase', timestamp);
  fs.mkdirSync(backupDir, { recursive: true });

  const manifest = {
    backupId: `supabase-${timestamp}`,
    provider: 'Supabase PostgreSQL',
    createdAt: new Date().toISOString(),
    tables: {},
    totalRecords: 0,
    totalBytes: 0,
    checksumAlgorithm: 'SHA-256',
    status: 'COMPLETED'
  };

  if (!supabaseUrl || !supabaseKey) {
    console.log('  [NOTE] Supabase credentials not configured or using MongoDB-only mode.');
    manifest.status = 'SKIPPED_NO_CREDENTIALS';
    const manifestPath = path.join(backupDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    return manifest;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  for (const table of TABLES) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;

      const rows = data || [];
      const jsonContent = JSON.stringify(rows, null, 2);
      const fileName = `${table}.json`;
      const filePath = path.join(backupDir, fileName);

      fs.writeFileSync(filePath, jsonContent, 'utf-8');
      const hash = crypto.createHash('sha256').update(jsonContent).digest('hex');
      const stats = fs.statSync(filePath);

      manifest.tables[table] = {
        file: fileName,
        count: rows.length,
        sizeBytes: stats.size,
        sha256: hash
      };

      manifest.totalRecords += rows.length;
      manifest.totalBytes += stats.size;
      console.log(`  [OK] Exported Supabase table ${table}: ${rows.length} rows`);
    } catch (err) {
      console.warn(`  [INFO] Table ${table}: ${err.message}`);
    }
  }

  const manifestPath = path.join(backupDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`\n=== Supabase Backup Finished: ${manifest.totalRecords} records saved ===`);
  return manifest;
}

runSupabaseBackup().catch(err => {
  console.error('[DR-Backup] Fatal error during Supabase backup:', err);
  process.exit(1);
});
