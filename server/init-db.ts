#!/usr/bin/env tsx

/**
 * Database Initialization Script
 * 
 * This script initializes the Railway PostgreSQL database with essential data:
 * - Assessment types (TAM, Kapandji, Wrist assessments)
 * - Default admin and clinical users
 * - Cohorts (injury types)
 * - Basic configuration
 */

import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';
import { PasswordManager } from './security';

// Database connection
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...');

  try {
    // 1. Create default cohorts (injury types)
    console.log('📝 Creating cohorts...');
    const cohortsToCreate = [
      {
        name: 'Distal Radius Fracture',
        description: 'Patients recovering from distal radius fractures',
        normalRomRanges: {
          wristFlexion: { min: 65, max: 75 },
          wristExtension: { min: 55, max: 65 },
          radialDeviation: { min: 15, max: 25 },
          ulnarDeviation: { min: 30, max: 40 }
        },
        isActive: true
      },
      {
        name: 'Hand Surgery',
        description: 'Patients recovering from hand surgical procedures',
        normalRomRanges: {
          fingerFlexion: { min: 260, max: 280 },
          fingerExtension: { min: 0, max: 10 },
          thumbOpposition: { min: 4, max: 5 }
        },
        isActive: true
      }
    ];

    for (const cohort of cohortsToCreate) {
      await db.insert(schema.cohorts).values(cohort).onConflictDoNothing();
    }

    // 2. Create assessment types
    console.log('📝 Creating assessment types...');
    const assessmentTypesToCreate = [
      {
        name: 'TAM (Total Active Motion)',
        description: 'Comprehensive finger flexion and extension measurement',
        instructions: 'Make a complete fist, then fully extend all fingers. Repeat slowly and deliberately.',
        videoUrl: '/videos/ClawLFistLeft_1754062432000.mp4',
        duration: 10,
        repetitions: 1,
        isActive: true,
        orderIndex: 1
      },
      {
        name: 'Kapandji Test',
        description: 'Thumb opposition and mobility assessment',
        instructions: 'Touch your thumb to different parts of your fingers and palm as demonstrated.',
        videoUrl: '/videos/KapandjiLeft_1754062432000.mp4',
        duration: 15,
        repetitions: 1,
        isActive: true,
        orderIndex: 2
      },
      {
        name: 'Wrist Flexion/Extension',
        description: 'Wrist flexion and extension range of motion measurement',
        instructions: 'Slowly bend your wrist up and down through the full range of motion.',
        videoUrl: '/videos/WristFlexionExtensionLeft_1754062432000.mp4',
        duration: 8,
        repetitions: 2,
        isActive: true,
        orderIndex: 3
      },
      {
        name: 'Wrist Radial/Ulnar Deviation',
        description: 'Wrist side-to-side movement assessment',
        instructions: 'Move your wrist from side to side through the full range of motion.',
        videoUrl: '/videos/WristRadialUlnarDeviationLeft_1754062432000.mp4',
        duration: 8,
        repetitions: 2,
        isActive: true,
        orderIndex: 4
      },
      {
        name: 'Forearm Pronation/Supination',
        description: 'Forearm rotation assessment',
        instructions: 'Rotate your forearm to turn your palm up and down.',
        videoUrl: '/videos/ForearmPronationSupinationLeft_1754062432000.mp4',
        duration: 8,
        repetitions: 2,
        isActive: true,
        orderIndex: 5
      }
    ];

    for (const assessmentType of assessmentTypesToCreate) {
      await db.insert(schema.assessmentTypes).values(assessmentType).onConflictDoNothing();
    }

    // 3. Create default admin users
    console.log('📝 Creating admin users...');
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'WakeExer2025!Secure';
    const hashedAdminPassword = await PasswordManager.hash(adminPassword);

    const adminUsersToCreate = [
      {
        username: 'admin',
        passwordHash: hashedAdminPassword,
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@wakeexer.com',
        firstName: 'System',
        lastName: 'Administrator',
        isActive: true
      }
    ];

    for (const adminUser of adminUsersToCreate) {
      await db.insert(schema.adminUsers).values(adminUser).onConflictDoNothing();
    }

    // 4. Create default clinical users
    console.log('📝 Creating clinical users...');
    const clinicalPassword = await PasswordManager.hash('admin123'); // Default dev password
    
    const clinicalUsersToCreate = [
      {
        username: 'admin',
        passwordHash: clinicalPassword,
        email: 'clinical.admin@wakeexer.com',
        firstName: 'Clinical',
        lastName: 'Administrator',
        role: 'admin',
        isActive: true
      },
      {
        username: 'dr.smith',
        passwordHash: await PasswordManager.hash('password123'),
        email: 'dr.smith@clinic.com',
        firstName: 'Dr. Jane',
        lastName: 'Smith',
        role: 'clinician',
        isActive: true
      },
      {
        username: 'researcher1',
        passwordHash: await PasswordManager.hash('research123'),
        email: 'researcher1@research.org',
        firstName: 'Research',
        lastName: 'Coordinator',
        role: 'researcher',
        isActive: true
      }
    ];

    for (const clinicalUser of clinicalUsersToCreate) {
      await db.insert(schema.clinicalUsers).values(clinicalUser).onConflictDoNothing();
    }

    console.log('✅ Database initialization completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Cohorts: ${cohortsToCreate.length} created`);
    console.log(`   - Assessment Types: ${assessmentTypesToCreate.length} created`);
    console.log(`   - Admin Users: ${adminUsersToCreate.length} created`);
    console.log(`   - Clinical Users: ${clinicalUsersToCreate.length} created`);
    console.log('\n🔑 Default Credentials:');
    console.log(`   Admin Portal: admin / ${adminPassword}`);
    console.log(`   Clinical Dashboard: admin / admin123`);

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run initialization
initializeDatabase();
