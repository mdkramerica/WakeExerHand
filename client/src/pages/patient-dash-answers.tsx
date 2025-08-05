import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, CheckCircle, Info } from 'lucide-react';
import { PatientHeader } from '@/components/patient-header';

// Official DASH questions with response types
const DASH_QUESTIONS = [
  { id: 1, question: "Open a tight or new jar.", responseType: "difficulty" },
  { id: 2, question: "Write.", responseType: "difficulty" },
  { id: 3, question: "Turn a key.", responseType: "difficulty" },
  { id: 4, question: "Prepare a meal.", responseType: "difficulty" },
  { id: 5, question: "Push open a heavy door.", responseType: "difficulty" },
  { id: 6, question: "Place an object on a shelf above your head.", responseType: "difficulty" },
  { id: 7, question: "Do heavy household chores (e.g., wash walls, wash floors).", responseType: "difficulty" },
  { id: 8, question: "Garden or do yard work.", responseType: "difficulty" },
  { id: 9, question: "Make a bed.", responseType: "difficulty" },
  { id: 10, question: "Carry a shopping bag or briefcase.", responseType: "difficulty" },
  { id: 11, question: "Carry a heavy object (over 10 lbs).", responseType: "difficulty" },
  { id: 12, question: "Change a lightbulb overhead.", responseType: "difficulty" },
  { id: 13, question: "Wash or blow dry your hair.", responseType: "difficulty" },
  { id: 14, question: "Wash your back.", responseType: "difficulty" },
  { id: 15, question: "Put on a pullover sweater.", responseType: "difficulty" },
  { id: 16, question: "Use a knife to cut food.", responseType: "difficulty" },
  { id: 17, question: "Recreational activities which require little effort (e.g., cardplaying, knitting, etc.).", responseType: "difficulty" },
  { id: 18, question: "Recreational activities in which you take some force or impact through your arm, shoulder or hand (e.g., golf, hammering, tennis, etc.).", responseType: "difficulty" },
  { id: 19, question: "Recreational activities in which you move your arm freely (e.g., playing frisbee, badminton, etc.).", responseType: "difficulty" },
  { id: 20, question: "Manage transportation needs (getting from one place to another).", responseType: "difficulty" },
  { id: 21, question: "Sexual activities.", responseType: "difficulty" },
  { id: 22, question: "During the past week, to what extent has your arm, shoulder or hand problem interfered with your normal social activities with family, friends, neighbours or groups?", responseType: "interference" },
  { id: 23, question: "During the past week, were you limited in your work or other regular daily activities as a result of your arm, shoulder or hand problem?", responseType: "limitation" },
  { id: 24, question: "Arm, shoulder or hand pain.", responseType: "severity" },
  { id: 25, question: "Arm, shoulder or hand pain when you performed any specific activity.", responseType: "severity" },
  { id: 26, question: "Tingling (pins and needles) in your arm, shoulder or hand.", responseType: "severity" },
  { id: 27, question: "Weakness in your arm, shoulder or hand.", responseType: "severity" },
  { id: 28, question: "Stiffness in your arm, shoulder or hand.", responseType: "severity" },
  { id: 29, question: "During the past week, how much difficulty have you had sleeping because of the pain in your arm, shoulder or hand?", responseType: "sleep" },
  { id: 30, question: "I feel less capable, less confident or less useful because of my arm, shoulder or hand problem.", responseType: "agreement" }
];

// Official DASH response labels by type
const RESPONSE_LABELS = {
  difficulty: ["No Difficulty", "Mild Difficulty", "Moderate Difficulty", "Severe Difficulty", "Unable"],
  interference: ["Not at all", "Slightly", "Moderately", "Quite a bit", "Extremely"],
  limitation: ["Not limited at all", "Slightly limited", "Moderately limited", "Very limited", "Unable"],
  severity: ["None", "Mild", "Moderate", "Severe", "Extreme"],
  sleep: ["No difficulty", "Mild difficulty", "Moderate difficulty", "Severe difficulty", "So much difficulty that I can't sleep"],
  agreement: ["Strongly disagree", "Disagree", "Neither agree nor disagree", "Agree", "Strongly agree"]
};

// Helper function to get the correct label for a response
const getResponseLabel = (questionId: number, responseValue: number) => {
  const question = DASH_QUESTIONS.find(q => q.id === questionId);
  if (!question || !question.responseType) return "Unknown";
  
  const labels = RESPONSE_LABELS[question.responseType as keyof typeof RESPONSE_LABELS];
  return labels ? labels[responseValue - 1] || "Unknown" : "Unknown";
};

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
  const dashResponses = userAssessment?.responses 
    ? (typeof userAssessment.responses === 'string' 
        ? JSON.parse(userAssessment.responses) 
        : userAssessment.responses)
    : {};



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
            <Link href={`/patient/${userCode}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
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
                    {DASH_QUESTIONS.map((questionData) => {
                      const questionNum = questionData.id;
                      // Handle both response formats: "q1" format and "1" format
                      const response = dashResponses[`q${questionNum}`] || dashResponses[questionNum.toString()];
                      const responseValue = parseInt(response) || 0;
                      const responseLabel = responseValue > 0 ? getResponseLabel(questionNum, responseValue) : 'No Response';
                      
                      return (
                        <div key={questionNum} className="border-b border-gray-200 pb-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-500">Question {questionNum}</span>
                              <p className="text-gray-900 mt-1">{questionData.question}</p>
                            </div>
                            <div className="text-right">
                              <div className="space-y-2">
                                <Badge 
                                  variant="outline" 
                                  className={`${
                                    responseValue === 0 ? 'border-gray-200 text-gray-700 bg-gray-50' :
                                    responseValue === 1 ? 'border-green-200 text-green-700 bg-green-50' :
                                    responseValue === 2 ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                                    responseValue === 3 ? 'border-orange-200 text-orange-700 bg-orange-50' :
                                    responseValue === 4 ? 'border-red-200 text-red-700 bg-red-50' :
                                    'border-red-300 text-red-800 bg-red-100'
                                  } block text-center`}
                                >
                                  {responseLabel}
                                </Badge>
                                {responseValue > 0 && (
                                  <div className="text-center">
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono">
                                      Score: {responseValue}
                                    </span>
                                  </div>
                                )}
                              </div>
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