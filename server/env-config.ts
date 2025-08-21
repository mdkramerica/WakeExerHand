import { z } from 'zod';

// Environment variable validation schema
const envSchema = z.object({
  // Application settings
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('5000'),
  HOST: z.string().default('0.0.0.0'),
  
  // Database configuration
  DATABASE_URL: z.string().url().optional(),
  USE_DATABASE: z.string().transform(val => val === 'true').default('false'),
  
  // Security settings
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters'),
  
  // Admin credentials (for initial setup only)
  DEFAULT_ADMIN_USERNAME: z.string().min(3).default('admin'),
  DEFAULT_ADMIN_PASSWORD: z.string().min(8).default('admin123'),
  DEFAULT_ADMIN_EMAIL: z.string().email().default('admin@wakeexer.local'),
  
  // CORS settings
  ALLOWED_ORIGINS: z.string().optional(),
  FRONTEND_URL: z.string().url().optional(),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).transform(Number).default('100'),
  RATE_LIMIT_AUTH_MAX: z.string().regex(/^\d+$/).transform(Number).default('5'),
  
  // File uploads
  MAX_UPLOAD_SIZE: z.string().regex(/^\d+$/).transform(Number).default('10485760'), // 10MB
  UPLOAD_DIR: z.string().default('./uploads'),
  
  // External services
  MEDIAPIPE_CDN_URL: z.string().url().default('https://cdn.jsdelivr.net/npm/@mediapipe/'),
  
  // Email configuration (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  
  // Railway deployment (automatically set by Railway)
  RAILWAY_ENVIRONMENT: z.string().optional(),
  RAILWAY_PROJECT_ID: z.string().optional(),
  RAILWAY_SERVICE_ID: z.string().optional(),
  RAILWAY_DEPLOYMENT_ID: z.string().optional(),
  
  // Railway database (automatically set by Railway)
  PGHOST: z.string().optional(),
  PGPORT: z.string().regex(/^\d+$/).transform(Number).optional(),
  PGDATABASE: z.string().optional(),
  PGUSER: z.string().optional(),
  PGPASSWORD: z.string().optional(),
  
  // Monitoring
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  SENTRY_DSN: z.string().url().optional(),
  
  // Feature flags
  ENABLE_REGISTRATION: z.string().transform(val => val === 'true').default('false'),
  ENABLE_EMAIL_NOTIFICATIONS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_AUDIT_LOGGING: z.string().transform(val => val === 'true').default('true'),
  ENABLE_DATA_EXPORT: z.string().transform(val => val === 'true').default('true'),
  ENABLE_COMPLIANCE_PORTAL: z.string().transform(val => val === 'true').default('false'),
  
  // Development flags
  DEV_BYPASS_AUTH: z.string().transform(val => val === 'true').default('false'),
  DEV_MOCK_MEDIAPIPE: z.string().transform(val => val === 'true').default('false'),
  DEV_LOG_SQL: z.string().transform(val => val === 'true').default('false'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedConfig: EnvConfig | null = null;

/**
 * Load and validate environment configuration
 */
export function loadEnvConfig(): EnvConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    // Build Railway database URL from individual components if available
    if (process.env.PGHOST && !process.env.DATABASE_URL) {
      const pgHost = process.env.PGHOST;
      const pgPort = process.env.PGPORT || '5432';
      const pgDatabase = process.env.PGDATABASE;
      const pgUser = process.env.PGUSER;
      const pgPassword = process.env.PGPASSWORD;
      
      if (pgDatabase && pgUser && pgPassword) {
        process.env.DATABASE_URL = `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}`;
        console.log('✅ Built DATABASE_URL from Railway environment variables');
      }
    }

    cachedConfig = envSchema.parse(process.env);
    
    // Validation warnings
    if (cachedConfig.NODE_ENV === 'production') {
      if (cachedConfig.SESSION_SECRET.includes('change-this') || cachedConfig.SESSION_SECRET.length < 32) {
        console.warn('⚠️  WARNING: Using weak SESSION_SECRET in production!');
      }
      
      if (cachedConfig.DEFAULT_ADMIN_PASSWORD === 'admin123') {
        console.warn('⚠️  WARNING: Using default admin password in production!');
      }
      
      if (!cachedConfig.DATABASE_URL) {
        throw new Error('DATABASE_URL is required in production');
      }
      
      if (!cachedConfig.ALLOWED_ORIGINS) {
        console.warn('⚠️  WARNING: No ALLOWED_ORIGINS set - CORS will be very permissive');
      }
    }
    
    // Development warnings
    if (cachedConfig.NODE_ENV === 'development') {
      if (cachedConfig.DEV_BYPASS_AUTH) {
        console.warn('🔓 Development mode: Authentication bypass enabled');
      }
      
      if (cachedConfig.DEV_MOCK_MEDIAPIPE) {
        console.warn('🎭 Development mode: MediaPipe mocking enabled');
      }
    }
    
    console.log(`✅ Environment configuration loaded (${cachedConfig.NODE_ENV})`);
    return cachedConfig;
    
  } catch (error) {
    console.error('❌ Environment configuration validation failed:');
    
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('  -', error);
    }
    
    console.error('\n💡 Please check your environment variables against .env.example');
    process.exit(1);
  }
}

/**
 * Get the current environment configuration
 */
export function getEnvConfig(): EnvConfig {
  if (!cachedConfig) {
    return loadEnvConfig();
  }
  return cachedConfig;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnvConfig().NODE_ENV === 'production';
}

/**
 * Check if running on Railway
 */
export function isRailway(): boolean {
  const config = getEnvConfig();
  return !!(config.RAILWAY_ENVIRONMENT || config.RAILWAY_PROJECT_ID);
}

/**
 * Get database configuration
 */
export function getDatabaseConfig() {
  const config = getEnvConfig();
  
  return {
    url: config.DATABASE_URL,
    useDatabase: config.USE_DATABASE || isProduction(),
    host: config.PGHOST,
    port: config.PGPORT,
    database: config.PGDATABASE,
    user: config.PGUSER,
    password: config.PGPASSWORD,
  };
}

/**
 * Get security configuration
 */
export function getSecurityConfig() {
  const config = getEnvConfig();
  
  return {
    sessionSecret: config.SESSION_SECRET,
    defaultAdmin: {
      username: config.DEFAULT_ADMIN_USERNAME,
      password: config.DEFAULT_ADMIN_PASSWORD,
      email: config.DEFAULT_ADMIN_EMAIL,
    },
    cors: {
      allowedOrigins: config.ALLOWED_ORIGINS?.split(',').map(s => s.trim()) || [],
      frontendUrl: config.FRONTEND_URL,
    },
    rateLimit: {
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
      authMax: config.RATE_LIMIT_AUTH_MAX,
    },
  };
}

/**
 * Get feature flags
 */
export function getFeatureFlags() {
  const config = getEnvConfig();
  
  return {
    registration: config.ENABLE_REGISTRATION,
    emailNotifications: config.ENABLE_EMAIL_NOTIFICATIONS,
    auditLogging: config.ENABLE_AUDIT_LOGGING,
    dataExport: config.ENABLE_DATA_EXPORT,
    compliancePortal: config.ENABLE_COMPLIANCE_PORTAL,
    // Development flags
    bypassAuth: config.DEV_BYPASS_AUTH,
    mockMediaPipe: config.DEV_MOCK_MEDIAPIPE,
    logSQL: config.DEV_LOG_SQL,
  };
}
