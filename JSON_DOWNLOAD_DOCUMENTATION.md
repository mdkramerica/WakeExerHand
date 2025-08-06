# JSON Download Data Structure Documentation

This document describes the structure and layout of JSON data downloaded from the ExerAI Hand Assessment Platform. The platform provides two types of JSON downloads: individual assessment downloads and comprehensive patient data exports.

## Table of Contents
1. [Individual Assessment JSON Structure](#individual-assessment-json-structure)
2. [Patient Data Export JSON Structure](#patient-data-export-json-structure)
3. [Motion Capture Data Fields](#motion-capture-data-fields)
4. [DASH Assessment Data](#dash-assessment-data)
5. [Data Types and Validation](#data-types-and-validation)

---

## Individual Assessment JSON Structure

Individual assessments can be downloaded via the "JSON" button in the assessment history. This provides comprehensive data for a single assessment session.

### Root Structure
```json
{
  "assessment": { ... },
  "user": { ... },
  "assessmentData": { ... } | "dashSurvey": { ... }
}
```

### Assessment Metadata
```json
"assessment": {
  "id": 15,                              // Unique assessment record ID
  "userId": 1,                           // Patient user ID
  "assessmentId": 5,                     // Assessment type ID
  "patientCode": "DEMO01",               // Patient access code
  "completedAt": "2025-07-22T22:09:24.356Z", // ISO timestamp
  "qualityScore": 100,                   // Overall assessment quality (0-100)
  "isCompleted": true                    // Assessment completion status
}
```

### User Information
```json
"user": {
  "code": "DEMO01",                      // Patient access code
  "injuryType": "Wrist Fracture"         // Type of injury being assessed
}
```

### Motion-Based Assessment Data
For assessments involving motion tracking (TAM, Kapandji, Wrist assessments):

```json
"assessmentData": {
  // Basic ROM Measurements
  "totalActiveRom": "83.75",             // Total Active Range of Motion (degrees)
  "indexFingerRom": "83.75",             // Index finger ROM (degrees)
  "middleFingerRom": "43.91",            // Middle finger ROM (degrees)
  "ringFingerRom": "64.90",              // Ring finger ROM (degrees)
  "pinkyFingerRom": "61.50",             // Pinky finger ROM (degrees)
  "kapandjiScore": null,                 // Kapandji opposition score (if applicable)
  
  // Wrist Measurements
  "maxWristFlexion": "90.00",            // Maximum wrist flexion angle
  "maxWristExtension": "90.00",          // Maximum wrist extension angle
  "maxRadialDeviation": null,            // Maximum radial deviation
  "maxUlnarDeviation": null,             // Maximum ulnar deviation
  "maxSupination": null,                 // Maximum forearm supination
  "maxPronation": null,                  // Maximum forearm pronation
  
  // Original Motion Data (preserved for compatibility)
  "originalMotionData": {
    "romData": { ... },                  // Parsed ROM calculation data
    "repetitionData": [ ... ]            // Complete repetition motion data
  },
  
  // Enhanced Motion Capture Analysis
  "detailedMotionCapture": {
    "totalFrames": 116,                  // Total number of captured frames
    "frameDuration": 9950,               // Total capture duration (milliseconds)
    "averageQuality": 90.0,              // Average tracking quality across frames
    "frameData": [                       // Complete frame-by-frame data
      {
        "timestamp": 1753222152237,      // Frame timestamp
        "handLandmarks": [               // 21 hand landmark points
          {
            "x": 0.372,                  // Normalized X coordinate (0-1)
            "y": 0.694,                  // Normalized Y coordinate (0-1)
            "z": 0.0000002              // Depth coordinate
          },
          // ... 20 more hand landmarks
        ],
        "poseLandmarks": [               // 33 body pose landmarks
          {
            "x": 0.550,                  // Normalized X coordinate (0-1)
            "y": 0.082,                  // Normalized Y coordinate (0-1)
            "z": -0.836,                 // Depth coordinate
            "visibility": 0.999          // Landmark visibility confidence
          },
          // ... 32 more pose landmarks
        ],
        "quality": 90,                   // Frame quality score (0-100)
        "handedness": "RIGHT",           // Detected hand (LEFT/RIGHT)
        "wristAngles": null,             // Calculated wrist angles
        "sessionHandType": "RIGHT",      // Session hand setting
        "sessionElbowLocked": false      // Elbow lock setting
      }
      // ... additional frames
    ],
    "repetitionBreakdown": [             // Per-repetition analysis
      {
        "repetitionIndex": 0,            // Repetition number
        "duration": 10,                  // Repetition duration (seconds)
        "frameCount": 116,               // Frames in this repetition
        "romData": {                     // ROM calculation for this rep
          "dipAngle": 20.52,             // DIP joint angle
          "mcpAngle": 41.26,             // MCP joint angle
          "pipAngle": 21.97,             // PIP joint angle
          "totalActiveRom": 83.75        // Total ROM for this repetition
        },
        "startTimestamp": 1753222152237, // Start time
        "endTimestamp": 1753222162187    // End time
      }
    ]
  },
  
  // Biomechanical Analysis
  "biomechanicalAnalysis": {
    "handTrackingConfidence": {
      "average": 90.0,                   // Average quality across session
      "minimum": 85.0,                   // Lowest quality frame
      "maximum": 95.0,                   // Highest quality frame
      "standardDeviation": 2.5           // Quality consistency metric
    },
    "temporalAnalysis": {
      "totalDuration": 9950,             // Total session time (ms)
      "framerate": 11.66,                // Effective frame rate (fps)
      "consistentTracking": true         // Tracking consistency flag
    }
  },
  
  // Data Integrity Summary
  "motionDataSummary": {
    "hasMotionData": true,               // Motion data availability
    "hasRomData": true,                  // ROM data availability
    "totalFramesCaptured": 116,          // Total frames captured
    "assessmentDuration": 9950,          // Assessment duration (ms)
    "averageTrackingQuality": 90.0       // Overall tracking quality
  }
}
```

---

## Patient Data Export JSON Structure

Comprehensive patient data can be downloaded from the admin panel using the patient's download button. This includes all assessments and complete patient information.

### Root Structure
```json
{
  "patient": { ... },
  "assessments": [ ... ]
}
```

### Patient Information
```json
"patient": {
  "id": 1,                               // Internal patient ID
  "patientId": "P001",                   // Formatted patient identifier
  "code": "DEMO01",                      // Patient access code
  "injuryType": "Wrist Fracture",        // Type of injury
  "createdAt": "2025-07-22T16:57:15.752Z", // Patient creation timestamp
  "surgeryDate": null,                   // Surgery date (if applicable)
  "firstName": "Demo",                   // Patient first name
  "lastName": "User 1",                  // Patient last name
  "email": "demo01@example.com"          // Patient email
}
```

### Assessment Array
Each assessment in the array contains enhanced data structure:

```json
"assessments": [
  {
    // Assessment Identification
    "id": 15,                            // Assessment record ID
    "assessmentId": 5,                   // Assessment type ID
    "assessmentName": "TAM Assessment",   // Human-readable assessment name
    "completedAt": "2025-07-22T22:09:24.356Z", // Completion timestamp
    "handType": "RIGHT",                 // Hand assessed (LEFT/RIGHT)
    "isCompleted": true,                 // Completion status
    
    // Original Motion Data (preserved for compatibility)
    "romData": { ... },                  // ROM calculation data
    "repetitionData": [ ... ],           // Complete motion data
    "qualityScore": 100,                 // Assessment quality score
    
    // Enhanced Motion Capture Analysis (same structure as individual)
    "detailedMotionCapture": { ... },
    "biomechanicalAnalysis": { ... },
    
    // Total Active Motion Measurements
    "totalActiveRom": "83.75",
    "tamScore": "83.75",                 // TAM score (alias)
    
    // Individual Finger ROM Measurements
    "fingerRomMeasurements": {
      "indexFinger": "83.75",
      "middleFinger": "43.91",
      "ringFinger": "64.90",
      "pinkyFinger": "61.50"
    },
    
    // Joint Angle Measurements
    "jointAngles": {
      "maximum": {
        "mcp": "41.26",                  // Maximum MCP angle
        "pip": "21.97",                  // Maximum PIP angle
        "dip": "20.52"                   // Maximum DIP angle
      },
      "individual": {
        "middleFinger": {
          "mcp": "35.2",
          "pip": "18.5",
          "dip": "15.3"
        },
        "ringFinger": { ... },
        "pinkyFinger": { ... }
      }
    },
    
    // Wrist Measurements
    "wristMeasurements": {
      "flexionExtension": {
        "flexionAngle": "-45.0",
        "extensionAngle": "60.0",
        "maxFlexion": "90.0",
        "maxExtension": "90.0"
      }
    },
    
    // DASH Assessment (if applicable)
    "dashAssessment": {
      "score": "25.5",                   // DASH disability score
      "responses": { ... },              // Survey responses
      "completedAt": "2025-07-22T22:09:24.356Z"
    },
    
    // Metadata and Sharing
    "metadata": {
      "shareToken": "abc123def456",      // Unique sharing token
      "dataIntegrity": {
        "hasMotionData": true,
        "hasRomData": true,
        "frameCount": 116,
        "assessmentDuration": 9950
      }
    }
  }
  // ... additional assessments
]
```

---

## Motion Capture Data Fields

### Hand Landmarks (21 points)
The hand landmarks follow MediaPipe's hand landmark model:

| Index | Landmark | Description |
|-------|----------|-------------|
| 0 | WRIST | Wrist center |
| 1-4 | THUMB | Thumb joints (CMC, MCP, IP, TIP) |
| 5-8 | INDEX | Index finger joints (MCP, PIP, DIP, TIP) |
| 9-12 | MIDDLE | Middle finger joints (MCP, PIP, DIP, TIP) |
| 13-16 | RING | Ring finger joints (MCP, PIP, DIP, TIP) |
| 17-20 | PINKY | Pinky finger joints (MCP, PIP, DIP, TIP) |

### Pose Landmarks (33 points)
Body pose landmarks for contextual analysis:

| Range | Description |
|-------|-------------|
| 0-10 | Face and head landmarks |
| 11-16 | Upper body (shoulders, elbows, wrists) |
| 17-22 | Hands |
| 23-28 | Lower body (hips, knees, ankles) |
| 29-32 | Feet |

### Coordinate System
- **X, Y coordinates**: Normalized to range [0.0, 1.0] relative to image dimensions
- **Z coordinate**: Relative depth (smaller values = closer to camera)
- **Visibility**: Confidence score [0.0, 1.0] for pose landmarks

---

## DASH Assessment Data

For DASH (Disabilities of the Arm, Shoulder and Hand) surveys:

```json
"dashSurvey": {
  "dashScore": "25.5",                   // DASH disability score (0-100)
  "assessmentName": "DASH Survey",       // Assessment name
  "completedAt": "2025-07-22T22:09:24.356Z", // Completion timestamp
  "qualityScore": 100,                   // Data quality score
  "sessionNumber": 1,                    // Session number
  "description": "Complete DASH assessment...", // Description
  
  "questionnaireResponses": {
    // Physical Function Questions (1-21) - 1-5 scale
    "q1_open_jar": 2,
    "q2_write": 1,
    "q3_turn_key": 3,
    "q4_prepare_meal": 2,
    "q5_push_heavy_door": 1,
    "q6_place_object_shelf": 2,
    "q7_heavy_household_chores": 4,
    "q8_garden_yard_work": 3,
    "q9_make_bed": 2,
    "q10_carry_shopping_bag": 3,
    "q11_carry_heavy_object": 4,
    "q12_change_lightbulb": 2,
    "q13_wash_blow_dry_hair": 1,
    "q14_wash_back": 3,
    "q15_put_on_sweater": 2,
    "q16_use_knife_cut_food": 1,
    "q17_recreational_little_effort": 2,
    "q18_recreational_force_impact": 4,
    "q19_recreational_move_arm_freely": 3,
    "q20_manage_transportation": 1,
    "q21_sexual_activities": 2,
    
    // Social Function Questions (22-23)
    "q22_social_activities_interference": 3, // 1-5 scale (interference)
    "q23_work_limitation": 2,                // 1-5 scale (limitation)
    
    // Symptoms Questions (24-30)
    "q24_arm_shoulder_hand_pain": 3,         // 1-5 scale (severity)
    "q25_pain_specific_activity": 4,         // 1-5 scale (severity)
    "q26_tingling": 2,                       // 1-5 scale (severity)
    "q27_weakness": 3,                       // 1-5 scale (severity)
    "q28_stiffness": 4,                      // 1-5 scale (severity)
    "q29_difficulty_sleeping": 2,            // 1-5 scale (sleep trouble)
    "q30_feel_less_capable": 3               // 1-5 scale (agreement)
  },
  
  "responsesWithLabels": {
    "q1_open_jar": {
      "value": 2,
      "label": "Mild Difficulty",
      "category": "difficulty",
      "questionNumber": 1
    },
    "q22_social_activities_interference": {
      "value": 3,
      "label": "Moderately",
      "category": "interference",
      "questionNumber": 22
    },
    "q30_feel_less_capable": {
      "value": 3,
      "label": "Neither agree nor disagree",
      "category": "agreement",
      "questionNumber": 30
    }
    // ... all 30 responses with labels
  }
}
```

### DASH Response Scales

The DASH questionnaire uses different 1-5 scales based on question category:

**Physical Function (Questions 1-21) - Difficulty Scale:**
- **1**: No Difficulty
- **2**: Mild Difficulty  
- **3**: Moderate Difficulty
- **4**: Severe Difficulty
- **5**: Unable

**Social Function - Interference (Question 22):**
- **1**: Not at all
- **2**: Slightly
- **3**: Moderately
- **4**: Quite a bit
- **5**: Extremely

**Social Function - Limitation (Question 23):**
- **1**: Not limited at all
- **2**: Slightly limited
- **3**: Moderately limited
- **4**: Very limited
- **5**: Unable

**Symptoms - Severity (Questions 24-28):**
- **1**: None
- **2**: Mild
- **3**: Moderate
- **4**: Severe
- **5**: Extreme

**Sleep (Question 29):**
- **1**: No trouble
- **2**: Mild trouble
- **3**: Moderate trouble
- **4**: Severe trouble
- **5**: So much trouble I could not sleep

**Agreement (Question 30):**
- **1**: Strongly disagree
- **2**: Disagree
- **3**: Neither agree nor disagree
- **4**: Agree
- **5**: Strongly agree

---

## Data Types and Validation

### Timestamps
- Format: ISO 8601 (e.g., "2025-07-22T22:09:24.356Z")
- Timezone: UTC

### Angles and Measurements
- Units: Degrees for angles, seconds for duration
- Precision: Typically 2 decimal places
- Range: ROM values typically 0-180°, wrist angles -90° to +90°

### Quality Scores
- Range: 0-100 (integer or float)
- 100 = Perfect tracking/assessment
- 70+ = Good quality (typically acceptable)
- <70 = Poor quality (may need retesting)

### Coordinates
- Hand/Pose landmarks: Normalized floating-point values
- X, Y: [0.0, 1.0] range relative to image
- Z: Relative depth (not absolute distance)

### Data Integrity Flags
- **hasMotionData**: Boolean indicating motion capture availability
- **hasRomData**: Boolean indicating ROM calculation availability
- **frameCount**: Integer count of captured frames
- **assessmentDuration**: Duration in milliseconds

---

## Usage Examples

### Analyzing Motion Quality
```javascript
// Check if assessment has high-quality motion data
const assessment = jsonData.assessmentData;
if (assessment.motionDataSummary.averageTrackingQuality >= 80) {
  console.log("High quality motion capture data available");
  console.log(`Captured ${assessment.motionDataSummary.totalFramesCaptured} frames`);
}
```

### Extracting Frame-by-Frame Data
```javascript
// Process each motion frame
const frames = assessment.detailedMotionCapture.frameData;
frames.forEach((frame, index) => {
  console.log(`Frame ${index}: Quality ${frame.quality}%`);
  console.log(`Hand landmarks: ${frame.handLandmarks.length} points`);
  console.log(`Pose landmarks: ${frame.poseLandmarks.length} points`);
});
```

### Biomechanical Analysis
```javascript
// Access biomechanical metrics
const analysis = assessment.biomechanicalAnalysis;
if (analysis.handTrackingConfidence) {
  const confidence = analysis.handTrackingConfidence;
  console.log(`Tracking consistency: ${confidence.standardDeviation < 5 ? 'Good' : 'Variable'}`);
  console.log(`Quality range: ${confidence.minimum}% - ${confidence.maximum}%`);
}
```

---

## Version Information
- **Document Version**: 1.0
- **Last Updated**: August 6, 2025
- **Compatible with**: ExerAI Platform v2024.1+

For technical support or questions about the data structure, please contact the development team.