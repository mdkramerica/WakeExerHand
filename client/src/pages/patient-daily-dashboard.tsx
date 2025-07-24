import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  CheckCircle, 
  Clock, 
  Flame, 
  Trophy, 
  Target,
  Star,
  Zap,
  TrendingUp,
  PlayCircle,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  History,
  Sparkles
} from 'lucide-react';
import { format, startOfDay, isSameDay, differenceInDays } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { PatientHeader } from '@/components/patient-header';

interface DailyAssessment {
  id: number;
  name: string;
  description: string;
  estimatedMinutes: number;
  isRequired: boolean;
  isCompleted: boolean;
  completedAt?: string | null;
  assessmentUrl: string;
  assessmentType?: string;
}

interface DashReminderData {
  isDashDue: boolean;
  daysSinceLastDash: number;
  lastDashScore?: number;
  lastDashDate?: string;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  lastCompletionDate?: string;
}

interface CalendarDay {
  date: string;
  status: 'completed' | 'missed' | 'pending' | 'future';
  completedAssessments: number;
  totalAssessments: number;
}

interface PatientProfile {
  id: number;
  alias: string;
  injuryType: string;
  daysSinceStart: number;
  accessCode: string;
}

export default function PatientDailyDashboard() {
  const { toast } = useToast();
  
  // Helper function to get assessment ID from completed assessments
  const getAssessmentIdFromCompleted = (assessmentName: string) => {
    const history = (assessmentHistory as any)?.history;
    if (!history || !Array.isArray(history)) return null;
    
    const completedAssessment = history.find((item: any) => 
      item.assessmentName === assessmentName
    );
    return completedAssessment?.id;
  };
  const queryClient = useQueryClient();
  const [historyOpen, setHistoryOpen] = useState(false);

  // Get patient profile from URL - handle both /patient/:code and /assessment-list/:code routes
  const pathParts = window.location.pathname.split('/');
  const userCode = pathParts[1] === 'patient' ? pathParts[2] : 
                   pathParts[1] === 'assessment-list' ? pathParts[2] : 
                   sessionStorage.getItem('userCode');

  const { data: patient, isLoading: patientLoading } = useQuery<PatientProfile>({
    queryKey: [`/api/patients/by-code/${userCode}`],
    enabled: !!userCode,
  });

  const { data: todayAssessmentsResponse, isLoading: assessmentsLoading } = useQuery<{assessments: DailyAssessment[]}>({
    queryKey: [`/api/users/${patient?.id}/assessments/today`],
    enabled: !!patient?.id,
  });

  const dailyAssessments: DailyAssessment[] = todayAssessmentsResponse?.assessments || [];

  const { data: streakData } = useQuery<StreakData>({
    queryKey: [`/api/patients/${userCode}/streak`],
    enabled: !!userCode,
  });

  const { data: assessmentHistory } = useQuery({
    queryKey: [`/api/users/by-code/${userCode}/history`],
    enabled: !!userCode && historyOpen,
  });

  // Auto-refresh dashboard when user returns from assessment
  useEffect(() => {
    const handleFocus = () => {
      console.log('Dashboard focus event - refreshing data');
      queryClient.invalidateQueries({ queryKey: [`/api/users/${patient?.id}/assessments/today`] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${userCode}/streak`] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${userCode}/calendar`] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/by-code/${userCode}`] });
    };

    window.addEventListener('focus', handleFocus);
    
    // Also refresh when component mounts (user navigates back)
    const refreshTimer = setTimeout(() => {
      handleFocus();
    }, 100);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearTimeout(refreshTimer);
    };
  }, [patient?.id, userCode, queryClient]);



  const completeAssessmentMutation = useMutation({
    mutationFn: async (assessmentId: number) => {
      return fetch(`/api/patients/${userCode}/complete-assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId, completedAt: new Date().toISOString() }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${userCode}/daily-assessments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${userCode}/streak`] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${userCode}/calendar`] });
      toast({
        title: "Assessment Completed!",
        description: "Great job! Keep up your streak!",
      });
    },
  });

  const today = startOfDay(new Date());
  const todayAssessments = dailyAssessments?.filter(a => !a.isCompleted) || [];
  const completedToday = dailyAssessments?.filter(a => a.isCompleted) || [];
  const totalToday = dailyAssessments?.length || 0;
  const completionPercentage = totalToday > 0 ? (completedToday.length / totalToday) * 100 : 0;

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (streak >= 14) return <Star className="h-5 w-5 text-purple-500" />;
    if (streak >= 7) return <Flame className="h-5 w-5 text-orange-500" />;
    return <Zap className="h-5 w-5 text-blue-500" />;
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return "Legendary! You're unstoppable! 🏆";
    if (streak >= 14) return "Amazing! Two weeks strong! ⭐";
    if (streak >= 7) return "Great! One week streak! 🔥";
    if (streak >= 3) return "Nice! Keep it going! ⚡";
    if (streak >= 1) return "Good start! Build your streak! 💪";
    return "Start your streak today! 🚀";
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'linear-gradient(135deg, #B45309, #D97706)'; // High contrast amber
    if (streak >= 14) return 'linear-gradient(135deg, #7C2D12, #DC2626)'; // High contrast red-brown
    if (streak >= 7) return 'linear-gradient(135deg, #1E40AF, #2563EB)'; // High contrast blue
    if (streak >= 3) return 'linear-gradient(135deg, #166534, #16A34A)'; // High contrast green
    if (streak >= 1) return 'linear-gradient(135deg, #0F766E, #14B8A6)'; // High contrast teal
    return 'linear-gradient(135deg, #374151, #4B5563)'; // High contrast gray
  };

  if (patientLoading || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Patient Header with Logo and Logout */}
      {userCode && <PatientHeader patientCode={userCode} patientAlias={patient?.alias || undefined} />}
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, Patient {userCode}!
            </h1>
            <div className="space-y-1">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Day {patient.daysSinceStart} of Your Recovery Journey
              </p>
              <p className="dark:text-blue-400 font-extrabold text-[18px] text-[#101827]">
                {patient.injuryType}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Gamified Streak Card */}
        <div className="relative">
          {/* Background decorative elements - higher contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 rounded-2xl opacity-20 blur-sm"></div>
          
          <div 
            className="relative w-full rounded-2xl shadow-2xl border-0 p-8 overflow-hidden backdrop-blur-sm"
            style={{ 
              background: `linear-gradient(135deg, ${getStreakColor(streakData?.currentStreak || 0)}, rgba(255,255,255,0.1))`,
              minHeight: '200px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            {/* Animated sparkles for higher streaks - higher contrast */}
            {(streakData?.currentStreak || 0) >= 1 && (
              <div className="absolute inset-0 pointer-events-none">
                <Sparkles className="absolute top-4 left-6 h-6 w-6 text-white animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }} />
                <Sparkles className="absolute top-8 right-8 h-4 w-4 text-white animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s' }} />
                <Sparkles className="absolute bottom-8 left-16 h-5 w-5 text-white animate-bounce" style={{ animationDelay: '1s', animationDuration: '2s' }} />
                <Star className="absolute top-16 right-16 h-3 w-3 text-white animate-ping" style={{ animationDelay: '1.5s' }} />
              </div>
            )}
            
            <div className="flex items-center justify-between h-full relative z-10">
              <div className="flex items-center space-x-8">
                <div className="flex-shrink-0 transform scale-150 p-4 bg-white/30 rounded-full backdrop-blur-sm border-2 border-white/40">
                  {getStreakIcon(streakData?.currentStreak || 0)}
                </div>
                <div>
                  <div 
                    className="text-5xl font-extrabold mb-2 text-white tracking-tight"
                    style={{ 
                      textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.3)'
                    }}
                  >
                    {streakData?.currentStreak || 0}
                    <span className="text-2xl ml-2 font-medium opacity-90">Day Streak</span>
                  </div>
                  <div 
                    className="text-lg font-medium text-white/95 flex items-center space-x-2"
                    style={{ 
                      textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}
                  >
                    <Trophy className="h-5 w-5" />
                    <span>Keep the momentum going!</span>
                  </div>
                </div>
              </div>
              <div className="text-right bg-white/25 rounded-xl p-6 backdrop-blur-sm border border-white/30">
                <div 
                  className="text-6xl font-extrabold text-white mb-2"
                  style={{ 
                    textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                  }}
                >
                  {streakData?.totalCompletions || 0}
                </div>
                <div 
                  className="text-sm font-semibold text-white/95 mb-1"
                  style={{ 
                    textShadow: '0 1px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  Total Completions
                </div>
                <div 
                  className="text-xs text-white/80 flex items-center justify-center space-x-1"
                  style={{ 
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}
                >
                  <Star className="h-3 w-3" />
                  <span>Best: {streakData?.longestStreak || 0} days</span>
                </div>
              </div>
            </div>
            <div 
              className="mt-8 px-8 py-6 rounded-xl relative z-10 text-center"
              style={{ 
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(255,255,255,0.6)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
              }}
            >
              <p 
                className="font-black text-2xl text-white"
                style={{ 
                  textShadow: '2px 2px 8px rgba(0,0,0,0.9)'
                }}
              >
                {getStreakMessage(streakData?.currentStreak || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Today's Progress Overview */}
        <div className="relative">
          <Card className="relative bg-white border-2 border-gray-300 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-900 text-white py-6">
              <CardTitle className="flex items-center space-x-3 text-2xl font-bold">
                <div className="p-3 bg-white/20 rounded-full border border-white/40">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <span className="text-white font-bold text-2xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Today's Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 bg-white">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-800">Completed</span>
                  <span className="text-3xl font-black text-gray-800">{completedToday.length} of {totalToday}</span>
                </div>
                <div className="relative">
                  <Progress value={completionPercentage} className="h-4 bg-gray-200" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full opacity-30"></div>
                </div>
              </div>
              
              {completionPercentage === 100 ? (
                <Alert className="bg-green-100 border-green-600 border-3">
                  <CheckCircle className="h-8 w-8 text-green-700" />
                  <AlertDescription className="text-green-900 font-bold text-lg">
                    Outstanding! You've completed all {totalToday} assessments today! Keep building that streak - you're doing amazing work on your recovery journey!
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-blue-100 border-blue-600 border-3">
                  <Clock className="h-8 w-8 text-blue-700" />
                  <AlertDescription className="text-blue-900 font-bold text-lg">
                    {todayAssessments.length} assessments remaining today. You've got this! Complete them all to keep your streak going.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Today's Assessments */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-3">Today's Assessments</h3>
            <div className="h-2 w-32 bg-gray-800 rounded-full mx-auto"></div>
          </div>
          
          {assessmentsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="rounded-2xl shadow-lg bg-gradient-to-r from-gray-50 to-gray-100">
                  <CardContent className="pt-8">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Completed Assessments */}
              {completedToday.map((assessment) => (
                <div key={assessment.id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <Card className="relative bg-green-50 border-green-600 shadow-xl rounded-2xl overflow-hidden border-3">
                    <CardContent className="pt-8 pb-8">
                      <div className="flex items-center justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-4">
                            <div className="p-4 bg-green-700 rounded-full shadow-lg border-2 border-green-800">
                              <CheckCircle className="h-10 w-10 text-white" />
                            </div>
                            <h4 className="font-black text-green-900 text-3xl">{assessment.name}</h4>
                          </div>
                          <p className="text-lg text-green-800 ml-14 font-bold">{assessment.description}</p>
                          <p className="text-base text-green-700 ml-14 font-bold">
                            Completed on {assessment.completedAt ? format(new Date(assessment.completedAt), 'MMM dd, yyyy \'at\' h:mm a') : ''}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <Badge className="bg-green-700 text-white text-xl px-6 py-3 rounded-full font-black shadow-lg border-2 border-green-800">
                            ✓ Complete
                          </Badge>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {/* Motion Replay Link - for non-DASH assessments */}
                            {assessment.name !== 'DASH Survey' && assessment.userAssessmentId && (
                              <Link href={`/patient/${userCode}/motion-replay/${assessment.userAssessmentId}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50 font-semibold"
                                >
                                  <PlayCircle className="w-3 h-3 mr-1" />
                                  View Motion
                                </Button>
                              </Link>
                            )}
                            
                            {/* DASH Answers Link - for DASH surveys */}
                            {assessment.name === 'DASH Survey' && assessment.userAssessmentId && (
                              <Link href={`/patient/${userCode}/dash-answers/${assessment.userAssessmentId}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-purple-600 border-purple-200 hover:bg-purple-50 font-semibold"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  View Answers
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
              
              {/* Pending Assessments */}
              {todayAssessments.map((assessment) => (
                <div key={assessment.id} className="relative group">
                  <Card className="relative bg-white border-gray-600 border-3 shadow-2xl rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
                    <CardContent className="pt-8 pb-8">
                      <div className="flex items-center justify-between">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <div className="p-4 bg-gray-800 rounded-full shadow-lg border-2 border-gray-900">
                              <PlayCircle className="h-10 w-10 text-white" />
                            </div>
                            <div>
                              <h4 className="font-black text-3xl text-gray-900">{assessment.name}</h4>
                              <div className="flex items-center space-x-3 mt-2">
                                {assessment.isRequired && (
                                  <Badge className="bg-red-700 text-white text-base px-3 py-2 rounded-full font-black border-2 border-red-800">Required</Badge>
                                )}
                                {!assessment.isRequired && (
                                  <Badge className="bg-blue-700 text-white text-base px-3 py-2 rounded-full font-black border-2 border-blue-800">Weekly</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="text-lg text-gray-900 ml-16 font-bold">{assessment.description}</p>
                          <p className="text-base text-gray-800 ml-16 flex items-center space-x-2 font-bold">
                            <Clock className="h-5 w-5" />
                            <span>Estimated time: {assessment.estimatedMinutes} minutes</span>
                          </p>
                        </div>
                        <Link href={assessment.assessmentUrl}>
                          <Button 
                            size="lg" 
                            variant="default"
                            className="px-10 py-6 text-xl font-black rounded-xl"
                          >
                            <PlayCircle className="mr-3 h-6 w-6" />
                            Start Assessment
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
              
              {/* No Assessments Message */}
              {totalToday === 0 && (
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardContent className="pt-8 pb-8 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2 text-lg text-green-800">Perfect rest day! 🌟</h3>
                    <p className="text-sm text-green-600">
                      Take this well-deserved break. Your consistent effort is paying off - recovery includes proper rest too!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Assessment History - Collapsible at Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-lg p-4 hover:bg-gray-100">
                <div className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>View Assessment History</span>
                </div>
                {historyOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              {historyOpen && (assessmentHistory as any)?.history?.length > 0 ? (
                <div className="space-y-3">
                  {((assessmentHistory as any)?.history || []).slice(0, 10).map((item: any) => (
                    <Card key={item.id} className="bg-gray-50">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{item.assessmentName}</h5>
                            <p className="text-sm text-gray-500">
                              Completed {format(new Date(item.completedAt), 'MMM dd, yyyy \'at\' h:mm a')}
                            </p>

                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className="text-xs">
                              Session {item.sessionNumber || 1}
                            </Badge>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              {/* Motion Replay Link - for non-DASH assessments */}
                              {item.assessmentName !== 'DASH Survey' && (
                                <Link href={`/patient/${userCode}/motion-replay/${item.id}`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                  >
                                    <PlayCircle className="w-3 h-3 mr-1" />
                                    View Motion
                                  </Button>
                                </Link>
                              )}
                              
                              {/* DASH Answers Link - for DASH surveys */}
                              {item.assessmentName === 'DASH Survey' && (
                                <Link href={`/patient/${userCode}/dash-answers/${item.id}`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                  >
                                    <FileText className="w-3 h-3 mr-1" />
                                    View Answers
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {((assessmentHistory as any)?.history || []).length > 10 && (
                    <div className="text-center">
                      <Link href={`/patient/${userCode}/history`}>
                        <Button variant="outline" className="mt-2">
                          View All History ({((assessmentHistory as any)?.history || []).length} total)
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : historyOpen && ((assessmentHistory as any)?.history || []).length === 0 ? (
                <Card className="bg-gray-50">
                  <CardContent className="pt-8 pb-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No assessment history yet. Complete your first assessment to get started!</p>
                  </CardContent>
                </Card>
              ) : null}
            </CollapsibleContent>
          </Collapsible>
        </div>

      </div>
    </div>
  );
}
