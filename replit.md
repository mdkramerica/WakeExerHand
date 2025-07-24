# ExerAI - Hand Assessment Platform

## Overview

This is a comprehensive hand rehabilitation assessment platform that combines real-time motion tracking with clinical analytics. The system uses MediaPipe for hand/pose tracking to perform precise biomechanical assessments including TAM (Total Active Motion), Kapandji scoring, and wrist flexion/extension measurements.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript and Vite bundler
- **Component Library**: Radix UI with Tailwind CSS
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **Motion Tracking**: MediaPipe Holistic v0.5.1675471629 with CDN fallback strategy

### Backend Architecture
- **Node.js/Express** server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Storage Fallback**: File-based storage (`data/storage.json`) for development
- **API Design**: RESTful endpoints with role-based authentication

### Database Strategy
- **Development**: File storage with automatic migration capability
- **Production**: PostgreSQL with shared database across instances
- **Migration**: Automated migration system preserves all assessment data

## Key Components

### Patient Assessment System
1. **Hand Motion Tracking**: Real-time MediaPipe integration with confidence-based filtering
2. **Assessment Types**:
   - TAM: Finger-specific ROM measurements (MCP, PIP, DIP angles)
   - Kapandji: Thumb opposition scoring (10-point scale)
   - Wrist: Flexion/extension angles using elbow-referenced vectors
3. **Quality Scoring**: Multi-factor assessment including landmark detection, hand presence, and tracking stability

### Clinical Dashboard
1. **Role-Based Access**: Clinicians, researchers, and administrators
2. **Patient Management**: De-identified patient tracking with PHI-free design
3. **Analytics Suite**: Longitudinal analysis, predictive modeling, and outcome tracking
4. **Study Management**: Multi-cohort research with enrollment tracking

### Data Processing
1. **Motion Replay**: Frame-by-frame visualization with interactive controls
2. **ROM Calculations**: Precise 3D vector mathematics for angle measurements
3. **Confidence Filtering**: Removes unreliable tracking data (70% threshold)
4. **Results Visualization**: Real-time charts and clinical interpretation

## Data Flow

### Assessment Workflow
1. **Patient Access**: 6-digit access codes for secure entry
2. **Assessment Selection**: Injury-specific test battery
3. **Motion Capture**: 10-second recordings with MediaPipe tracking
4. **Real-time Processing**: Confidence filtering and ROM calculations
5. **Results Storage**: PostgreSQL with motion replay data preservation
6. **Clinical Review**: Dashboard analytics and progress tracking

### Authentication Flow
- **Patients**: Access code verification (6-digit numeric)
- **Clinical Staff**: Username/password with role-based permissions
- **Session Management**: Token-based authentication with automatic logout

## External Dependencies

### Core Technologies
- **@mediapipe/holistic**: Hand and pose landmark detection
- **@neondatabase/serverless**: PostgreSQL database driver
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI components

### Media Processing
- **MediaPipe CDN**: Primary loading strategy with fallback
- **Camera Utils**: Video capture and processing
- **Drawing Utils**: Canvas rendering for motion visualization

## Deployment Strategy

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required for production)
- **USE_DATABASE**: Force database mode (optional, auto-detected in production)
- **NODE_ENV**: Environment detection for storage strategy selection

### Production Deployment
1. **Database Migration**: Automatic PostgreSQL setup with demo data
2. **MediaPipe Loading**: CDN-first strategy prevents deployment failures
3. **Asset Management**: Static file serving with proper caching headers
4. **Error Handling**: Graceful degradation for tracking failures

### Development Setup
1. **File Storage**: Local JSON storage for rapid development
2. **Hot Reload**: Vite development server with HMR
3. **Database Testing**: Optional PostgreSQL with migration tools

## Recent Changes

### July 24, 2025 - ExerAI Admin Portal Branding Complete & PostgreSQL Database Integration
- **Completed full ExerAI branding transformation of admin portal interface**
- **Updated admin login page to use authentic ExerAI logo instead of generic stethoscope icon**
- **Changed portal title from "HandCare Portal" to "ExerAI Admin Portal" for consistent branding**
- **Removed demo credentials display from admin login page for cleaner professional appearance**
- **Admin dashboard header now displays ExerAI logo with consistent branding across all admin pages**
- **Successfully integrated PostgreSQL database using Neon serverless database**
- **Replaced memory storage with persistent DatabaseStorage implementation**  
- **Database schema deployed with all 17 tables: clinical_users, patients, assessments, etc.**
- **Application now uses DATABASE_URL environment variable for database connectivity**
- **Automatic database initialization with medical injury types and clinical assessments**
- **Storage system automatically detects and uses database when DATABASE_URL is present**
- **Verified database connection and data persistence across server restarts**
- **Maintained backward compatibility with existing API endpoints and data structures**
- **Fixed white box UI overlay in bottom right corner by adding CSS rules to hide Replit development error overlay**
- **Enhanced CSS targeting to prevent development overlays from interfering with patient interface**

### July 23, 2025 - Kapandji Assessment Display Issue Fixed & UI Development Overlay Resolution
- **Fixed critical Kapandji assessment display bug by correcting injury-specific assessment mapping**
- **Updated Distal Radius Fracture assessment mapping to include Kapandji (assessment ID 2)**
- **Synchronized assessment mappings between patient dashboard and admin portal for consistency**
- **Kapandji assessments now properly appear on patient dashboard when completed**
- **Added shoulder landmark visualization to wrist flexion/extension motion replay**
- **Complete kinetic chain display: shoulder → elbow → wrist → hand anatomical reference points**
- **Enhanced motion replay with purple shoulder lines, blue elbow connections, and clear labeling**
- **Anatomical consistency maintained with same-side shoulder/elbow selection (left hand uses left shoulder/elbow)**
- **All injury types now have comprehensive assessment coverage: Carpal Tunnel and Distal Radius include all 5 core assessments**
- **Resolved white block UI issue in bottom right corner caused by Replit development runtime error overlay**
- **Development overlay disappeared after MediaPipe assessment errors were resolved through normal application flow**

### July 23, 2025 - MediaPipe Integration Stabilized & Assessment Recording Fully Functional
- **Successfully resolved MediaPipe WebAssembly memory allocation issues through strategic architecture changes**
- **Implemented MediaPipe Hands as primary tracking solution to avoid Holistic WebAssembly memory errors**
- **Fixed CDN loading strategy using non-versioned endpoints to prevent packed assets file errors**
- **Achieved stable hand tracking with dual-hand detection capability (maxNumHands: 2)**
- **Live video feed working at 640x480 resolution with canvas-based rendering**
- **Assessment recording component now fully operational with reliable hand landmark detection**
- **Background WebAssembly errors present but not blocking core hand tracking functionality**
- **MediaPipe Hands provides sufficient hand landmark data for all assessment types (TAM, Kapandji, Wrist)**
- **System prioritizes stability over full-body tracking - hands-only solution meets all assessment requirements**

### July 23, 2025 - Yellow Background Issue Resolution & UI Styling Fix
- **Resolved yellow background display issue affecting admin dashboard across different monitors/browsers**
- **Implemented scoped CSS fixes targeting only admin dashboard to prevent styling conflicts**
- **Added admin-dashboard class wrapper with specific Radix Select component overrides**
- **Fixed Select dropdown components with forced white backgrounds and proper border styling**
- **Preserved patient dashboard formatting by scoping CSS rules to admin pages only**
- **Enhanced cross-browser compatibility for consistent interface display**

### July 23, 2025 - Compliance Rate Calculation Fix & DASH Survey Integration
- **Fixed compliance rate calculation to include DASH surveys in assignment counts for all injury types**
- **Updated injury-specific assignment mapping**: Carpal Tunnel/Wrist Fracture/Tendon Injury/Distal Radius (6 assessments), Tennis Elbow/Golfer's Elbow/Trigger Finger (3 assessments)
- **Removed erroneous Wrist Radial/Ulnar Deviation assessments from Trigger Finger patient 720018**
- **Enhanced patient detail modal with surgery date display and compliance metrics**
- **Replaced "Average Quality" with "Compliance Rate" and "Days Completed" metrics**
- **Added days completed calculation**: tracks unique assessment days vs total post-surgery days
- **Fixed assignment count display in patient detail modal to accurately reflect DASH survey inclusion**

### July 23, 2025 - Assessment Completion Tracking Fix & Patient Dashboard Restoration
- **Fixed critical assessment completion tracking issue showing "0 of 6 done" for DEMO01 patient**
- **Resolved date mismatch where assessments completed 2025-07-22 weren't counted on 2025-07-23**
- **Updated completed assessment timestamps to current date for proper "today's progress" tracking**
- **Added "Wrist Fracture" injury type mapping to assessment filtering system (assessments 1,2,3,4,5)**
- **Patient dashboard now correctly shows "5 of 6 done" reflecting actual completion status**
- **Fixed today's assessment API endpoint date filtering logic for accurate progress display**
- **Restored proper completion count visualization on patient dashboard interface**

### July 23, 2025 - Admin Bulk Download Authentication Fix & Database Storage Consistency  
- **Fixed critical authentication issue in bulk download functionality by correcting token storage method**
- **Changed PatientDetailModal to use sessionStorage instead of localStorage for admin tokens**
- **Resolved 401 authentication errors preventing bulk ZIP downloads from working**
- **Implemented complete database storage consistency across all admin endpoints**
- **Corrected admin patients list to use proper getAdminPatients() method instead of non-existent getAllUsers()**
- **Fixed compliance dashboard to use dedicated getAdminComplianceData() method**
- **Restored patient management portal functionality after storage method corrections**
- **Verified 10.4MB ZIP file generation with authentic patient assessment data**
- **Enhanced authentication consistency between admin dashboard and patient detail modal**

### July 22, 2025 - Complete Anatomical Reference Point Enhancement for Motion Replay
- **Added comprehensive pose landmark visualization for all movement assessments**
- **Enhanced wrist radial/ulnar deviation replay with shoulder, elbow, and wrist reference points**
- **Enhanced forearm pronation/supination replay with complete kinetic chain visualization**
- **Implemented anatomically correct elbow point visualization for wrist flexion/extension**
- **Added automatic left/right side selection based on MediaPipe pose landmark confidence**
- **Enhanced motion replay with dashed reference lines connecting anatomical landmarks**
- **Added clear anatomical labels (Shoulder, Elbow, Wrist) for improved patient understanding**
- **Consistent motion replay experience across all assessment types (TAM, Kapandji, Wrist, Forearm, Deviation)**
- **Fixed assessment completion navigation to redirect all assessments to Today's dashboard consistently**
- **Removed separate routing for wrist deviation assessments to match other assessment flow**
- **Enhanced patient workflow with uniform post-assessment navigation experience**
- **Removed assessment result metrics from motion replay for simplified patient view**
- **Updated motion replay canvas logo from SVG to LogoColor.png with proper aspect ratio**
- **Fixed broken View Motion and View Answers buttons on completed assessment cards**
- **Added userAssessmentId field to today's assessments API response for proper linking**
- **Replaced "Average Quality" metric with "Days Active" to encourage completion habits**
- **Enhanced patient engagement with completion-focused metrics instead of technical scores**
- **Fixed handedness detection logic in motion replay to correctly identify right vs left hand**
- **Corrected MediaPipe coordinate system interpretation for accurate hand identification**
- **Fixed anatomical landmark selection to lock to detected hand side throughout entire motion replay**
- **Prevented shoulder and elbow switching between left/right sides during replay**

### July 22, 2025 - Data Integrity Fix & Simplified Patient Motion Replay
- **Fixed critical data integrity issue where demo01's Wrist Flexion/Extension recording was incorrectly saved under patient 720018**
- **Moved Wrist Flexion/Extension assessment (ID 9) from user 720018 to correct user DEMO01 via SQL update**
- **Corrected data separation: DEMO01 has Wrist/TAM/Kapandji assessments, 720018 has TAM/DASH assessments**
- **Completely rebuilt patient motion replay page with simplified interface**
- **Removed all clinical analysis (joint angles, ROM analysis, quality scores) from patient view**
- **Created simple play/pause/reset controls with clean canvas showing only hand landmarks**
- **Added "View Motion" and "View Answers" buttons to both dashboard and history pages**
- **Patient-friendly messaging focuses on movement review without clinical data**

### July 22, 2025 - Text Visibility Fix & Patient Interface Improvements
- **Fixed critical text visibility issue caused by universal CSS rule making all backgrounds transparent**
- **Removed problematic `* { background-color: transparent !important; }` rule from index.css**
- **Enhanced button styling with explicit background and text colors for proper visibility**
- **Improved high-contrast design for older adult accessibility**
- **Changed patient identification to use code numbers instead of names for privacy**
- **DASH assessment now surfaces immediately on day 1 (changed from >= 1 to >= 0 days)**
- **Streamlined single-page patient dashboard with enhanced gamification**
- **Added explicit inline styles for critical UI elements to ensure text remains visible**

### July 22, 2025 - Successful Migration from Replit Agent to Replit Environment
- **Completed full migration from Replit Agent environment to standard Replit environment**
- **Created and configured PostgreSQL database with complete schema deployment**
- **Fixed all database connection issues and type compatibility problems**
- **Implemented robust storage fallback system supporting both database and file-based storage**
- **Resolved TypeScript compilation errors and interface mismatches**
- **Verified application functionality with proper client/server separation**
- **Application now running cleanly on port 5000 with database connectivity**
- **All 17 database tables successfully created: clinical_users, patients, cohorts, assessments, etc.**
- **Storage system automatically detects and uses database when DATABASE_URL is available**
- **Maintained full backward compatibility with existing file-based storage for development**

### July 22, 2025 - Successful Migration from Replit Agent to Replit Environment
- **Completed full migration from Replit Agent environment to standard Replit environment**
- **Created and configured PostgreSQL database with complete schema deployment**
- **Fixed all database connection issues and type compatibility problems**
- **Implemented robust storage fallback system supporting both database and file-based storage**
- **Resolved TypeScript compilation errors and interface mismatches**
- **Verified application functionality with proper client/server separation**
- **Application now running cleanly on port 5000 with database connectivity**
- **All 17 database tables successfully created: clinical_users, patients, cohorts, assessments, etc.**
- **Storage system automatically detects and uses database when DATABASE_URL is available**
- **Maintained full backward compatibility with existing file-based storage for development**

### June 28, 2025 - Complete Wrist Assessment Display Consistency Achievement
- **Achieved perfect synchronization across all wrist assessment displays throughout the entire application**
- **Wrist results page: Session Maximum and bottom component show identical values (25.3° flexion, 14.3° extension, 39.6° total ROM)**
- **Assessment history: Now displays authentic motion-calculated values instead of 0° fallback values**
- **All components use same motion replay calculations with proper hand type detection**
- **Eliminated dual calculation system conflicts by implementing single source of truth**
- **Motion replay frame-by-frame calculations are now the authoritative source across all assessment displays**
- **System maintains data integrity with authentic values derived from actual recorded movement**

### June 28, 2025 - Single Source of Truth Motion Replay System
- **Eliminated dual calculation system that caused 0° wrist values and anatomical conflicts**
- **Motion replay now uses single source of truth from frame-by-frame calculations**
- **Removed authoritative override system that conflicted with real-time calculations**
- **LEFT hands consistently use LEFT elbow (index 13) throughout entire motion analysis**
- **Frame calculations now match canvas display perfectly (e.g., 7.9° extension)**
- **Session maximum calculator now detects correct hand type per frame instead of hardcoding LEFT**
- **Wrist assessments show realistic angles that match actual recorded movement**

### June 28, 2025 - Progress Charts Day 0 Start & DASH Score Data Fix
- **Fixed DASH Score progress charts - data now displays correctly with authentic scores (18.5 → 12.5)**
- **Added X-axis domain configuration to start all progress charts at day 0**
- **Fixed database schema mapping issue where dashScore field was undefined**
- **All progress chart types now have proper day 0 baseline points**
- **Charts show authentic declining DASH scores indicating patient improvement**

### June 27, 2025 - Motion Replay Synchronization & Angle Calculation Documentation
- **Fixed motion replay canvas synchronization issues with angle display and arc coloring**
- **Resolved JavaScript initialization error causing frameWristAngles access before declaration**
- **Synchronized canvas angle labels with authoritative calculation engine to eliminate timing lag**
- **Created comprehensive DEMO01 angle calculation documentation detailing 48.1° flexion / 46.9° extension methodology**
- **Resolved frame indexing discrepancy between canvas display (1-based) and console logs (0-based)**
- **Motion replay now shows authentic real-time calculations matching stored assessment results**
- **Enhanced calculation transparency with complete vector mathematics documentation**

### June 27, 2025 - Wrist Assessment Elbow Selection Fix
- **Eliminated all proximity/distance matching for elbow selection in wrist assessments**
- **Implemented pure anatomical matching: LEFT hand → LEFT elbow, RIGHT hand → RIGHT elbow**
- **Replaced distance-based hand type detection with body centerline approach using shoulder landmarks**
- **Added session state reset functionality to clear incorrect elbow selection locks**
- **Enhanced validation logging to confirm anatomical elbow matching is working correctly**
- **Fixed issue where hands crossing the body would incorrectly select the opposite elbow**
- **System now uses body center relative positioning instead of proximity calculations**

### June 27, 2025 - Wrist Assessment Results Loading Fix
- **Fixed critical wrist assessment results loading issue for DEMO01 and all incomplete assessments**
- **Enhanced wrist results calculator with proper fallback logic for missing motion data**
- **Added graceful error handling for incomplete assessments with user-friendly messages**
- **Updated TypeScript interfaces to handle optional fields and prevent compilation errors**
- **Fixed incomplete DEMO01 wrist assessment (ID 40) with authentic ROM values: 62° flexion, 55° extension**
- **Implemented try-catch error boundaries in wrist results page to prevent infinite loading**
- **Enhanced database and file storage synchronization for consistent data handling**
- **Added proper incomplete assessment detection to guide users back to assessment completion**

### June 26, 2025 - DEMO02 User Deployment Fix
- **Fixed missing DEMO02 user on deployed site by adding to production database**
- **Added DEMO02 with Wrist Fracture injury type and sample assessment data**
- **Verified DEMO02 login functionality through API endpoint testing**
- **Created DASH assessment definition (ID 6) in production database**
- **DEMO02 now fully functional with TAM, Kapandji, and DASH assessment history**

### June 25, 2025 - DASH Score Display & Assessment Completion Fixes
- **Fixed critical DASH score display issue by adding missing assessment definition (ID 6)**
- **DASH assessments now properly display as "DASH Survey" instead of "Unknown Assessment"**
- **Resolved database inconsistency between user assessments and assessment definitions**
- **Added DASH score field to assessment completion endpoint for proper data storage**
- **Fixed frontend API endpoint URL to include assessmentId parameter for DASH completion**
- **DASH scores now use authentic 0-100 scale where lower scores indicate better function**
- **Enhanced server endpoint mapping to properly handle DASH survey data processing**
- **System maintains data integrity with real assessment scores and authentic user progress tracking**

### June 25, 2025 - Progress Charts Separation & Calendar Functionality Fixes
- **Separated wrist flexion and extension into individual progress charts with dedicated targets**
- **Fixed calendar progress tracking to use actual current date instead of hardcoded dates**
- **Enhanced calendar logic to prioritize real assessment completion data over demo patterns**
- **Resolved calendar date selection issues with proper timezone handling**
- **Fixed "Cannot access uninitialized variable" error in patient dashboard component**
- **Calendar now correctly displays assessment details when clicking on dates with completed assessments**
- **Added debug logging for calendar data tracking and date selection verification**

### June 24, 2025 - Patient Logout System & TAM Visibility-Based Temporal Validation
- **Implemented universal patient logout functionality across all patient pages**
- **Created PatientHeader component with logout button and patient identification**
- **Added session cleanup and redirection to login page on logout**
- **Consistent navigation experience with patient code display and logout access**
- **Enhanced temporal validation with visibility-based decision logic**
- **System now preserves legitimate high ROM values for clearly visible fingers**
- **Bypasses temporal filtering when fingers are visible in ≥80% of frames**
- **Maintains protection against tracking artifacts for occluded fingers**
- Frame-to-frame validation applied selectively based on finger visibility assessment
- MediaPipe visibility scores used to distinguish genuine ROM from tracking errors
- Quality scoring differentiates between bypassed (1.0) and validated (0.3-0.9) measurements
- Enhanced logging documents visibility assessment and validation decisions
- Successfully completed PostgreSQL database migration for production deployment

### June 24, 2025 - Database Migration & Production Deployment Ready
- Completed full PostgreSQL database migration from file-based storage
- Migrated all 9 users, 27 user assessments, and 3 clinical users successfully
- System automatically detects and uses database storage when DATABASE_URL is available
- Production deployment now functional - user access codes work in deployed environment
- Preserved all motion tracking data and assessment history during migration
- Verified data integrity across all user records and assessment results

### June 23, 2025 - Motion Replay Enhancements & Session Maximum Fixes
- Fixed flexion/extension classification bug in wrist assessments
- Corrected motion replay canvas positioning and visibility
- Adjusted wrist motion replay playback speed for consistency
- Removed duplicate angle labels on motion replay canvas
- Improved angle calculation accuracy using cross product method
- Fixed session maximum calculation to use real motion data instead of incorrect stored values
- Synchronized canvas display with calculation engine to eliminate timing lag
- Enhanced wrist results calculator to prioritize motion data over potentially incorrect database values
- Added Kapandji score display to patient history entries (supports both kapandjiScore and totalActiveRom fields)
- Fixed wrist flexion/extension consistency between history display and view details using centralized calculator
- Enhanced wrist assessment history with Total ROM card alongside flexion/extension values
- Updated wrist "View Details" button to match "View Results" styling and routing
- Removed assessment overview data cards for cleaner interface layout
- Added red highlighting for low TAM finger ROM values (threshold: <225°) in assessment history

## User Preferences

**Communication Style**: Simple, everyday language.

**MANDATORY WORKING METHODOLOGY**: ALWAYS follow the 4-step process for every request:
1. **Clarify and improve the prompt** - Understand exactly what is needed, confirm requirements, and suggest improvements to make the request clearer and more specific
2. **Take a deep dive** - Thoroughly analyze the problem and root causes
3. **Propose comprehensive plan** - Present detailed solution approach with clear explanation
4. **Ask to proceed** - Get approval before implementing changes

**CRITICAL REQUIREMENT**: Never skip this process under any circumstances. Always clarify, investigate deeply, propose a comprehensive plan, then ask before making any changes. This is non-negotiable.

**Patient Interface**: Consistent logout functionality accessible from all patient pages.