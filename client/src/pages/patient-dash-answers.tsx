import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, CheckCircle, Info } from 'lucide-react';
import { PatientHeader } from '@/components/patient-header';

// DASH questions - these are the standard questions used
const DASH_QUESTIONS = [
  "Open a tight or new jar",
  "Write",
  "Turn a key",
  "Prepare a meal",
  "Push open a heavy door",
  "Place an object on a shelf above your head",
  "Do heavy household chores (e.g., wash walls, floors)",
  "Garden or do yard work",
  "Make a bed",
  "Carry a shopping bag or briefcase",
  "Carry a heavy object (over 10 lbs)",
  "Change a light bulb overhead",
  "Wash or blow dry your hair",
  "Wash your back",
  "Put on a pullover sweater",
  "Use a knife to cut food",
  "Recreational activities which require little effort (e.g., cardplaying, knitting, etc.)",
  "Recreational activities in which you take some force or impact through your arm, shoulder or hand (e.g., golf, hammering, tennis, etc.)",
  "Recreational activities in which you move your arm freely (e.g., playing frisbee, badminton, etc.)",
  "Manage transportation needs (getting from one place to another)",
  "Sexual activities",
  "During the past week, to what extent has your arm, shoulder or hand problem interfered with your normal social activities with family, friends, neighbors or groups?",
  "During the past week, were you limited in your work or other regular daily activities as a result of your arm, shoulder or hand problem?",
  "Arm, shoulder or hand pain",
  "Arm, shoulder or hand pain when you performed any specific activity",
  "Tingling (pins and needles) in your arm, shoulder or hand",
  "Weakness in your arm, shoulder or hand",
  "Stiffness in your arm, shoulder or hand",
  "During the past week, how much difficulty have you had sleeping as a result of the pain in your arm, shoulder or hand?",
  "I feel less capable, less confident or less useful because of my arm, shoulder or hand problem"
];

const DIFFICULTY_LABELS = [
  "No Difficulty",
  "Mild Difficulty", 
  "Moderate Difficulty",
  "Severe Difficulty",
  "Unable"
];

export default function PatientDashAnswers() {
  const { userCode, assessmentId } = useParams<{ userCode: string; assessmentId: string }>();
  
  const { data: assessmentData, isLoading } = useQuery({
    queryKey: [`/api/user-assessments/${assessmentId}/details`],
    enabled: !!assessmentId,
  });

  const { data: userData } = useQuery({
    queryKey: [`/api/users/by-code/${userCode}`],
    enabled: !!userCode
  });

  const user = (userData as any)?.user;
  const userAssessment = (assessmentData as any)?.userAssessment;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your DASH answers...</p>
        </div>
      </div>
    );
  }

  // Parse DASH responses from the assessment data
  const dashResponses = userAssessment?.responses ? JSON.parse(userAssessment.responses) : {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <PatientHeader 
        patientCode={userCode || ''} 
        patientAlias={user?.alias}
      />
      
      <div className="p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DASH Survey Answers</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Review your responses about arm, shoulder, and hand function
              </p>
            </div>
            <Link href={`/patient/${userCode}/history`}>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to History
              </Button>
            </Link>
          </div>

          {userAssessment ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-900">Survey Completed</h3>
                    <p className="text-sm text-green-700">
                      Completed on {new Date(userAssessment.completedAt).toLocaleDateString()} at{' '}
                      {new Date(userAssessment.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Your Responses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {DASH_QUESTIONS.map((question, index) => {
                      const questionNum = index + 1;
                      const response = dashResponses[`q${questionNum}`];
                      const responseValue = parseInt(response) || 0;
                      
                      return (
                        <div key={questionNum} className="border-b border-gray-200 pb-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-500">Question {questionNum}</span>
                              <p className="text-gray-900 mt-1">{question}</p>
                            </div>
                            <div className="text-right">
                              <Badge 
                                variant="outline" 
                                className={`${
                                  responseValue === 0 ? 'border-green-200 text-green-700 bg-green-50' :
                                  responseValue === 1 ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                  responseValue === 2 ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                                  responseValue === 3 ? 'border-orange-200 text-orange-700 bg-orange-50' :
                                  'border-red-200 text-red-700 bg-red-50'
                                }`}
                              >
                                {DIFFICULTY_LABELS[responseValue] || 'No Response'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-900">About DASH Survey</h3>
                    <p className="text-sm text-blue-700">
                      The DASH (Disabilities of Arm, Shoulder and Hand) survey helps track your functional abilities 
                      and how your condition affects your daily activities. Your responses help guide your recovery plan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Survey Not Found</h3>
                <p className="text-muted-foreground">
                  The requested DASH survey could not be found.
                </p>
                <Link href={`/patient/${userCode}/history`}>
                  <Button variant="outline" className="mt-4">
                    Back to History
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