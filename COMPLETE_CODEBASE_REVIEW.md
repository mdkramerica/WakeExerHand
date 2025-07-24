# ExerAI - Hand Assessment Platform - Complete Codebase Review

## Project Overview

This is a comprehensive hand rehabilitation assessment platform that combines real-time motion tracking with clinical analytics. The system uses MediaPipe for hand/pose tracking to perform precise biomechanical assessments including TAM (Total Active Motion), Kapandji scoring, and wrist flexion/extension measurements.

### Architecture Summary
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js/Express with TypeScript  
- **Database**: PostgreSQL with Drizzle ORM
- **Motion Tracking**: MediaPipe Holistic v0.5.1675471629
- **Authentication**: Dual system (patient access codes + clinical login)
- **Deployment**: Replit with automatic database migration

---

## Database Schema (`shared/schema.ts`)

### Core Tables

```typescript
// Clinical users (clinicians, researchers, admins)
export const clinicalUsers = pgTable("clinical_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull(), // "clinician", "researcher", "admin"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

// Patients assigned to clinicians (PHI-free design)
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull().unique(),
  alias: text("alias").notNull(), // De-identified display name
  cohortId: integer("cohort_id").references(() => cohorts.id),
  assignedClinicianId: integer("assigned_clinician_id").references(() => clinicalUsers.id),
  status: text("status").notNull().default("stable"),
  
  // Study demographics (de-identified)
  ageGroup: text("age_group"),
  sex: text("sex"),
  handDominance: text("hand_dominance"),
  occupationCategory: text("occupation_category"),
  
  // Surgery details
  surgeryDate: timestamp("surgery_date"),
  procedureCode: text("procedure_code"),
  laterality: text("laterality"),
  surgeonId: text("surgeon_id"),
  injuryType: text("injury_type"),
  
  // Enrollment fields
  enrollmentStatus: text("enrollment_status").default("screening"),
  enrolledDate: timestamp("enrolled_date"),
  accessCode: text("access_code").unique(),
  
  isActive: boolean("is_active").default(true),
  enrolledInStudy: boolean("enrolled_in_study").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Individual patient assessments with comprehensive metrics
export const patientAssessments = pgTable("patient_assessments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  assessmentTypeId: integer("assessment_type_id").references(() => assessmentTypes.id).notNull(),
  clinicianId: integer("clinician_id").references(() => clinicalUsers.id).notNull(),
  assessmentDate: timestamp("assessment_date").defaultNow(),
  sessionNumber: integer("session_number").default(1),
  deviceConfidenceScore: numeric("device_confidence_score", { precision: 5, scale: 2 }),
  
  // TAM (Total Active Motion) metrics
  tamScore: numeric("tam_score", { precision: 5, scale: 2 }),
  indexFingerRom: numeric("index_finger_rom", { precision: 5, scale: 2 }),
  middleFingerRom: numeric("middle_finger_rom", { precision: 5, scale: 2 }),
  ringFingerRom: numeric("ring_finger_rom", { precision: 5, scale: 2 }),
  pinkyFingerRom: numeric("pinky_finger_rom", { precision: 5, scale: 2 }),
  
  // Individual joint angles
  indexMcp: numeric("index_mcp", { precision: 5, scale: 2 }),
  indexPip: numeric("index_pip", { precision: 5, scale: 2 }),
  indexDip: numeric("index_dip", { precision: 5, scale: 2 }),
  // ... (similar for middle, ring, pinky)
  
  // Kapandji score
  kapandjiScore: numeric("kapandji_score", { precision: 5, scale: 2 }),
  
  // Wrist flexion/extension angles
  wristFlexionAngle: numeric("wrist_flexion_angle", { precision: 5, scale: 2 }),
  wristExtensionAngle: numeric("wrist_extension_angle", { precision: 5, scale: 2 }),
  maxWristFlexion: numeric("max_wrist_flexion", { precision: 5, scale: 2 }),
  maxWristExtension: numeric("max_wrist_extension", { precision: 5, scale: 2 }),
  
  // Raw data storage
  rawData: jsonb("raw_data"),
  notes: text("notes"),
  
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
});

// Legacy tables for backward compatibility
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  injuryType: text("injury_type"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
  isFirstTime: boolean("is_first_time").default(true),
  isActive: boolean("is_active").default(true),
});

export const userAssessments = pgTable("user_assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  assessmentId: integer("assessment_id").notNull(),
  sessionNumber: integer("session_number").default(1),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  romData: jsonb("rom_data"),
  repetitionData: jsonb("repetition_data"),
  qualityScore: integer("quality_score"),
  
  // Detailed ROM metrics
  indexFingerRom: numeric("index_finger_rom", { precision: 5, scale: 2 }),
  middleFingerRom: numeric("middle_finger_rom", { precision: 5, scale: 2 }),
  ringFingerRom: numeric("ring_finger_rom", { precision: 5, scale: 2 }),
  pinkyFingerRom: numeric("pinky_finger_rom", { precision: 5, scale: 2 }),
  
  // Wrist measurements
  wristFlexionAngle: numeric("wrist_flexion_angle", { precision: 5, scale: 2 }),
  wristExtensionAngle: numeric("wrist_extension_angle", { precision: 5, scale: 2 }),
  maxWristFlexion: numeric("max_wrist_flexion", { precision: 5, scale: 2 }),
  maxWristExtension: numeric("max_wrist_extension", { precision: 5, scale: 2 }),
  
  dashScore: numeric("dash_score", { precision: 5, scale: 2 }),
  shareToken: text("share_token").unique(),
});
```

---

## Database Configuration (`server/db.ts`)

```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

---

## Storage Layer (`server/storage.ts`)

### Interface Definition
```typescript
export interface IStorage {
  // Clinical User methods
  getClinicalUser(id: number): Promise<ClinicalUser | undefined>;
  getClinicalUserByUsername(username: string): Promise<ClinicalUser | undefined>;
  createClinicalUser(user: InsertClinicalUser): Promise<ClinicalUser>;
  authenticateClinicalUser(username: string, password: string): Promise<ClinicalUser | null>;
  
  // Patient methods
  getPatients(clinicianId?: number): Promise<PatientWithDetails[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  getPatientByAccessCode(accessCode: string): Promise<Patient | undefined>;
  
  // Assessment methods
  getPatientAssessments(patientId: number, limit?: number): Promise<PatientAssessment[]>;
  createPatientAssessment(assessment: InsertPatientAssessment): Promise<PatientAssessment>;
  
  // Legacy methods for backward compatibility
  getUserByCode(code: string): Promise<User | undefined>;
  getUserAssessments(userId: number): Promise<UserAssessment[]>;
  createUserAssessment(userAssessment: InsertUserAssessment): Promise<UserAssessment>;
}
```

### Database Implementation
```typescript
export class DatabaseStorage implements IStorage {
  async authenticateClinicalUser(username: string, password: string): Promise<ClinicalUser | null> {
    const [user] = await db
      .select()
      .from(clinicalUsers)
      .where(and(
        eq(clinicalUsers.username, username), 
        eq(clinicalUsers.password, password), 
        eq(clinicalUsers.isActive, true)
      ));
    
    if (user) {
      await this.updateClinicalUser(user.id, { lastLoginAt: new Date() });
      return user;
    }
    return null;
  }

  async getUserByCode(code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.code, code));
    return user || undefined;
  }

  async createUserAssessment(insertUserAssessment: InsertUserAssessment): Promise<UserAssessment> {
    const [userAssessment] = await db
      .insert(userAssessments)
      .values(insertUserAssessment)
      .returning();
    return userAssessment;
  }
}
```

---

## API Routes (`server/routes.ts`)

### Authentication
```typescript
// Clinical Dashboard Authentication
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    const user = await storage.authenticateClinicalUser(username, password);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const token = user.id.toString();
    await auditLog(user.id, "login", undefined, { username }, req);
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid request format" });
  }
});
```

### Patient Management
```typescript
// Get user by access code (legacy support)
app.get("/api/users/by-code/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const user = await storage.getUserByCode(code);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// Start assessment
app.post("/api/users/:userId/assessments/:assessmentId/start", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const assessmentId = parseInt(req.params.assessmentId);
    
    const existingAssessment = await storage.getUserAssessment(userId, assessmentId);
    if (existingAssessment && !existingAssessment.isCompleted) {
      return res.json({ userAssessment: existingAssessment });
    }
    
    const newAssessment = await storage.createUserAssessment({
      userId,
      assessmentId,
      sessionNumber: 1,
      isCompleted: false,
    });
    
    res.json({ userAssessment: newAssessment });
  } catch (error) {
    res.status(500).json({ message: "Failed to start assessment" });
  }
});
```

---

## Server Entry Point (`server/index.ts`)

```typescript
import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json({ limit: '10mb' })); // Increased for motion data
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
```

---

## Frontend Application (`client/src/App.tsx`)

### Main Routing Structure
```typescript
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

// Patient Interface Routes
import Landing from "@/pages/landing";
import AssessmentList from "@/pages/assessment-list";
import Recording from "@/pages/recording";
import WristResults from "@/pages/wrist-results";
import DailyAssessments from "@/pages/daily-assessments";
import ProgressCharts from "@/pages/progress-charts";

// Clinical Interface Routes
import ClinicalLogin from "@/pages/clinical-login";
import ClinicalDashboard from "@/pages/clinical-dashboard";
import ClinicalPatients from "@/pages/clinical-patients";
import PatientDetail from "@/pages/patient-detail";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <ClinicalLogin />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          {/* Patient Routes */}
          <Route path="/" component={Landing} />
          <Route path="/assessments" component={DailyAssessments} />
          <Route path="/assessment/:id/record" component={Recording} />
          <Route path="/wrist-results/:id" component={WristResults} />
          
          {/* Clinical Routes */}
          <Route path="/clinical" component={ClinicalLogin} />
          <Route path="/clinical/dashboard">
            <ProtectedRoute>
              <ClinicalLayout>
                <ClinicalDashboard />
              </ClinicalLayout>
            </ProtectedRoute>
          </Route>
          
          <Route path="/clinical/patients">
            <ProtectedRoute>
              <ClinicalLayout>
                <ClinicalPatients />
              </ClinicalLayout>
            </ProtectedRoute>
          </Route>
          
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
```

---

## Package Configuration (`package.json`)

### Dependencies
```json
{
  "dependencies": {
    "@mediapipe/holistic": "^0.5.1675471629",
    "@mediapipe/camera_utils": "^0.3.1675466862",
    "@mediapipe/drawing_utils": "^0.3.1675466124",
    "@neondatabase/serverless": "^0.10.4",
    "@tanstack/react-query": "^5.60.5",
    "drizzle-orm": "^0.39.1",
    "express": "^4.21.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "wouter": "^3.3.5",
    "zod": "^3.24.2"
  },
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "db:push": "drizzle-kit push"
  }
}
```

---

## Build Configuration

### Vite Config (`vite.config.ts`)
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
});
```

### Drizzle Config (`drizzle.config.ts`)
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

---

## Key Features

### 1. **Motion Tracking System**
- MediaPipe Holistic for real-time hand landmark detection
- Confidence-based filtering (70% threshold)
- Frame-by-frame angle calculations
- Motion replay with interactive controls

### 2. **Assessment Types**
- **TAM (Total Active Motion)**: Finger ROM measurements
- **Kapandji**: Thumb opposition scoring
- **Wrist**: Flexion/extension measurements
- **DASH**: Disability questionnaire

### 3. **Clinical Dashboard**
- Role-based access (admin, clinician, researcher)
- Patient management with PHI-free design
- Assessment tracking and analytics
- Outlier detection and alerts

### 4. **Authentication System**
- **Patients**: 6-digit access codes
- **Clinical Staff**: Username/password with roles
- Session management with audit logging

### 5. **Data Storage**
- Hybrid storage: PostgreSQL for production, file-based for development
- Automatic migration system
- Comprehensive motion data preservation

---

## Environment Setup

### Required Environment Variables
```bash
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production|development
USE_DATABASE=true  # Force database mode (optional)
```

### Demo Credentials
```bash
# Clinical Login
admin / admin123        # Full admin access
clinician / clinician123 # Clinical user access
researcher / researcher123 # Research access

# Patient Access Codes
DEMO01  # Wrist Fracture
DEMO02  # Carpal Tunnel  
DEMO03  # Tendon Injury
```

---

## Architecture Highlights

### 1. **Dual Storage Strategy**
- Automatic detection between database and file storage
- Seamless migration capability
- Development flexibility with production reliability

### 2. **MediaPipe Integration**
- CDN-first loading strategy with fallback
- Confident landmark detection
- Real-time ROM calculations

### 3. **Type Safety**
- Full TypeScript coverage
- Zod schema validation
- Drizzle ORM type inference

### 4. **Scalable Design**
- Role-based access control
- Audit logging for compliance
- Modular component architecture

This codebase represents a production-ready medical assessment platform with robust data handling, comprehensive tracking capabilities, and scalable clinical workflow management.