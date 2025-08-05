# ExerAI Export Data Guide

## Overview

The ExerAI export data feature creates a comprehensive ZIP file containing all system data in an organized, structured format. This guide explains how to understand and work with the exported data.

## Export File Structure

When you click "Export Data" from the admin dashboard, you'll download a ZIP file named:
```
exer_ai_system_export_YYYY-MM-DD.zip
```

### ZIP Contents

The ZIP file contains the following organized structure:

```
exer_ai_system_export_YYYY-MM-DD.zip
├── system_summary.json          # Overall system metrics and metadata
├── patient_overview.json        # Complete patient list with key statistics
├── patient_summary.csv          # Spreadsheet-compatible patient data
└── patients/                    # Individual patient data files
    ├── ABC_data.json           # Patient with access code "ABC"
    ├── DEF_data.json           # Patient with access code "DEF"
    └── ...                     # One file per patient
```

## File Descriptions

### 1. system_summary.json
**Purpose:** High-level system analytics and compliance metrics

**Contents:**
- Export timestamp and metadata
- Total patient counts (active/inactive)
- System-wide compliance statistics
- Assessment completion rates
- Export version information

**Example structure:**
```json
{
  "exportDate": "2025-08-05T22:37:29.142Z",
  "systemSummary": {
    "totalPatients": 13,
    "activePatients": 13,
    "totalAssessments": 847,
    "completedToday": 12,
    "complianceRate": 85,
    "assignedAssessments": 1200,
    "completedAssessments": 847
  },
  "metadata": {
    "totalPatients": 13,
    "exportVersion": "1.0",
    "systemType": "ExerAI HandCare Portal Admin Export"
  }
}
```

### 2. patient_overview.json
**Purpose:** Complete patient directory with summary statistics

**Contents:**
- Patient identification (ID, access code)
- Injury type and surgery information
- Progress tracking metrics
- Last activity timestamps
- Assessment completion rates

**Example structure:**
```json
[
  {
    "patientId": "P015",
    "code": "ABC123",
    "injuryType": "Carpal Tunnel",
    "postOpDay": 42,
    "assessmentCompletionRate": 78,
    "daysActive": 15,
    "createdAt": "2025-06-24T18:37:29.142Z",
    "lastVisit": "2025-08-05T14:22:15.000Z"
  }
]
```

### 3. patient_summary.csv
**Purpose:** Spreadsheet-compatible format for data analysis

**Contents:** Same data as patient_overview.json but in CSV format for easy import into Excel, Google Sheets, or statistical software.

**Columns:**
- Patient ID
- Patient Code
- Injury Type
- Post-Op Day
- Assessment Completion Rate (%)
- Days Active
- Registration Date
- Last Visit

### 4. patients/ folder
**Purpose:** Individual patient files with complete assessment history

Each file is named `[ACCESS_CODE]_data.json` and contains:

**Patient Information:**
- Demographics and injury details
- Surgery date and post-operative timeline
- Registration information

**Assessment History:**
- Complete motion tracking data (romData JSON with full MediaPipe landmark data)
- Individual finger ROM measurements (index, middle, ring, pinky fingers)
- Detailed joint angle measurements (MCP, PIP, DIP joints for each finger)
- Maximum joint angles and ranges
- Wrist measurements (flexion, extension, maximum ranges)
- Complete DASH survey responses (all 30 questions with individual answers)
- DASH scores and clinical interpretations
- Quality scores and confidence metrics
- Exercise repetition data and patterns
- Timestamp information for each assessment

**Performance Statistics:**
- Total assessments completed
- Completion rate calculations
- Activity patterns

**Example patient file structure:**
```json
{
  "patient": {
    "patientId": "P015",
    "code": "ABC123",
    "injuryType": "Carpal Tunnel",
    "postOpDay": 42,
    "createdAt": "2025-06-24T18:37:29.142Z"
  },
  "assessments": [
    {
      "id": 156,
      "assessmentId": 2,
      "completedAt": "2025-08-05T14:22:15.000Z",
      "handType": "right",
      "isCompleted": true,
      
      "romData": { 
        "landmarks": [...], 
        "confidence": 0.89,
        "frameData": [...] 
      },
      "repetitionData": { 
        "count": 12, 
        "timing": [...],
        "patterns": [...] 
      },
      "qualityScore": 85,
      
      "totalActiveRom": 245,
      "tamScore": 245,
      
      "indexFingerRom": 62.5,
      "middleFingerRom": 78.3,
      "ringFingerRom": 71.2,
      "pinkyFingerRom": 65.8,
      
      "maxMcpAngle": 85.4,
      "maxPipAngle": 92.1,
      "maxDipAngle": 68.7,
      
      "middleFingerMcp": 78.3,
      "middleFingerPip": 89.2,
      "middleFingerDip": 65.1,
      "ringFingerMcp": 71.2,
      "ringFingerPip": 82.4,
      "ringFingerDip": 58.9,
      "pinkyFingerMcp": 65.8,
      "pinkyFingerPip": 79.1,
      "pinkyFingerDip": 52.3,
      
      "wristFlexionAngle": 65.2,
      "wristExtensionAngle": 72.8,
      "maxWristFlexion": 68.5,
      "maxWristExtension": 75.1,
      
      "dashScore": 28.5,
      "dashResponses": {
        "q1": 2,
        "q2": 1,
        "q3": 3,
        "responses": [...]
      },
      
      "shareToken": "abc123def456"
    }
  ],
  "statistics": {
    "totalAssessments": 34,
    "assessmentCompletionRate": 78,
    "daysActive": 15
  }
}
```

## Data Integrity Features

### Soft-Delete Filtering
- Deleted assessments are automatically excluded from exports
- Only active, completed assessments appear in the data
- Maintains data integrity across all export formats

### Audit Trail
- Every export is logged with timestamp and user information
- Export metadata includes patient count and assessment totals
- Compliance tracking for regulatory requirements

## Working with the Data

### For Clinical Analysis
1. **Quick Overview:** Start with `system_summary.json` for high-level metrics
2. **Patient Lists:** Use `patient_summary.csv` for spreadsheet analysis
3. **Individual Cases:** Examine specific patient files in the `patients/` folder

### For Research Studies
1. **Aggregate Analysis:** Combine data from multiple patient files
2. **Longitudinal Tracking:** Use timestamp data to track progress over time
3. **Outcome Measurement:** Analyze assessment completion rates and quality scores

### For Compliance Reporting
1. **System Metrics:** Use system_summary.json for regulatory reports
2. **Patient Enrollment:** Track patient registration and activity patterns
3. **Data Completeness:** Monitor assessment completion rates

## Technical Specifications

### File Formats
- **JSON Files:** UTF-8 encoded, pretty-printed for readability
- **CSV File:** Comma-separated values with quoted fields
- **ZIP Compression:** Maximum compression (level 9) for efficient storage

### Data Types
- **Dates:** ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Numbers:** Standard JSON numeric format
- **Strings:** UTF-8 encoded text
- **Booleans:** true/false values

### File Size Considerations
- Individual patient files typically range from 10KB to 500KB
- Complete exports usually range from 1MB to 50MB depending on patient count
- ZIP compression reduces file size by approximately 70-80%

## Security and Privacy

### Data Protection
- All patient data is de-identified with access codes
- No personally identifiable information (PII) is included
- HIPAA-compliant data handling practices

### Access Control
- Export functionality requires administrator authentication
- All exports are logged for audit purposes
- Automatic session management prevents unauthorized access

## Support and Troubleshooting

### Common Issues
- **Large Files:** For systems with many patients, exports may take 30-60 seconds
- **Browser Downloads:** Ensure browser allows file downloads from the application
- **File Access:** Use standard ZIP extraction tools (built into most operating systems)

### File Validation
- Check `system_summary.json` metadata for export completeness
- Verify patient count matches expected values
- Confirm assessment totals align with system records

### Getting Help
- Contact system administrators for export issues
- Refer to audit logs for export history and troubleshooting
- Check system status if exports consistently fail

---

*Last Updated: August 2025*  
*ExerAI HandCare Portal v1.0*