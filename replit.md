# ExerAI - Hand Assessment Platform

## Overview
ExerAI is a comprehensive hand rehabilitation assessment platform designed to provide precise biomechanical assessments using real-time motion tracking. The platform leverages MediaPipe for hand and pose tracking to perform various clinical assessments including Total Active Motion (TAM), Kapandji scoring, and wrist flexion/extension measurements. Its purpose is to offer clinicians and researchers advanced tools for patient assessment, progress tracking, and data analytics, ultimately aiming to improve rehabilitation outcomes and facilitate research in hand therapy.

## User Preferences
**Communication Style**: Simple, everyday language.

**MANDATORY WORKING METHODOLOGY**: ALWAYS follow the 4-step process for every request:
1. **Clarify and improve the prompt** - Understand exactly what is needed, confirm requirements, and suggest improvements to make the request clearer and more specific
2. **Take a deep dive** - Thoroughly analyze the problem and root causes
3. **Propose comprehensive plan** - Present detailed solution approach with clear explanation
4. **Ask to proceed** - Get approval before implementing changes

**CRITICAL REQUIREMENT**: Never skip this process under any circumstances. Always clarify, investigate deeply, propose a comprehensive plan, then ask before making any changes. This is non-negotiable.

**Patient Interface**: Consistent logout functionality accessible from all patient pages.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **UI/UX**: Radix UI for accessible components, styled with Tailwind CSS for a consistent and modern design. Emphasis on high-contrast design for accessibility.
- **State Management**: TanStack Query for server state, React hooks for local state.
- **Routing**: Wouter for client-side navigation.
- **Motion Tracking**: MediaPipe Holistic (specifically MediaPipe Hands for stability) for real-time hand and pose landmark detection, with a CDN fallback strategy. Video feed is 640x480.
- **Visualizations**: Canvas-based rendering for motion replay with anatomical reference points and clear labeling. Simplified patient view of motion replay without clinical analysis.

### Backend
- **Framework**: Node.js/Express with TypeScript.
- **API Design**: RESTful endpoints with role-based authentication (patients via access code, clinical staff via username/password). Token-based session management.
- **Admin Analytics**: Dedicated endpoints for DASH progress tracking (`/api/admin/dash-progress/:patientCode`) with comprehensive trend analysis and clinical interpretation.

### Database Strategy
- **Production**: PostgreSQL with Drizzle ORM for type-safe database interactions. Utilizes `@neondatabase/serverless` for serverless PostgreSQL connectivity.
- **Development**: File-based storage (`data/storage.json`) for rapid prototyping and local development, with automatic migration capability to PostgreSQL.
- **Data Management**: Automatic database initialization with medical injury types and clinical assessments. Data integrity maintained through consistent storage across endpoints.

### Core Features
- **Patient Assessment System**:
    - Real-time hand motion tracking with confidence-based filtering (70% threshold).
    - Assessment Types: TAM (finger ROM), Kapandji (thumb opposition), Wrist (flexion/extension, radial/ulnar deviation, pronation/supination).
    - Quality Scoring: Multi-factor assessment including landmark detection and tracking stability.
    - Instructional Video Demonstrations: Small looping video player in assessment recording interface to guide proper motion execution.
- **Clinical Dashboard**:
    - Role-based access for clinicians, researchers, administrators.
    - De-identified patient management.
    - Analytics Suite: Longitudinal analysis, predictive modeling, outcome tracking, compliance metrics.
    - DASH Progress Tracking: Integrated longitudinal DASH score visualization with trend analysis, clinical interpretation, and improvement/decline indicators within patient detail modals.
    - Study Management for multi-cohort research.
- **Data Export System**:
    - ZIP-based export functionality with structured file organization.
    - Comprehensive data package including system summary, patient overview, individual patient files, and CSV format.
    - Soft-deletion filtering ensures data integrity in exports.
    - Complete audit logging for compliance and security tracking.
    - Professional compression and organized folder structure for clinical teams.
- **Data Processing**:
    - Motion Replay: Frame-by-frame visualization with interactive controls.
    - ROM Calculations: Precise 3D vector mathematics.
    - Results Visualization: Real-time charts and clinical interpretation.
- **Deployment**: Configurable via environment variables (e.g., `DATABASE_URL`, `NODE_ENV`). CDN-first strategy for MediaPipe.

## External Dependencies
- **@mediapipe/holistic**: Primary for hand and pose landmark detection.
- **@neondatabase/serverless**: PostgreSQL database driver.
- **drizzle-orm**: Type-safe database ORM.
- **@tanstack/react-query**: Server state management library.
- **@radix-ui/react-***: Accessible UI components.
- **MediaPipe CDN**: For loading MediaPipe assets.
- **Camera Utils**: For video capture and processing.
- **Drawing Utils**: For canvas rendering and motion visualization.