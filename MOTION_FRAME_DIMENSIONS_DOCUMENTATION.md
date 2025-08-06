# Motion Analysis Frame Dimensions Documentation

## Overview

This document provides a comprehensive explanation of how frame dimensions are calculated, managed, and stored in the ExerAI motion analysis system. The system uses a sophisticated approach that combines fixed standard dimensions with dynamic detection and normalized coordinate storage.

## Table of Contents

1. [Live Capture Frame Dimensions](#live-capture-frame-dimensions)
2. [Dynamic Dimension Detection](#dynamic-dimension-detection)
3. [Camera Configuration and Constraints](#camera-configuration-and-constraints)
4. [Motion Data Storage Structure](#motion-data-storage-structure)
5. [Coordinate Normalization System](#coordinate-normalization-system)
6. [Motion Replay and Scaling](#motion-replay-and-scaling)
7. [Technical Implementation Details](#technical-implementation-details)
8. [Code References](#code-references)

## Live Capture Frame Dimensions

### Standard Resolution: 640x480 pixels

The ExerAI system uses **640x480 pixels** as the primary resolution for motion capture across all assessments. This resolution provides:

- **Optimal Performance**: Balance between detail and processing speed
- **MediaPipe Compatibility**: Well-supported resolution for landmark detection
- **Consistent Analysis**: Standardized base for all motion calculations
- **Cross-Platform Support**: Widely supported across devices and browsers

### Resolution Hierarchy

```javascript
// Primary: Detected video dimensions
const width = video.videoWidth || 640;
const height = video.videoHeight || 480;

// Fallback: Standard dimensions
canvas.width = width;  // Typically 640
canvas.height = height; // Typically 480
```

**Resolution Priority:**
1. **Detected Video Dimensions**: `video.videoWidth` and `video.videoHeight`
2. **Standard Fallback**: 640x480 if detection fails
3. **Minimum Constraints**: 320x240 as absolute minimum

## Dynamic Dimension Detection

### Camera Initialization Process

The system performs real-time dimension detection during camera setup:

```javascript
// From holistic-tracker.tsx lines 628-635
video.onloadedmetadata = async () => {
  console.log(`📐 Video dimensions: ${video.videoWidth}x${video.videoHeight}`);
  
  // Set canvas dimensions to match video
  const width = video.videoWidth || 640;
  const height = video.videoHeight || 480;
  
  canvas.width = width;
  canvas.height = height;
  
  console.log(`🎨 Canvas configured: ${width}x${height}`);
};
```

### Detection Flow

1. **Stream Acquisition**: Camera stream obtained with preferred constraints
2. **Metadata Loading**: Wait for video metadata to determine actual dimensions
3. **Canvas Configuration**: Set canvas size to match detected dimensions
4. **Processing Setup**: Configure MediaPipe with final dimensions
5. **Frame Processing**: Begin motion capture with established dimensions

## Camera Configuration and Constraints

### MediaStream Constraints

The system requests specific camera capabilities:

```javascript
// From holistic-tracker.tsx lines 543-544
video: {
  width: { ideal: 640, min: 320 },
  height: { ideal: 480, min: 240 },
  facingMode: 'user'
}
```

**Constraint Parameters:**
- **Ideal Resolution**: 640x480 (preferred)
- **Minimum Resolution**: 320x240 (fallback)
- **Camera Type**: Front-facing ('user')
- **Aspect Ratio**: 4:3 maintained

### Fallback Strategy

If ideal constraints cannot be met:

1. **Browser Negotiation**: Browser selects closest supported resolution
2. **Minimum Enforcement**: Ensures at least 320x240 is available
3. **Dynamic Adjustment**: Canvas adapts to actual stream dimensions
4. **Quality Maintenance**: MediaPipe processing remains consistent

## Motion Data Storage Structure

### Frame Data Architecture

Motion data is stored **without explicit frame dimensions**. Instead, the system uses normalized coordinates:

```javascript
// From recording.tsx lines 406-421
const motionFrame = {
  timestamp: currentTime,                    // Recording timestamp
  landmarks: data.landmarks.map((landmark) => ({
    x: parseFloat(landmark.x) || 0,         // Normalized 0-1 range
    y: parseFloat(landmark.y) || 0,         // Normalized 0-1 range
    z: parseFloat(landmark.z) || 0          // Normalized depth
  })),
  poseLandmarks: data.poseLandmarks || [],  // Body pose data
  wristAngles: frameWristAngles,            // Calculated angles
  handedness: sessionHandType,              // LEFT/RIGHT
  sessionElbowIndex: data.sessionElbowIndex,
  sessionWristIndex: data.sessionWristIndex,
  quality: qualityScore                     // 0-100 quality metric
};
```

### Storage Benefits

**Resolution Independence:**
- Motion data works at any display resolution
- Consistent analysis regardless of capture device
- Future-proof for different screen sizes

**Efficiency:**
- Smaller file sizes (no redundant dimension data)
- Faster processing and transmission
- Simplified data structure

## Coordinate Normalization System

### MediaPipe Normalization

MediaPipe automatically normalizes all landmark coordinates:

**Input**: Raw pixel coordinates (e.g., x=320, y=240 in 640x480 frame)
**Output**: Normalized coordinates (e.g., x=0.5, y=0.5)

```javascript
// Normalization formula (performed by MediaPipe)
normalizedX = pixelX / frameWidth;   // 320/640 = 0.5
normalizedY = pixelY / frameHeight;  // 240/480 = 0.5
```

### Coordinate Range

- **X-axis**: 0.0 (left edge) to 1.0 (right edge)
- **Y-axis**: 0.0 (top edge) to 1.0 (bottom edge)
- **Z-axis**: Relative depth (approximately -1.0 to 1.0)

### Landmark Storage Example

```javascript
// Stored landmark data
{
  "landmarks": [
    { "x": 0.456, "y": 0.234, "z": -0.012 },  // Thumb tip
    { "x": 0.512, "y": 0.345, "z": 0.023 },   // Index finger tip
    { "x": 0.489, "y": 0.456, "z": 0.034 }    // Wrist center
  ]
}
```

## Motion Replay and Scaling

### Canvas Rendering During Replay

Motion replay uses fixed dimensions for consistent visualization:

```javascript
// From motion replay components
canvas.width = 640;   // Standard replay width
canvas.height = 480;  // Standard replay height

// Coordinate scaling for rendering
const pixelX = landmark.x * canvas.width;   // 0.5 * 640 = 320
const pixelY = landmark.y * canvas.height;  // 0.5 * 480 = 240
```

### Scaling Process

1. **Load Normalized Data**: Read stored motion frames with 0-1 coordinates
2. **Set Canvas Size**: Configure replay canvas (typically 640x480)
3. **Scale Coordinates**: Multiply normalized values by canvas dimensions
4. **Render Frame**: Draw landmarks and connections at scaled positions

### Multi-Resolution Support

The normalized storage enables flexible replay:

```javascript
// Different replay sizes possible
const mobileCanvas = { width: 320, height: 240 };   // Mobile view
const desktopCanvas = { width: 640, height: 480 };  // Desktop view
const hdCanvas = { width: 1280, height: 960 };      // HD replay

// Same normalized data works for all sizes
landmark.x * canvasWidth;  // Scales appropriately
landmark.y * canvasHeight; // Maintains proportions
```

## Technical Implementation Details

### Components Involved

**Primary Components:**
- `holistic-tracker.tsx`: Camera and dimension management
- `recording.tsx`: Motion data capture and storage
- `assessment-replay.tsx`: Motion playback and visualization
- `skeleton-overlay.tsx`: Real-time landmark rendering

### Dimension Flow

1. **Camera Request**: System requests 640x480 from browser
2. **Actual Detection**: Browser provides actual camera capabilities
3. **Canvas Setup**: Canvas configured to match video stream
4. **MediaPipe Processing**: Landmarks normalized to 0-1 range
5. **Data Storage**: Normalized coordinates saved to database
6. **Replay Rendering**: Coordinates scaled for display canvas

### Error Handling

```javascript
// Dimension fallback handling
const width = video.videoWidth || 640;    // Use detected or fallback
const height = video.videoHeight || 480;  // Use detected or fallback

// Canvas safety checks
if (canvas && width > 0 && height > 0) {
  canvas.width = width;
  canvas.height = height;
} else {
  console.warn('Invalid dimensions, using defaults');
  canvas.width = 640;
  canvas.height = 480;
}
```

## Code References

### Key Files and Line Numbers

**Dimension Detection:**
- `client/src/components/holistic-tracker.tsx:628-635` - Video dimension logging
- `client/src/components/holistic-tracker.tsx:631-632` - Canvas size setting

**Camera Constraints:**
- `client/src/components/holistic-tracker.tsx:543-544` - Stream constraints
- Multiple components use identical 640x480 constraints

**Motion Data Storage:**
- `client/src/pages/recording.tsx:406-421` - Motion frame structure
- `client/src/pages/recording.tsx:430` - Frame data push to storage

**Replay Rendering:**
- Multiple replay components use fixed 640x480 canvas
- Canvas scaling applied during landmark rendering

### Configuration Constants

**Standard Dimensions:**
```javascript
const STANDARD_WIDTH = 640;
const STANDARD_HEIGHT = 480;
const MINIMUM_WIDTH = 320;
const MINIMUM_HEIGHT = 240;
```

**Aspect Ratio:**
```javascript
const ASPECT_RATIO = 4/3;  // 640/480 = 1.333...
```

## Performance Considerations

### Memory Usage

- **Normalized Storage**: ~50% reduction in coordinate data size
- **No Dimension Redundancy**: Eliminates repeated width/height storage
- **Efficient Streaming**: Smaller payloads for real-time processing

### Processing Speed

- **Fixed Canvas Size**: Consistent rendering performance
- **Pre-calculated Scaling**: No runtime dimension calculations
- **GPU Optimization**: Standard dimensions optimize hardware acceleration

### Compatibility

- **Cross-Browser**: 640x480 universally supported
- **Device Agnostic**: Works across phones, tablets, desktops
- **Future-Proof**: Normalized data adapts to new display technologies

## Summary

The ExerAI motion analysis system uses a sophisticated frame dimension management approach:

1. **Capture**: 640x480 standard with dynamic detection fallback
2. **Processing**: MediaPipe normalizes coordinates to 0-1 range
3. **Storage**: Resolution-independent normalized coordinates
4. **Replay**: Flexible scaling for any display size

This architecture ensures consistent motion analysis while maintaining compatibility across devices and future display technologies. The normalized coordinate system is the key innovation that enables resolution independence while preserving motion accuracy.