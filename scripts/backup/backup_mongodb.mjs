#!/usr/bin/env node
/**
 * Automated MongoDB Atlas Backup Runner
 * HMorix Enterprise Platform
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

let MongoClient = null;
try {
  const mongoMod = await import('mongodb');
  MongoClient = mongoMod.MongoClient;
} catch {}

try {
  const dotenv = await import('dotenv');
  dotenv.default?.config?.();
} catch {}

if (!MongoClient) {
  console.error('[DR-Backup] ERROR: mongodb package is not installed. Run npm install first.');
  process.exit(1);
}

const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
if (!uri) {
  console.error('[DR-Backup] ERROR: MONGODB_URI environment variable is not defined.');
  process.exit(1);
}

const COLLECTIONS = [
  'users',
  'sessions',
  'crm_contacts',
  'crm_deals',
  'contact_submissions',
  'hrm_employees',
  'hrm_tasks',
  'hrm_leave_requests',
  'hrm_payroll_runs',
  'hrm_recruitment',
  'client_projects',
  'support_tickets',
  'activity_log',
  'profiles',
  'user_settings',
  'notifications'
];

async function runMongoBackup() {
  console.log('=== Starting MongoDB Automated Backup ===');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups', 'mongodb', timestamp);
  fs.mkdirSync(backupDir, { recursive: true });

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    console.log(`Connected to database: ${db.databaseName}`);

    const manifest = {
      backupId: `mongo-${timestamp}`,
      database: db.databaseName,
      provider: 'MongoDB Atlas',
      createdAt: new Date().toISOString(),
      collections: {},
      totalDocuments: 0,
      totalBytes: 0,
      checksumAlgorithm: 'SHA-256',
      status: 'COMPLETED'
    };

    for (const colName of COLLECTIONS) {
      try {
        const col = db.collection(colName);
        const docs = await col.find({}).toArray();
        const jsonContent = JSON.stringify(docs, null, 2);
        const fileName = `${colName}.json`;
        const filePath = path.join(backupDir, fileName);
        
        fs.writeFileSync(filePath, jsonContent, 'utf-8');
        
        const hash = crypto.createHash('sha256').update(jsonContent).digest('hex');
        const stats = fs.statSync(filePath);

        manifest.collections[colName] = {
          file: fileName,
          count: docs.length,
          sizeBytes: stats.size,
          sha256: hash
        };

        manifest.totalDocuments += docs.length;
        manifest.totalBytes += stats.size;
        console.log(`  [OK] Exported ${colName}: ${docs.length} docs (${stats.size} bytes)`);
      } catch (err) {
        console.warn(`  [SKIP] Collection ${colName}: ${err.message}`);
      }
    }

    const manifestPath = path.join(backupDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

    // Update root backup pointer
    const rootManifestPath = path.join(process.cwd(), 'backups', 'manifest.json');
    fs.writeFileSync(rootManifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

    console.log(`\n=== MongoDB Backup Finished: ${manifest.totalDocuments} documents saved ===`);
    console.log(`Location: ${backupDir}`);
    return manifest;
  } finally {
    await client.close();
  }
}

runMongoBackup().catch(err => {
  console.error('[DR-Backup] Fatal error during backup:', err);
  process.exit(1);
});
