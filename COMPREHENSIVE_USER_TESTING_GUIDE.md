# ExerAI Hand Assessment Platform - User Testing Guide

## Overview
This guide walks test users through the complete ExerAI platform workflow, covering both admin and patient user pathways. The testing sequence follows a realistic clinical scenario from patient enrollment to assessment completion and results review.

## Pre-Testing Setup

### Environment Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Stable internet connection
- Camera access permissions (for motion tracking assessments)
- Audio permissions (optional, for better user experience)

### Test Data Preparation
- Admin credentials will be provided
- Patient access codes will be generated during testing
- Test scenarios will use realistic but anonymized data

---

## Phase 1: Admin Dashboard - Patient Creation and Management

### Step 1: Admin Login
1. Navigate to the ExerAI application URL
2. Click on **"Clinical Login"** or navigate to `/clinical-login`
3. Enter admin credentials:
   - Username: `admin`
   - Password: `admin123`
4. Click **"Sign In"**

**Expected Result**: Successfully logged into the admin dashboard

### Step 2: Patient Enrollment
1. On the admin dashboard, locate the **"Enroll New Patient"** section
2. Click **"Enroll Patient"** button
3. Fill out the patient enrollment form:
   - **Patient Code**: `TEST001` (or let system auto-generate)
   - **Injury Type**: Select "Wrist Fracture" from dropdown
   - **Study Cohort**: Select "Standard Care" from dropdown
   - **Notes**: "Test patient for system validation"
4. Click **"Enroll Patient"**

**Expected Result**: 
- Success message appears
- New patient appears in the patient list
- Patient access code is generated and displayed

### Step 3: Verify Patient Creation
1. Locate the newly created patient in the patient list
2. Note the **Patient Access Code** (you'll need this for patient testing)
3. Verify patient details are correctly displayed:
   - Patient code
   - Injury type
   - Enrollment date
   - Current compliance status

**Expected Result**: Patient information is accurately displayed with active status

---

## Phase 2: Patient User Journey - Complete Assessment Workflow

### Step 4: Patient Login
1. Open a new browser tab/window (or use incognito mode)
2. Navigate to the patient portal (main application URL)
3. Enter the **Patient Access Code** from Step 2
4. Click **"Access Portal"**

**Expected Result**: Successfully logged into patient portal with personalized dashboard

### Step 5: DASH Assessment Completion
1. On the patient dashboard, locate the **"Start DASH Assessment"** button
2. Click to begin the assessment
3. Complete all 30 questions of the DASH questionnaire:
   - **Questions 1-21**: Difficulty level questions (0-4 scale)
   - **Questions 22-23**: Symptom questions (1-5 scale)  
   - **Questions 24-28**: Work-related questions (1-5 scale)
   - **Questions 29-30**: Sports/music questions (1-5 scale)
4. Provide realistic responses simulating a patient with moderate wrist injury
5. Click **"Complete Assessment"** when finished

**Expected Result**: 
- Assessment saves successfully
- DASH score is calculated and displayed
- Quality score is shown
- Completion timestamp is recorded

### Step 6: Motion Tracking Assessment (TAM)
1. From the patient dashboard, select **"TAM Assessment"**
2. Allow camera permissions when prompted
3. Follow the on-screen instructions:
   - Position hand in camera view
   - Ensure proper lighting
   - Wait for MediaPipe initialization
4. Perform the requested finger movements:
   - **Index finger**: Full flexion/extension
   - **Middle finger**: Full flexion/extension
   - **Ring finger**: Full flexion/extension
   - **Little finger**: Full flexion/extension
5. Complete the assessment when prompted

**Expected Result**:
- Motion tracking successfully captures hand movements
- Joint angles are calculated and displayed
- Quality metrics show confidence levels
- Assessment results are saved

### Step 7: Motion Tracking Assessment (Wrist)
1. Select **"Wrist Assessment"** from the patient dashboard
2. Follow positioning instructions for wrist assessment
3. Perform requested wrist movements:
   - **Flexion/Extension**: Move wrist up and down
   - **Radial/Ulnar Deviation**: Move wrist side to side
   - **Pronation/Supination**: Rotate forearm
4. Hold positions as instructed for measurement capture
5. Complete the assessment sequence

**Expected Result**:
- Wrist motion ranges are accurately measured
- Vector calculations provide angle measurements
- Results show range of motion values
- Data is properly stored

### Step 8: Patient Data Review
1. Navigate to **"My Assessments"** or assessment history
2. Review completed assessments:
   - DASH assessment with score and responses
   - TAM assessment with finger ROM values
   - Wrist assessment with motion ranges
3. Verify all assessment data is displayed correctly
4. Check completion timestamps and quality scores

**Expected Result**: All assessment data is accurately displayed with proper formatting

### Step 9: Patient Logout
1. Click **"Logout"** button (available on all patient pages)
2. Confirm logout action

**Expected Result**: Successfully logged out and redirected to login page

---

## Phase 3: Admin Results Review and Management

### Step 10: Return to Admin Dashboard
1. Return to the admin browser tab/window
2. Refresh the page if needed to see updated data
3. Verify you're still logged in as admin

### Step 11: Patient Progress Review
1. Locate the test patient (TEST001) in the patient list
2. Click on the patient to open the patient detail modal
3. Review patient information:
   - Basic patient details
   - Compliance metrics and percentages
   - Assessment completion status
   - Recent activity timeline

**Expected Result**: Patient data reflects completed assessments with updated compliance metrics

### Step 12: DASH Progress Analysis
1. In the patient detail modal, locate the **"DASH Progress"** section
2. Review the DASH assessment data:
   - Current DASH score
   - Assessment completion date
   - Quality score percentage
   - Clinical interpretation (disability level)
3. Verify the data matches what was entered during patient testing

**Expected Result**: DASH data is accurately displayed with proper score calculation and interpretation

### Step 13: Assessment Data Verification
1. Review motion tracking assessment results in the patient detail
2. Check TAM assessment data:
   - Individual finger ROM measurements
   - Overall TAM score
   - Quality and confidence metrics
3. Check Wrist assessment data:
   - Flexion/extension ranges
   - Radial/ulnar deviation measurements
   - Pronation/supination values

**Expected Result**: All motion tracking data is properly displayed with accurate measurements

### Step 14: PDF Report Generation
1. In the patient detail modal, locate the **"Generate DASH Report"** button
2. Click to generate the PDF report
3. Wait for the PDF to generate and download
4. Open the downloaded PDF and verify:
   - **ExerAI Logo**: Properly displayed without "HAND ASSESSMENT" text
   - **Patient Information**: Correct patient code, injury type, assessment ID
   - **DASH Score**: Accurate score with clinical interpretation
   - **Question Responses**: All 30 questions with selected answers
   - **Professional Formatting**: Clean layout, proper spacing, readable fonts

**Expected Result**: PDF generates successfully with accurate data and professional ExerAI branding

### Step 15: Compliance Metrics Validation
1. Review the compliance dashboard on the main admin page
2. Verify compliance calculations:
   - **Assessment Completion**: Percentage of completed assessments
   - **Temporal Adherence**: Adherence to daily assessment schedule
   - **Overall Compliance**: Combined compliance metric
3. Check that the test patient's assessments contribute to overall statistics

**Expected Result**: Compliance metrics accurately reflect completed assessments and temporal adherence

---

## Phase 4: Additional Admin Features Testing

### Step 16: Patient Search and Filtering
1. Use the search functionality to find the test patient
2. Try searching by:
   - Patient code (TEST001)
   - Injury type (Wrist Fracture)
   - Enrollment date
3. Test filtering options if available

**Expected Result**: Search and filtering functions work correctly

### Step 17: Analytics Dashboard Review
1. Navigate to analytics sections of the admin dashboard
2. Review aggregate data:
   - Total patient count
   - Assessment completion rates
   - Average DASH scores
   - Compliance trends
3. Verify that test patient data is included in calculations

**Expected Result**: Analytics accurately reflect all patient data including test patient

### Step 18: Multi-Patient Comparison
1. If other patients exist in the system, compare data across patients
2. Review compliance variations
3. Check DASH score distributions
4. Verify data integrity across different patient records

**Expected Result**: Data remains consistent and accurate across all patient records

---

## Testing Validation Checklist

### Patient Portal Functionality
- [ ] Patient login with access code works
- [ ] DASH assessment saves all 30 responses correctly
- [ ] Motion tracking captures accurate movement data
- [ ] Assessment history displays properly
- [ ] Logout functionality works from all pages

### Admin Dashboard Functionality
- [ ] Admin login authentication works
- [ ] Patient enrollment creates new records successfully
- [ ] Patient list displays accurate information
- [ ] Patient detail modal shows comprehensive data
- [ ] PDF report generation works with correct branding
- [ ] Compliance metrics calculate accurately

### Data Integrity
- [ ] DASH scores calculate correctly (0-100 scale)
- [ ] Motion tracking data matches performed movements
- [ ] Timestamps record accurately
- [ ] Quality scores reflect assessment confidence
- [ ] All patient data persists across sessions

### System Integration
- [ ] MediaPipe integration functions properly
- [ ] Database operations complete successfully
- [ ] PDF generation includes actual ExerAI logo
- [ ] Real-time updates appear in admin dashboard
- [ ] Cross-session data consistency maintained

---

## Troubleshooting Common Issues

### Camera/MediaPipe Issues
- Ensure camera permissions are granted
- Check adequate lighting conditions
- Verify browser supports MediaPipe functionality
- Clear browser cache if tracking fails

### Data Not Appearing
- Refresh browser page
- Check network connectivity
- Verify assessment was completed fully
- Confirm user authentication status

### PDF Generation Problems
- Allow popup/download permissions
- Check browser download settings
- Verify sufficient system memory
- Try generating report again after brief wait

---

## Test Completion

After completing all testing phases, you should have:

1. **Created a test patient** through the admin portal
2. **Completed full assessment workflow** as a patient user
3. **Reviewed all results** through the admin dashboard
4. **Generated a professional PDF report** with actual ExerAI branding
5. **Validated data accuracy** across all system components

This comprehensive testing ensures all major features of the ExerAI Hand Assessment Platform are functioning correctly and ready for clinical use.

---

## Next Steps

Following successful completion of this testing guide:
- Document any issues or anomalies discovered
- Verify system performance meets clinical requirements
- Confirm data security and privacy compliance
- Prepare for clinical deployment and staff training

For technical support or questions about this testing process, refer to the project documentation or contact the development team.