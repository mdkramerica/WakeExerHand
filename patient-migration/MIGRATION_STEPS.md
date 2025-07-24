
# PATIENT DATA MIGRATION STEPS

## Current Valuable Data:
- Patient 231788: Distal Radius Fracture (1 assessment)
- Patient 720018: Trigger Finger (surgery 2025-07-21, DASH score 74.20, motion data)

## Step-by-Step Migration:

### BEFORE FORK:
1. Save these files to your computer:
   - patient-migration/export-script.sql  
   - patient-migration/import-script.sql

### FORK PROCESS:
1. Click 'Fork' button in Replit
2. Name: 'ExerAI-HandAssessment-Clean'
3. Delete large .mov files from attached_assets

### AFTER FORK:
1. Run import-script.sql in new database
2. Verify patients appear with: SELECT * FROM users WHERE code IN ('231788', '720018');

### RESULT:
✅ Clean Git repository
✅ Preserved patient data  
✅ All code improvements
✅ Fresh GitHub connection

