#!/usr/bin/env tsx

/**
 * Password Migration Script
 * 
 * This script migrates plain text passwords to bcrypt hashes in the storage file.
 * It should be run once during the security upgrade process.
 */

import { PasswordManager } from './security.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface User {
  id: number;
  username: string;
  password?: string;
  passwordHash?: string;
  [key: string]: any;
}

interface AdminUser {
  id: number;
  username: string;
  password?: string;
  passwordHash?: string;
  [key: string]: any;
}

interface StorageData {
  users: User[];
  adminUsers: AdminUser[];
  clinicalUsers: User[];
  [key: string]: any;
}

async function migratePasswords() {
  const dataPath = path.join(__dirname, '../data/storage.json');
  
  try {
    // Read current storage data
    const rawData = await fs.readFile(dataPath, 'utf-8');
    const data: StorageData = JSON.parse(rawData);
    
    console.log('🔐 Starting password migration...');
    
    // Create default admin user with hashed password if none exists
    if (!data.adminUsers || data.adminUsers.length === 0) {
      console.log('📝 Creating default admin user...');
      const defaultAdminPasswordHash = await PasswordManager.hash('admin123');
      
      data.adminUsers = [{
        id: 1,
        username: 'admin',
        email: 'admin@wakeexer.local',
        firstName: 'System',
        lastName: 'Administrator',
        passwordHash: defaultAdminPasswordHash,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: null
      }];
    }
    
    // Migrate admin users
    let adminMigrated = 0;
    for (const user of data.adminUsers) {
      if (user.password && !user.passwordHash) {
        console.log(`🔑 Migrating admin user: ${user.username}`);
        user.passwordHash = await PasswordManager.hash(user.password);
        delete user.password;
        adminMigrated++;
      }
    }
    
    // Migrate clinical users
    let clinicalMigrated = 0;
    if (data.clinicalUsers) {
      for (const user of data.clinicalUsers) {
        if (user.password && !user.passwordHash) {
          console.log(`🔑 Migrating clinical user: ${user.username}`);
          user.passwordHash = await PasswordManager.hash(user.password);
          delete user.password;
          clinicalMigrated++;
        }
      }
    }
    
    // Write updated data back to file
    const updatedData = JSON.stringify(data, null, 2);
    await fs.writeFile(dataPath, updatedData, 'utf-8');
    
    console.log('✅ Password migration completed!');
    console.log(`   Admin users migrated: ${adminMigrated}`);
    console.log(`   Clinical users migrated: ${clinicalMigrated}`);
    console.log(`   Storage file updated: ${dataPath}`);
    
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      console.log('📂 No storage file found - will be created with secure defaults');
    } else {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migratePasswords().catch(console.error);
}

export { migratePasswords };
