import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlayCircle, Info, Play, Pause, RotateCcw } from 'lucide-react';
import { PatientHeader } from '@/components/patient-header';

// Simple patient-friendly motion replay component (without clinical analysis)
function PatientMotionReplay({ assessmentName, userAssessmentId, recordingData = [], onClose, handedness = 'Unknown' }: {
  assessmentName: string;
  userAssessmentId?: string;
  recordingData?: any[];
  onClose: () => void;
  handedness?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [framesRendered, setFramesRendered] = useState(new Set<number>());
  const [playbackCompleted, setPlaybackCompleted] = useState(false);
  const logoRef = useRef<HTMLImageElement | null>(null);

  const totalFrames = recordingData.length;
  
  // Load ExerAI logo
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      logoRef.current = img;
    };
    img.src = '/images/LogoColor.png';
  }, []);

  // ExerAI branded canvas drawing function
  const drawFrame = (frameData: any) => {
    const canvas = canvasRef.current;
    if (!canvas || !frameData?.landmarks) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Debug: Log frame rendering for patients (throttled)
    const frameIndex = recordingData.indexOf(frameData);
    if (frameIndex % 30 === 0 || frameIndex === 0 || frameIndex === totalFrames - 1) {
      console.log(`🎨 PATIENT RENDERING FRAME ${frameIndex + 1}/${totalFrames} (${((frameIndex / totalFrames) * 100).toFixed(1)}% complete)`);
    }

    // Clear canvas with ExerAI background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // ExerAI gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f0fdfc'); // teal-50
    gradient.addColorStop(1, '#ccfbf1'); // teal-100
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pose landmarks for assessments requiring anatomical reference points
    const isWristAssessment = assessmentName.toLowerCase().includes('wrist');
    const isForearmAssessment = assessmentName.toLowerCase().includes('forearm') || assessmentName.toLowerCase().includes('pronation') || assessmentName.toLowerCase().includes('supination');
    const isDeviationAssessment = assessmentName.toLowerCase().includes('deviation') || assessmentName.toLowerCase().includes('radial') || assessmentName.toLowerCase().includes('ulnar');
    
    if ((isWristAssessment || isForearmAssessment || isDeviationAssessment) && frameData.poseLandmarks && frameData.poseLandmarks.length > 16) {
      // Get pose landmarks
      const leftShoulder = frameData.poseLandmarks[11];
      const rightShoulder = frameData.poseLandmarks[12];
      const leftElbow = frameData.poseLandmarks[13];
      const rightElbow = frameData.poseLandmarks[14];
      const leftWrist = frameData.poseLandmarks[15];
      const rightWrist = frameData.poseLandmarks[16];
      
      // Use passed handedness to lock anatomical side selection
      const isRightHandAssessment = handedness === 'Right Hand';
      
      // Lock to anatomical side based on hand detection (consistent throughout replay)
      const activeShoulder = isRightHandAssessment ? rightShoulder : leftShoulder;
      const activeElbow = isRightHandAssessment ? rightElbow : leftElbow;
      const activeWrist = isRightHandAssessment ? rightWrist : leftWrist;
      
      // Draw anatomical reference lines
      if (activeShoulder && activeElbow && activeWrist && 
          activeShoulder.visibility > 0.3 && activeElbow.visibility > 0.3 && activeWrist.visibility > 0.3) {
        
        const shoulderX = activeShoulder.x * canvas.width;
        const shoulderY = activeShoulder.y * canvas.height;
        const elbowX = activeElbow.x * canvas.width;
        const elbowY = activeElbow.y * canvas.height;
        const wristX = activeWrist.x * canvas.width;
        const wristY = activeWrist.y * canvas.height;
        
        // Draw upper arm reference line (shoulder to elbow)
        ctx.strokeStyle = '#0F766E'; // Dark teal for upper arm
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 4]); // Different dash pattern for upper arm
        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(elbowX, elbowY);
        ctx.stroke();
        
        // Draw forearm reference line (elbow to wrist)
        ctx.setLineDash([5, 5]); // Original dash pattern for forearm
        ctx.beginPath();
        ctx.moveTo(elbowX, elbowY);
        ctx.lineTo(wristX, wristY);
        ctx.stroke();
        ctx.setLineDash([]); // Reset to solid line
        
        // Draw shoulder point
        ctx.fillStyle = '#0F766E';
        ctx.shadowColor = '#0F766E';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(shoulderX, shoulderY, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Draw elbow point
        ctx.beginPath();
        ctx.arc(elbowX, elbowY, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Label the anatomical points based on assessment type
        if (isForearmAssessment) {
          // Full kinetic chain for forearm rotation
          ctx.fillStyle = '#0F766E';
          ctx.font = 'bold 14px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('Shoulder', shoulderX, shoulderY - 18);
          ctx.fillText('Elbow', elbowX, elbowY - 15);
        } else if (isDeviationAssessment) {
          // Shoulder and elbow for wrist deviation reference
          ctx.fillStyle = '#0F766E';
          ctx.font = 'bold 14px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('Shoulder', shoulderX, shoulderY - 18);
          ctx.fillText('Elbow', elbowX, elbowY - 15);
        } else if (isWristAssessment) {
          // Only elbow for flexion/extension assessments
          ctx.fillStyle = '#0F766E';
          ctx.font = 'bold 14px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('Elbow', elbowX, elbowY - 15);
        }
      }
    }

    // Draw hand connections with ExerAI brand color
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // index
      [0, 9], [9, 10], [10, 11], [11, 12], // middle
      [0, 13], [13, 14], [14, 15], [15, 16], // ring
      [0, 17], [17, 18], [18, 19], [19, 20] // pinky
    ];

    ctx.strokeStyle = '#14B8A6'; // ExerAI brand teal
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    connections.forEach(([start, end]) => {
      if (frameData.landmarks[start] && frameData.landmarks[end]) {
        const startX = frameData.landmarks[start].x * canvas.width;
        const startY = frameData.landmarks[start].y * canvas.height;
        const endX = frameData.landmarks[end].x * canvas.width;
        const endY = frameData.landmarks[end].y * canvas.height;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    });

    // Draw hand landmarks with ExerAI styling
    frameData.landmarks.forEach((landmark: any, index: number) => {
      const x = landmark.x * canvas.width;
      const y = landmark.y * canvas.height;
      
      // Joint-specific coloring
      let fillColor = '#14B8A6'; // Default teal
      let size = 4;
      
      // Fingertips get special highlighting
      if ([4, 8, 12, 16, 20].includes(index)) {
        fillColor = '#0D9488'; // darker teal for fingertips
        size = 6;
      } else if (index === 0) {
        fillColor = '#0F766E'; // darkest teal for wrist
        size = 8;
        
        // Label the wrist point for all anatomical assessments
        if (isWristAssessment || isForearmAssessment || isDeviationAssessment) {
          ctx.fillStyle = '#0F766E';
          ctx.font = 'bold 14px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('Wrist', x, y + 25);
        }
      }
      
      // Draw landmark with subtle glow effect
      ctx.shadowColor = fillColor;
      ctx.shadowBlur = 8;
      ctx.fillStyle = fillColor;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
    });

    // Draw ExerAI logo watermark with proper aspect ratio
    if (logoRef.current) {
      // Calculate logo dimensions maintaining aspect ratio
      const logoHeight = 30; // Fixed height
      const aspectRatio = logoRef.current.width / logoRef.current.height;
      const logoWidth = logoHeight * aspectRatio;
      
      const logoX = canvas.width - logoWidth - 10; // Position from right edge
      const logoY = canvas.height - logoHeight - 10; // Position from bottom edge
      
      // Add semi-transparent overlay for better visibility
      ctx.globalAlpha = 0.7;
      ctx.drawImage(logoRef.current, logoX, logoY, logoWidth, logoHeight);
      ctx.globalAlpha = 1.0; // Reset alpha
    } else {
      // Fallback to text if logo hasn't loaded yet
      ctx.fillStyle = 'rgba(20, 184, 166, 0.3)';
      ctx.font = 'bold 16px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText('ExerAI', canvas.width - 10, canvas.height - 10);
    }
  };

  // Play/pause controls
  const togglePlayback = () => {
    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => {
          // Frame-perfect playback: ensure ALL frames are rendered
          const nextFrame = prev + 1;
          if (nextFrame >= totalFrames) {
            setIsPlaying(false);
            setPlaybackCompleted(true);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            console.log(`🎬 PATIENT PLAYBACK COMPLETE: All ${totalFrames} frames rendered`);
            return totalFrames - 1; // Ensure we show the last frame
          }
          
          // Track frame rendering
          setFramesRendered(rendered => {
            const newSet = new Set(rendered);
            newSet.add(nextFrame);
            return newSet;
          });
          
          return nextFrame;
        });
      }, 33); // Real-time 30 fps playbook
      
      console.log(`🎬 PATIENT PLAYBACK STARTED: ${totalFrames} frames at 30fps`);
    }
  };

  const resetPlayback = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentFrame(0);
    setFramesRendered(new Set<number>());
    setPlaybackCompleted(false);
    console.log('🔄 PATIENT PLAYBACK RESET: Frame counter and tracking cleared');
  };

  // Draw current frame
  useEffect(() => {
    if (recordingData[currentFrame]) {
      drawFrame(recordingData[currentFrame]);
    }
  }, [currentFrame, recordingData]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-bold text-black text-lg">Motion Replay</h3>
            <p className="text-base text-gray-900 font-medium">
              Review your recorded movement for the {assessmentName} assessment. 
              Watch how your hand moved during the test.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black font-bold text-xl">
            <PlayCircle className="w-5 h-5" />
            {assessmentName} Motion Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalFrames > 0 ? (
            <div className="space-y-4">
              {/* Canvas for motion display */}
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={400}
                  className="border-2 border-gray-300 rounded-xl shadow-lg"
                  style={{ background: 'white' }}
                />
              </div>

              {/* ExerAI branded playback controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={togglePlayback}
                  variant={isPlaying ? "secondary" : "default"}
                  size="lg"
                  className="px-8 bg-blue-600 hover:bg-blue-700 text-white border-0 font-semibold text-lg"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Play
                    </>
                  )}
                </Button>

                <Button 
                  onClick={resetPlayback} 
                  variant="outline" 
                  size="lg"
                  className="border-gray-600 text-black hover:bg-gray-100 font-semibold"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>

              {/* Frame counter */}
              <div className="text-center text-base text-black font-semibold">
                Frame {currentFrame + 1} of {totalFrames}
              </div>
              
              {/* Frame completion indicator */}
              {playbackCompleted && (
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg mx-4">
                  <span>✓</span>
                  <span>Complete: All {totalFrames} frames shown</span>
                </div>
              )}
              
              {isPlaying && framesRendered.size > 0 && (
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg mx-4">
                  <span>🎬</span>
                  <span>Showing: {framesRendered.size}/{totalFrames} frames ({((framesRendered.size / totalFrames) * 100).toFixed(1)}%)</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No motion data available for replay</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={onClose} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default function PatientMotionReplayPage() {
  const { userCode, assessmentId } = useParams<{ userCode: string; assessmentId: string }>();
  
  const { data: assessmentData, isLoading } = useQuery({
    queryKey: [`/api/user-assessments/${assessmentId}/details`],
    enabled: !!assessmentId,
  });

  const { data: motionData, isLoading: isLoadingMotion } = useQuery({
    queryKey: [`/api/user-assessments/${assessmentId}/motion-data`],
    enabled: !!assessmentId,
  });

  const { data: userData } = useQuery({
    queryKey: [`/api/users/by-code/${userCode}`],
    enabled: !!userCode
  });

  const user = (userData as any)?.user;
  const userAssessment = (assessmentData as any)?.userAssessment;
  const motionFrames = (motionData as any)?.motionData || [];

  // Format assessment date and time
  const formatAssessmentDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  // Detect handedness from motion data - corrected logic to match MediaPipe coordinate system
  const detectHandedness = () => {
    if (!motionFrames.length || !motionFrames[0]?.landmarks) return 'Unknown';
    
    // Use first frame to detect handedness
    const landmarks = motionFrames[0].landmarks;
    if (!landmarks[0]) return 'Unknown';
    
    // MediaPipe handedness detection based on thumb position relative to other fingers
    const thumbTip = landmarks[4]; // Thumb tip
    const indexMcp = landmarks[5]; // Index MCP
    
    if (thumbTip && indexMcp) {
      // Corrected MediaPipe handedness detection logic:
      // MediaPipe shows a mirror view, so when you raise your RIGHT hand:
      // - Your thumb appears on the RIGHT side of your fingers in the coordinate system
      // - When you raise your LEFT hand, thumb appears on the LEFT side
      return thumbTip.x > indexMcp.x ? 'Right Hand' : 'Left Hand';
    }
    
    return 'Unknown';
  };

  if (isLoading || isLoadingMotion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading motion replay...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:from-gray-900 dark:to-gray-800">
      <PatientHeader 
        patientCode={userCode || ''} 
        patientAlias={user?.alias}
      />
      
      <div className="p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">Motion Review</h1>
              <p className="text-gray-800 dark:text-gray-300 mt-1 font-medium">
                Review your recorded movement for better understanding
              </p>
            </div>
            <Link href={`/patient/${userCode}`}>
              <Button variant="outline" className="flex items-center gap-2 border-gray-600 text-black font-semibold hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {userAssessment ? (
            <div className="space-y-6">
              {/* Assessment Information Card */}
              <Card className="bg-white border-2 border-gray-300 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-black text-xl font-bold">
                        {userAssessment.assessmentName || 'Assessment'} Recording
                      </CardTitle>
                      <CardDescription className="text-gray-800 font-medium text-base">
                        Recorded on {userAssessment.completedAt ? formatAssessmentDateTime(userAssessment.completedAt).date : 'Unknown Date'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
                      <div className="font-bold text-black text-sm">Date</div>
                      <div className="text-gray-900 font-medium">
                        {userAssessment.completedAt ? formatAssessmentDateTime(userAssessment.completedAt).date : 'Unknown'}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
                      <div className="font-bold text-black text-sm">Time</div>
                      <div className="text-gray-900 font-medium">
                        {userAssessment.completedAt ? formatAssessmentDateTime(userAssessment.completedAt).time : 'Unknown'}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
                      <div className="font-bold text-black text-sm">Assessment</div>
                      <div className="text-gray-900 font-medium">
                        {userAssessment.assessmentName || 'Unknown Assessment'}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
                      <div className="font-bold text-black text-sm">Handedness</div>
                      <div className="text-gray-900 font-medium">
                        {detectHandedness()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <PatientMotionReplay
                assessmentName={userAssessment.assessmentName || 'Assessment'}
                userAssessmentId={assessmentId}
                recordingData={motionFrames}
                onClose={() => window.location.href = `/patient/${userCode}`}
                handedness={detectHandedness()}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Assessment Not Found</h3>
                <p className="text-muted-foreground">
                  The requested assessment could not be found.
                </p>
                <Link href={`/patient/${userCode}`}>
                  <Button variant="outline" className="mt-4">
                    Back to Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}