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
import exerLogoPath from "@assets/ExerLogoColor_1750399504621.png";

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

  const getHealthcareStreakMessage = (streak: number) => {
    if (streak >= 30) return "Outstanding dedication to your recovery! Your consistency is truly inspiring.";
    if (streak >= 14) return "Excellent progress! Two weeks of consistent therapy shows real commitment.";
    if (streak >= 7) return "Great work! One full week of consistent assessments is building strong habits.";
    if (streak >= 3) return "You're building momentum! Keep up this excellent consistency.";
    if (streak >= 1) return "Great start! Every day of progress matters in your recovery journey.";
    return "Ready to begin your recovery journey? Complete your first assessment today!";
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

        {/* Clean ExerAI-Branded Streak Card */}
        <div className="relative">
          <Card className="bg-white border-2 border-teal-500 shadow-xl rounded-2xl overflow-hidden">
            {/* Header with ExerAI branding */}
            <div className="bg-teal-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white rounded-lg p-2 shadow-md">
                      <img 
                        src={exerLogoPath} 
                        alt="ExerAI" 
                        className="h-8 w-auto"
                      />
                    </div>
                    <div>
                      <span className="text-white font-bold text-xl">ExerAI</span>
                      <div className="text-teal-100 text-sm font-medium">Recovery Progress</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-white bg-teal-700 px-3 py-2 rounded-lg">
                  <Trophy className="h-5 w-5" />
                  <span className="font-semibold">Day {patient.daysSinceStart}</span>
                </div>
              </div>
            </div>

            <CardContent className="p-8 bg-white">
              {/* Main Streak Display */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-6 mb-6">
                  <div className="p-5 bg-teal-100 rounded-full border-4 border-teal-200">
                    <div className="text-teal-600">
                      {getStreakIcon(streakData?.currentStreak || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-7xl font-black text-gray-900 mb-2 leading-none">
                      {streakData?.currentStreak || 0}
                    </div>
                    <div className="text-xl font-bold text-gray-700">Day Streak</div>
                  </div>
                </div>
                
                {/* Motivational Message */}
                <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-5">
                  <p className="text-lg font-bold text-teal-900">
                    {getHealthcareStreakMessage(streakData?.currentStreak || 0)}
                  </p>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center bg-gray-100 rounded-xl p-6 border-2 border-gray-300">
                  <div className="text-4xl font-black text-gray-900 mb-3">
                    {streakData?.totalCompletions || 0}
                  </div>
                  <div className="text-base font-bold text-gray-800 mb-2">
                    Total Completions
                  </div>
                  <div className="flex items-center justify-center text-teal-700">
                    <Target className="h-4 w-4 mr-2" />
                    <span className="text-sm font-semibold">Building strength</span>
                  </div>
                </div>
                
                <div className="text-center bg-gray-100 rounded-xl p-6 border-2 border-gray-300">
                  <div className="text-4xl font-black text-gray-900 mb-3">
                    {streakData?.longestStreak || 0}
                  </div>
                  <div className="text-base font-bold text-gray-800 mb-2">
                    Best Streak
                  </div>
                  <div className="flex items-center justify-center text-teal-700">
                    <Star className="h-4 w-4 mr-2" />
                    <span className="text-sm font-semibold">Personal record</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Progress Overview */}
        <div className="relative">
          <Card className="bg-white border-2 border-teal-500 shadow-xl rounded-2xl overflow-hidden">
            {/* Header with ExerAI branding */}
            <div className="bg-teal-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white rounded-lg p-2 shadow-md">
                    <Target className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <span className="text-white font-bold text-xl">Today's Progress</span>
                    <div className="text-teal-100 text-sm font-medium">Daily Assessment Tracking</div>
                  </div>
                </div>
                <div className="bg-teal-700 px-4 py-2 rounded-lg">
                  <span className="text-white font-bold text-lg">{completedToday.length} / {totalToday}</span>
                </div>
              </div>
            </div>

            <CardContent className="p-8 bg-white">
              {/* Progress Display */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold text-gray-900">Completed</span>
                  <span className="text-4xl font-black text-gray-900">{completedToday.length} of {totalToday}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="relative mb-6">
                  <div className="h-6 bg-gray-200 rounded-full border-2 border-gray-300">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-lg font-bold text-teal-700">{Math.round(completionPercentage)}% Complete</span>
                  </div>
                </div>
              </div>
              
              {/* Status Alert */}
              {completionPercentage === 100 ? (
                <div className="bg-green-50 border-2 border-green-400 rounded-xl p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-500 rounded-full">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-green-900 mb-1">Outstanding Work!</h4>
                      <p className="text-green-800 font-bold">
                        You've completed all {totalToday} assessments today! Keep building that streak - you're doing amazing work on your recovery journey!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-500 rounded-full">
                      <Clock className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-blue-900 mb-1">Keep Going!</h4>
                      <p className="text-blue-800 font-bold">
                        {todayAssessments.length} assessments remaining today. You've got this! Complete them all to keep your streak going.
                      </p>
                    </div>
                  </div>
                </div>
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
