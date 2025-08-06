import { useEffect, useRef, useCallback, useState } from "react";
import { calculateElbowReferencedWristAngle, calculateElbowReferencedWristAngleWithForce, resetRecordingSession, getRecordingSessionElbowSelection, resetElbowSessionState } from "@shared/elbow-wrist-calculator";
import { calculateWristDeviation } from "@shared/rom-calculator";
import { SkeletonOverlay } from "./skeleton-overlay";

// MediaPipe type declarations for window object
declare global {
  interface Window {
    Holistic: any;
    Hands: any;
    drawConnectors: any;
    drawLandmarks: any;
  }
}

interface HolisticTrackerProps {
  onUpdate: (data: any) => void;
  isRecording: boolean;
  assessmentType: string;
  sessionMaxWristAngles?: any;
  lockedHandType?: 'LEFT' | 'RIGHT' | 'UNKNOWN';
  showSkeletonOverlay?: boolean;
}

export default function HolisticTracker({ onUpdate, isRecording, assessmentType, sessionMaxWristAngles, lockedHandType, showSkeletonOverlay = true }: HolisticTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const skeletonCanvasRef = useRef<HTMLCanvasElement>(null);
  const holisticRef = useRef<any>(null);
  const animationRef = useRef<number>();
  
  const [holisticInitialized, setHolisticInitialized] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentHandLandmarks, setCurrentHandLandmarks] = useState<any[]>([]);
  const [currentPoseLandmarks, setCurrentPoseLandmarks] = useState<any[]>([]);
  
  // Add frame dimension tracking
  const [frameWidth, setFrameWidth] = useState<number>(640);
  const [frameHeight, setFrameHeight] = useState<number>(480);
  
  // Add temporal stability for hand type detection
  const lastHandTypeRef = useRef<'LEFT' | 'RIGHT' | 'UNKNOWN'>('UNKNOWN');
  const handTypeConfidenceRef = useRef(0);

  const isWristAssessment = assessmentType?.toLowerCase().includes('wrist');
  const isRadialUlnarDeviation = assessmentType?.toLowerCase().includes('radial') || assessmentType?.toLowerCase().includes('ulnar') || assessmentType?.toLowerCase().includes('deviation');

  // Use locked hand type when recording starts, or reset if none provided
  useEffect(() => {
    if (isRecording) {
      // Reset elbow session state to ensure correct anatomical matching
      resetElbowSessionState();
      
      if (lockedHandType && lockedHandType !== 'UNKNOWN') {
        lastHandTypeRef.current = lockedHandType;
        handTypeConfidenceRef.current = 1;
        console.log(`🔒 Using locked hand type for recording: ${lockedHandType}`);
      } else {
        lastHandTypeRef.current = 'UNKNOWN';
        handTypeConfidenceRef.current = 0;
        console.log('No locked hand type provided, resetting for new recording');
      }
      resetRecordingSession(); // Clear elbow session lock for new recording
    }
  }, [isRecording, lockedHandType]);

  // CDN fallback loader
  const loadMediaPipeFromCDN = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js';
      script.onload = () => {
        // Wait a bit for the script to initialize
        setTimeout(() => {
          if ((window as any).Holistic) {
            resolve();
          } else {
            reject(new Error('Holistic not available after CDN load'));
          }
        }, 500);
      };
      script.onerror = () => reject(new Error('Failed to load MediaPipe from CDN'));
      document.head.appendChild(script);
    });
  };

  // Wait for MediaPipe availability following implementation guide
  const waitForMediaPipeAvailability = async (): Promise<void> => {
    let attempts = 0;
    const maxAttempts = 15;
    
    while (attempts < maxAttempts) {
      // Check if already available from preloaded scripts
      if ((window as any).Holistic || (window as any).Hands) {
        const available = [];
        if ((window as any).Holistic) available.push('Holistic');
        if ((window as any).Hands) available.push('Hands');
        console.log(`✓ MediaPipe found from preloaded scripts: ${available.join(', ')}`);
        return;
      }
      
      // Try dynamic import for local development (first 5 attempts)
      if (attempts < 5) {
        try {
          const [holisticModule, handsModule, drawingModule] = await Promise.all([
            import('@mediapipe/holistic').catch(() => null),
            import('@mediapipe/hands').catch(() => null),
            import('@mediapipe/drawing_utils').catch(() => null)
          ]);
          
          if (holisticModule?.Holistic) {
            (window as any).Holistic = holisticModule.Holistic;
            console.log('✓ MediaPipe Holistic loaded via dynamic import');
          }
          
          if (handsModule?.Hands) {
            (window as any).Hands = handsModule.Hands;
            console.log('✓ MediaPipe Hands loaded via dynamic import');
          }
          
          if (drawingModule?.drawConnectors) {
            (window as any).drawConnectors = drawingModule.drawConnectors;
            (window as any).drawLandmarks = drawingModule.drawLandmarks;
            console.log('✓ MediaPipe drawing utilities loaded');
          }
          
          if ((window as any).Holistic || (window as any).Hands) {
            return;
          }
        } catch (importError) {
          console.warn(`Dynamic import attempt ${attempts + 1} failed:`, importError);
        }
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    throw new Error('MediaPipe could not be loaded after maximum attempts');
  };

  // Initialize MediaPipe following Implementation Guide best practices
  const initializeHolistic = useCallback(async () => {
    if (isInitializing || holisticInitialized) return;
    
    setIsInitializing(true);
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('MediaPipe requires browser environment');
      }

      // Wait for MediaPipe to be available using progressive loading strategy
      await waitForMediaPipeAvailability();
      
      // Strategy 1: MediaPipe Holistic with robust error handling (for full pose + hands)
      if ((window as any).Holistic) {
        console.log('🚀 Initializing MediaPipe Holistic with enhanced stability');
        
        try {
          const holisticInstance = new (window as any).Holistic({
            locateFile: (file: string) => {
              // Use stable CDN path without version numbers
              console.log(`Loading MediaPipe file: ${file}`);
              return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
            }
          });

          // Enhanced Holistic configuration for stability
          holisticInstance.setOptions({
            modelComplexity: 1,           // Full model for complete tracking
            smoothLandmarks: true,        // Enable smoothing for stable tracking
            enableSegmentation: false,    // Disable segmentation to reduce memory
            smoothSegmentation: false,
            refineFaceLandmarks: false,   // Disable face processing for focus on hands/pose
            minDetectionConfidence: 0.5,  // Balanced detection
            minTrackingConfidence: 0.5,   // Balanced tracking
            minPresenceConfidence: 0.5    // Presence threshold
          });
          
          holisticInstance.onResults((results: any) => {
            processHolisticResults(results);
          });

          holisticRef.current = holisticInstance;
          setHolisticInitialized(true);
          console.log('✓ MediaPipe Holistic initialized successfully with pose + hands tracking');
          return;
        } catch (holisticError) {
          console.warn('⚠ Holistic initialization failed, trying fallback approach:', holisticError);
          
          // Fallback: Try with minimal configuration
          try {
            const minimalHolisticInstance = new (window as any).Holistic({
              locateFile: (file: string) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
              }
            });

            minimalHolisticInstance.setOptions({
              modelComplexity: 0,           // Minimal model
              smoothLandmarks: false,       
              enableSegmentation: false,    
              smoothSegmentation: false,
              refineFaceLandmarks: false,   
              minDetectionConfidence: 0.7,  
              minTrackingConfidence: 0.5
            });
            
            minimalHolisticInstance.onResults((results: any) => {
              processHolisticResults(results);
            });

            holisticRef.current = minimalHolisticInstance;
            setHolisticInitialized(true);
            console.log('✓ MediaPipe Holistic initialized with minimal configuration');
            return;
          } catch (fallbackError) {
            console.warn('⚠ Minimal Holistic also failed, falling back to Hands:', fallbackError);
          }
        }
      }

      // Strategy 2: MediaPipe Hands fallback (hands-only tracking)
      if ((window as any).Hands) {
        console.log('🔄 Falling back to MediaPipe Hands (hands-only tracking)');
        
        const handsInstance = new (window as any).Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });

        handsInstance.setOptions({
          maxNumHands: 2,               
          modelComplexity: 1,           
          minDetectionConfidence: 0.5,  
          minTrackingConfidence: 0.5,   
          staticImageMode: false,       
          selfieMode: true             
        });
        
        handsInstance.onResults((results: any) => {
          // Convert hands results to holistic-compatible format
          const holisticResults = {
            leftHandLandmarks: null,
            rightHandLandmarks: null,
            poseLandmarks: null // No pose data available with hands-only
          };
          
          if (results.multiHandLandmarks && results.multiHandedness) {
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
              const handedness = results.multiHandedness[i];
              const landmarks = results.multiHandLandmarks[i];
              
              if (handedness.label === 'Left') {
                holisticResults.leftHandLandmarks = landmarks;
              } else if (handedness.label === 'Right') {
                holisticResults.rightHandLandmarks = landmarks;
              }
            }
          }
          
          processHolisticResults(holisticResults);
        });

        holisticRef.current = handsInstance;
        setHolisticInitialized(true);
        console.log('✓ MediaPipe Hands fallback initialized - limited to hands tracking');
        return;
      }

      throw new Error('No MediaPipe tracking solutions available');

    } catch (error) {
      console.error('❌ Complete MediaPipe initialization failure:', error);
      setHolisticInitialized(false);
      
      onUpdate({
        error: 'Camera tracking initialization failed. Please refresh the page and ensure stable internet connection.',
        trackingAvailable: false,
        frameWidth: frameWidth,
        frameHeight: frameHeight,
        recordingResolution: `${frameWidth}x${frameHeight}`
      });
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, holisticInitialized]);

  // Process holistic results only during recording
  const processHolisticResults = useCallback((results: any) => {
    let handLandmarks: any[] = [];
    let poseLandmarks: any[] = [];
    let handDetected = false;
    let trackingQuality = "Poor";

    // Process pose landmarks (including elbow data)
    if (results.poseLandmarks) {
      poseLandmarks = results.poseLandmarks;
      trackingQuality = "Good";
    }

    // Process hand landmarks
    if (results.leftHandLandmarks || results.rightHandLandmarks) {
      handDetected = true;
      handLandmarks = results.rightHandLandmarks || results.leftHandLandmarks;
      
      if (handLandmarks) {
        trackingQuality = poseLandmarks.length > 0 ? "Excellent" : "Good";
      }
    }

    // Update skeleton overlay landmarks
    setCurrentHandLandmarks(handLandmarks || []);
    setCurrentPoseLandmarks(poseLandmarks || []);

    // Calculate wrist angles using elbow reference only during recording
    let wristAngles = null;
    let wristDeviation = null;
    let currentDetection: any = null;
    
    if (isRecording && isWristAssessment && handLandmarks.length > 0) {
      // First get the initial hand type detection
      currentDetection = calculateElbowReferencedWristAngle(
        handLandmarks.map((landmark: any) => ({
          x: landmark.x,
          y: landmark.y,
          z: landmark.z
        })),
        poseLandmarks.map((landmark: any) => ({
          x: landmark.x,
          y: landmark.y,
          z: landmark.z,
          visibility: landmark.visibility
        }))
      );
      
      // Only attempt new hand type detection if no locked hand type exists
      if (lastHandTypeRef.current === 'UNKNOWN') {
        // Force detection based on any available pose landmarks
        if (poseLandmarks && poseLandmarks.length > 16) {
          const leftElbow = poseLandmarks[13];
          const rightElbow = poseLandmarks[14];
          const leftWrist = poseLandmarks[15];
          const rightWrist = poseLandmarks[16];
          
          if (leftElbow && rightElbow && (leftElbow.visibility || 0) > 0.1 && (rightElbow.visibility || 0) > 0.1) {
            // Force detection based on elbow visibility scores
            const forceHandType = (leftElbow.visibility || 0) > (rightElbow.visibility || 0) ? 'LEFT' : 'RIGHT';
            lastHandTypeRef.current = forceHandType;
            handTypeConfidenceRef.current = 1;
            console.log(`🔒 FORCE LOCKED onto ${forceHandType} hand based on elbow visibility (L:${(leftElbow.visibility || 0).toFixed(2)} vs R:${(rightElbow.visibility || 0).toFixed(2)})`);
          }
        }
        
        // Secondary locking for valid detections only if no lock exists
        if (currentDetection && currentDetection.handType !== 'UNKNOWN') {
          lastHandTypeRef.current = currentDetection.handType;
          handTypeConfidenceRef.current = 1;
          console.log(`🔒 DETECTION LOCKED onto ${currentDetection.handType} hand`);
        }
      } else {
        console.log(`🔒 MAINTAINING LOCKED HAND TYPE: ${lastHandTypeRef.current} (ignoring new detection: ${currentDetection?.handType})`);
      }
      
      // Debug logging to track detection issues
      if ((currentDetection && currentDetection.handType !== 'UNKNOWN') || lastHandTypeRef.current !== 'UNKNOWN') {
        console.log(`🔍 Hand Detection - Current: ${currentDetection?.handType || 'UNKNOWN'}, Locked: ${lastHandTypeRef.current}, Confidence: ${currentDetection?.confidence?.toFixed(3) || '0'}`);
      }
      
      // Calculate wrist angles for wrist assessments during recording
      wristAngles = null;
      
      if ((isWristAssessment || isRadialUlnarDeviation) && handLandmarks.length >= 21 && poseLandmarks.length > 16) {
        // Use locked hand type if available, otherwise use current detection
        const handTypeForCalculation = lastHandTypeRef.current !== 'UNKNOWN' ? lastHandTypeRef.current : currentDetection.handType;
        
        if (handTypeForCalculation !== 'UNKNOWN') {
          console.log(`🎯 WRIST ASSESSMENT - Calling calculation with hand type: ${handTypeForCalculation}`);
          
          // Calculate flexion/extension for regular wrist assessments
          if (isWristAssessment && !isRadialUlnarDeviation) {
            wristAngles = calculateElbowReferencedWristAngleWithForce(
              handLandmarks.map((landmark: any) => ({
                x: landmark.x,
                y: landmark.y,
                z: landmark.z
              })),
              poseLandmarks.map((landmark: any) => ({
                x: landmark.x,
                y: landmark.y,
                z: landmark.z,
                visibility: landmark.visibility
              })),
              handTypeForCalculation
            );
            
            // Ensure hand type is consistent
            if (wristAngles) {
              wristAngles.handType = handTypeForCalculation;
              console.log(`✅ WRIST CALCULATION SUCCESS: Flexion=${wristAngles.wristFlexionAngle?.toFixed(1)}°, Extension=${wristAngles.wristExtensionAngle?.toFixed(1)}°`);
            } else {
              console.log(`❌ WRIST CALCULATION FAILED - returned null`);
            }
          }
          
          // Calculate radial/ulnar deviation for deviation assessments
          if (isRadialUlnarDeviation) {
            const deviation = calculateWristDeviation(
              poseLandmarks.map((landmark: any) => ({
                x: landmark.x,
                y: landmark.y,
                z: landmark.z,
                visibility: landmark.visibility
              })),
              handLandmarks.map((landmark: any) => ({
                x: landmark.x,
                y: landmark.y,
                z: landmark.z,
                visibility: landmark.visibility
              })),
              handTypeForCalculation === 'LEFT'
            );
            
            wristDeviation = {
              deviationAngle: deviation,
              radialDeviation: deviation > 0 ? deviation : 0,
              ulnarDeviation: deviation < 0 ? Math.abs(deviation) : 0,
              handType: handTypeForCalculation,
              confidence: currentDetection?.confidence || 0.8
            };
            
            console.log(`✅ DEVIATION CALCULATION SUCCESS: ${deviation.toFixed(1)}° (${deviation > 0 ? 'Radial' : 'Ulnar'})`);
          }
        } else {
          console.log('⚠️ No hand type available for wrist calculation');
        }
    } else if (handLandmarks.length > 0 && poseLandmarks.length > 0) {
      // For non-wrist assessments or when not recording, still do basic detection
      try {
        currentDetection = calculateElbowReferencedWristAngle(
          handLandmarks.map((landmark: any) => ({
            x: landmark.x,
            y: landmark.y,
            z: landmark.z
          })),
          poseLandmarks.map((landmark: any) => ({
            x: landmark.x,
            y: landmark.y,
            z: landmark.z,
            visibility: landmark.visibility
          }))
        );
      } catch (error) {
        console.warn('Basic hand detection failed:', error);
        currentDetection = { handType: 'UNKNOWN', confidence: 0 };
      }
    }
      
      console.log('🔍 Wrist calculation result:', {
        forearmToHandAngle: wristAngles?.forearmToHandAngle,
        wristFlexionAngle: wristAngles?.wristFlexionAngle,
        wristExtensionAngle: wristAngles?.wristExtensionAngle,
        elbowDetected: wristAngles?.elbowDetected,
        handType: wristAngles?.handType,
        confidence: wristAngles?.confidence
      });
    }

    // Get session elbow selection to store with frame data
    const sessionElbowData = getRecordingSessionElbowSelection();
    
    // Update parent component with tracking data including session elbow selection
    console.log('🔄 Sending update to parent with wrist angles:', wristAngles);
    
    try {
      onUpdate({
        handDetected,
        landmarksCount: handLandmarks.length,
        trackingQuality,
        handPosition: handDetected ? "Holistic-tracked" : "Detecting",
        landmarks: handLandmarks.map((landmark: any) => ({
          x: landmark.x,
          y: landmark.y,
          z: landmark.z
        })),
        poseLandmarks: poseLandmarks.map((landmark: any) => ({
          x: landmark.x,
          y: landmark.y,
          z: landmark.z,
          visibility: landmark.visibility
        })),
        wristAngles,
        wristDeviation: wristDeviation,
        handType: currentDetection?.handType || 'UNKNOWN',
        lockedHandType: lastHandTypeRef.current,
        detectedHandSide: results.leftHandLandmarks ? 'LEFT' : (results.rightHandLandmarks ? 'RIGHT' : 'UNKNOWN'),
        sessionHandType: lastHandTypeRef.current, // Store the locked hand type for session consistency
        sessionElbowIndex: sessionElbowData.elbowIndex,
        sessionWristIndex: sessionElbowData.wristIndex,
        sessionElbowLocked: sessionElbowData.isLocked,
        frameWidth: frameWidth,
        frameHeight: frameHeight,
        recordingResolution: `${frameWidth}x${frameHeight}`
      });
    } catch (error) {
      console.warn('Holistic processing error:', error);
      
      // Fallback data to prevent undefined errors
      onUpdate({
        handDetected: false,
        landmarksCount: 0,
        trackingQuality: "Poor",
        handPosition: "Error",
        landmarks: [],
        poseLandmarks: [],
        wristAngles: null,
        handType: 'UNKNOWN',
        lockedHandType: lastHandTypeRef.current,
        detectedHandSide: 'UNKNOWN',
        sessionElbowIndex: undefined,
        sessionWristIndex: undefined,
        sessionElbowLocked: false,
        frameWidth: frameWidth,
        frameHeight: frameHeight,
        recordingResolution: `${frameWidth}x${frameHeight}`
      });
    }
  }, [isWristAssessment, onUpdate]);



  // Initialize camera with robust error handling
  const startCamera = useCallback(async () => {
    if (!holisticInitialized) {
      console.log('MediaPipe not ready, waiting...');
      return;
    }
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!video || !canvas) {
        console.error('Video or canvas element not found');
        return;
      }

      console.log('🎥 Starting camera initialization...');

      // Get media stream with enhanced constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 15 }
        },
        audio: false
      });

      console.log('📹 Media stream acquired');

      // Get canvas context once
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas 2D context');
      }

      // Enhanced frame processing with separation of concerns
      const processFrame = async () => {
        try {
          // Clear canvas and render video with hand landmarks
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Try to draw video if ready - NO MIRRORING
          if (video.readyState >= 2 && video.videoWidth > 0 && !video.paused && !video.ended) {
            try {
              // Draw video without mirroring
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              // Draw hand landmarks directly on video canvas for immediate feedback
              if (currentHandLandmarks && currentHandLandmarks.length > 0) {
                ctx.fillStyle = '#00FF00';
                currentHandLandmarks.forEach((landmark: any) => {
                  const x = landmark.x * canvas.width; // No mirroring
                  const y = landmark.y * canvas.height;
                  ctx.beginPath();
                  ctx.arc(x, y, 3, 0, 2 * Math.PI);
                  ctx.fill();
                });
              }
              
            } catch (error) {
              console.warn('Video drawing error:', error);
            }
          } else {
            // Show loading state when video isn't ready
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '16px Arial';
            ctx.fillText('Initializing camera...', 20, canvas.height / 2);
          }
          
          // 3. MediaPipe processing (separate from rendering)
          if (holisticRef.current && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            try {
              await holisticRef.current.send({ image: video });
            } catch (error) {
              console.warn('MediaPipe processing error:', error);
            }
          }
          
        } catch (error) {
          console.error('Frame processing error:', error);
        }
        
        // Continue animation loop
        animationRef.current = requestAnimationFrame(processFrame);
      };

      // Setup video element
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      
      // Wait for video metadata and start playback
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video metadata loading timeout'));
        }, 10000);

        video.onloadedmetadata = async () => {
          clearTimeout(timeout);
          
          try {
            console.log(`📐 Video dimensions: ${video.videoWidth}x${video.videoHeight}`);
            
            // Set canvas dimensions to match video
            const width = video.videoWidth || 640;
            const height = video.videoHeight || 480;
            
            canvas.width = width;
            canvas.height = height;
            
            // Store frame dimensions for motion data
            setFrameWidth(width);
            setFrameHeight(height);
            
            console.log(`🎨 Canvas configured: ${width}x${height}`);
            
            // Force video play with multiple attempts
            let playAttempts = 0;
            const tryPlay = async () => {
              try {
                // Add explicit play promise handling
                const playPromise = video.play();
                if (playPromise !== undefined) {
                  await playPromise;
                  console.log('✅ Video playback started successfully');
                  return true;
                } else {
                  console.log('✅ Video play() returned undefined - assuming success');
                  return true;
                }
              } catch (error) {
                playAttempts++;
                console.warn(`⚠ Video play attempt ${playAttempts} failed:`, error);
                
                if (playAttempts < 5) { // Increased attempts
                  await new Promise(resolve => setTimeout(resolve, 200)); // Longer delay
                  return tryPlay();
                }
                return false;
              }
            };
            
            const playSuccess = await tryPlay();
            
            if (!playSuccess) {
              console.warn('Video play failed after 5 attempts, continuing anyway');
            }
            
            // Add a small delay before starting frame processing
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Start rendering regardless of play success
            setCameraReady(true);
            console.log('🚀 Camera ready, starting frame processing');
            
            // Begin frame processing loop
            processFrame();
            
            resolve();
            
          } catch (error) {
            clearTimeout(timeout);
            reject(error);
          }
        };

        video.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Video loading error'));
        };
      });
      
    } catch (error) {
      console.error('❌ Camera initialization failed:', error);
      onUpdate({
        handDetected: false,
        landmarksCount: 0,
        trackingQuality: "Camera Error",
        handPosition: "Failed",
        frameWidth: frameWidth,
        frameHeight: frameHeight,
        recordingResolution: `${frameWidth}x${frameHeight}`
      });
    }
  }, [holisticInitialized, isRecording]);

  // Initialize holistic on mount
  useEffect(() => {
    initializeHolistic();
  }, [initializeHolistic]);

  // Start camera when holistic is ready
  useEffect(() => {
    if (holisticInitialized && !cameraReady) {
      startCamera();
    }
  }, [holisticInitialized, startCamera, cameraReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      const video = videoRef.current;
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3', minHeight: '300px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Video element - hidden but processing for MediaPipe */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ 
          position: 'absolute',
          top: '0',
          left: '0',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none'
        }}
      />
      
      {/* Canvas for video display */}
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 5,
          display: 'block',
          backgroundColor: '#000'
        }}
      />

      {/* Skeleton Overlay - Only when explicitly enabled */}
      {showSkeletonOverlay && cameraReady && (
        <SkeletonOverlay
          canvasRef={skeletonCanvasRef}
          handLandmarks={currentHandLandmarks}
          poseLandmarks={currentPoseLandmarks}
          isVisible={showSkeletonOverlay}
          canvasWidth={640}
          canvasHeight={480}
        />
      )}
      
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 rounded px-2 py-1" style={{ zIndex: 4 }}>
        <div className="text-white text-sm font-semibold">Exer AI</div>
      </div>
      
      <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 rounded px-2 py-1 text-white text-xs" style={{ zIndex: 4 }}>
        <div>Assessment: {assessmentType}</div>
        <div className="text-green-400">
          Holistic: {holisticInitialized ? 'Active' : 'Loading'}
        </div>
        <div className="text-purple-400">
          Video: {cameraReady ? 'Active' : 'Loading'}
        </div>
        {cameraReady && (
          <div className="text-blue-400">
            {isWristAssessment ? 'Elbow + Hand tracking' : 'Multi-modal ready'}
          </div>
        )}
        {isRecording && (
          <div className="text-yellow-400">
            Recording - Processing landmarks
          </div>
        )}
      </div>
    </div>
  );
}