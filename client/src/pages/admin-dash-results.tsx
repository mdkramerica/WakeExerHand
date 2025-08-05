import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Target, User, Calendar, TrendingUp, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface DashAnswer {
  question: string;
  answer: number;
  difficulty: string;
}

interface DashAssessment {
  id: number;
  userId: number;
  assessmentId: number;
  completedAt: string;
  dashScore: number;
  answers: DashAnswer[];
  user: {
    alias: string;
    code: string;
    injuryType: string;
  };
}

export default function AdminDashResults() {
  const { patientCode, assessmentId } = useParams();
  const { toast } = useToast();

  // Download DASH assessment as PDF
  const handlePdfDownload = () => {
    // Open printable report in new window
    window.open(`/api/user-assessments/${assessmentId}/download-pdf?print=true`, '_blank');
    
    toast({
      title: "Report Opened",
      description: "DASH report opened in new window. Use browser's print function to save as PDF."
    });
  };

  // Use the same working endpoint as patient side - /api/user-assessments/${assessmentId}/details
  const { data: assessmentData, isLoading, error } = useQuery({
    queryKey: [`/api/user-assessments/${assessmentId}/details`],
    enabled: !!assessmentId
  });

  // Extract assessment data using the same structure as the working patient component
  const userAssessment = (assessmentData as any)?.userAssessment;
  const dashScore = userAssessment?.dashScore ? parseFloat(userAssessment.dashScore) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading DASH assessment results...</p>
        </div>
      </div>
    );
  }

  if (error || !userAssessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Assessment Not Found</h3>
            <p className="text-gray-600 mb-4">
              The requested DASH assessment could not be found.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handlePdfDownload}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
              >
                <Download className="h-4 w-4" />
                Download PDF Report
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.close()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Close Window
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // DASH scoring interpretation
  const getScoreInterpretation = (score: number) => {
    if (score >= 70) return { level: 'Severe', color: 'destructive', description: 'Significant disability' };
    if (score >= 40) return { level: 'Moderate', color: 'secondary', description: 'Moderate disability' };
    if (score >= 15) return { level: 'Mild', color: 'default', description: 'Mild disability' };
    return { level: 'Minimal', color: 'default', description: 'Minimal or no disability' };
  };

  const interpretation = getScoreInterpretation(dashScore);

  // Parse actual DASH responses from the assessment data (same as patient view)
  const dashResponses = userAssessment?.responses 
    ? (typeof userAssessment.responses === 'string' 
        ? JSON.parse(userAssessment.responses) 
        : userAssessment.responses)
    : {};

  // Full 30-question DASH questionnaire with response types
  const DASH_QUESTIONS = [
    { id: 1, question: "Open a tight or new jar", responseType: "difficulty" },
    { id: 2, question: "Write", responseType: "difficulty" }, 
    { id: 3, question: "Turn a key", responseType: "difficulty" },
    { id: 4, question: "Prepare a meal", responseType: "difficulty" },
    { id: 5, question: "Push open a heavy door", responseType: "difficulty" },
    { id: 6, question: "Place an object on a shelf above your head", responseType: "difficulty" },
    { id: 7, question: "Do heavy household chores (e.g., wash walls, floors)", responseType: "difficulty" },
    { id: 8, question: "Garden or do yard work", responseType: "difficulty" },
    { id: 9, question: "Make a bed", responseType: "difficulty" },
    { id: 10, question: "Carry a shopping bag or briefcase", responseType: "difficulty" },
    { id: 11, question: "Carry a heavy object (over 10 lbs)", responseType: "difficulty" },
    { id: 12, question: "Change a light bulb overhead", responseType: "difficulty" },
    { id: 13, question: "Wash or blow dry your hair", responseType: "difficulty" },
    { id: 14, question: "Wash your back", responseType: "difficulty" },
    { id: 15, question: "Put on a pullover sweater", responseType: "difficulty" },
    { id: 16, question: "Use a knife to cut food", responseType: "difficulty" },
    { id: 17, question: "Recreational activities which require little effort (e.g., cardplaying, knitting, etc.)", responseType: "difficulty" },
    { id: 18, question: "Recreational activities in which you take some force or impact through your arm, shoulder or hand (e.g., golf, hammering, tennis, etc.)", responseType: "difficulty" },
    { id: 19, question: "Recreational activities in which you move your arm freely (e.g., playing frisbee, badminton, etc.)", responseType: "difficulty" },
    { id: 20, question: "Manage transportation needs (getting from one place to another)", responseType: "difficulty" },
    { id: 21, question: "Sexual activities", responseType: "difficulty" },
    { id: 22, question: "During the past week, to what extent has your arm, shoulder or hand problem interfered with your normal social activities with family, friends, neighbors or groups?", responseType: "interference" },
    { id: 23, question: "During the past week, were you limited in your work or other regular daily activities as a result of your arm, shoulder or hand problem?", responseType: "limitation" },
    { id: 24, question: "Arm, shoulder or hand pain", responseType: "severity" },
    { id: 25, question: "Arm, shoulder or hand pain when you performed any specific activity", responseType: "severity" },
    { id: 26, question: "Tingling (pins and needles) in your arm, shoulder or hand", responseType: "severity" },
    { id: 27, question: "Weakness in your arm, shoulder or hand", responseType: "severity" },
    { id: 28, question: "Stiffness in your arm, shoulder or hand", responseType: "severity" },
    { id: 29, question: "During the past week, how much difficulty have you had sleeping as a result of the pain in your arm, shoulder or hand?", responseType: "sleep" },
    { id: 30, question: "I feel less capable, less confident or less useful because of my arm, shoulder or hand problem", responseType: "agreement" }
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

  const getResponseLabel = (questionId: number, responseValue: number): string => {
    const question = DASH_QUESTIONS.find(q => q.id === questionId);
    if (!question || !question.responseType) return "Unknown";
    
    const labels = RESPONSE_LABELS[question.responseType as keyof typeof RESPONSE_LABELS];
    return labels ? labels[responseValue - 1] || "Unknown" : "Unknown";
  };

  // Convert responses to the format expected by the component
  const answers = DASH_QUESTIONS.map((questionData) => {
    const questionNum = questionData.id;
    // Handle both response formats: "q1" format and "1" format
    const response = dashResponses[`q${questionNum}`] || dashResponses[questionNum.toString()];
    const answerValue = parseInt(response) || 1;
    
    return {
      questionNum: questionNum,
      question: questionData.question,
      answer: answerValue,
      responseLabel: getResponseLabel(questionNum, answerValue),
      responseType: questionData.responseType
    };
  }).filter(answer => answer.answer > 0); // Only show questions with actual responses


  // Group answers by response type for better organization
  const groupedAnswers = answers.reduce((groups: Record<string, any[]>, answer) => {
    const responseType = answer.responseType || 'difficulty';
    if (!groups[responseType]) groups[responseType] = [];
    groups[responseType].push(answer);
    return groups;
  }, {});

  const responseTypeLabels: Record<string, string> = {
    'difficulty': 'Physical Function - Difficulty',
    'interference': 'Social Function - Interference',
    'limitation': 'Role Function - Limitation', 
    'severity': 'Symptoms - Severity',
    'sleep': 'Sleep - Difficulty',
    'agreement': 'Self-Perception - Agreement'
  };

  const responseTypeColors: Record<string, string> = {
    'difficulty': 'bg-blue-100 text-blue-800',
    'interference': 'bg-purple-100 text-purple-800',
    'limitation': 'bg-indigo-100 text-indigo-800',
    'severity': 'bg-orange-100 text-orange-800',
    'sleep': 'bg-teal-100 text-teal-800',
    'agreement': 'bg-green-100 text-green-800'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => window.close()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Close
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DASH Assessment Results</h1>
                <p className="text-gray-600">Disabilities of the Arm, Shoulder and Hand Survey</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={handlePdfDownload}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
              >
                <Download className="h-4 w-4" />
                Download PDF Report
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Patient {patientCode}
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                {patientCode}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(userAssessment.completedAt), 'MMM dd, yyyy \'at\' h:mm a')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Score Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-teal-500">
            <CardHeader className="bg-teal-50">
              <CardTitle className="flex items-center gap-2 text-teal-900">
                <TrendingUp className="h-5 w-5" />
                DASH Score
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-black text-teal-600 mb-2">
                  {dashScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">out of 100</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Disability Level</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center">
                <Badge variant={interpretation.color as any} className="text-lg px-4 py-2 mb-2">
                  {interpretation.level}
                </Badge>
                <div className="text-sm text-gray-600">{interpretation.description}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Patient Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <div><strong>Patient Code:</strong> {patientCode}</div>
                <div><strong>Assessment ID:</strong> {assessmentId}</div>
                <div><strong>Session:</strong> {userAssessment.sessionNumber || 1}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Responses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Question Responses</CardTitle>
            <p className="text-gray-600">Patient responses organized by difficulty level</p>
          </CardHeader>
          <CardContent className="pt-6">
            {Object.keys(groupedAnswers).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No detailed responses available for this assessment.
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedAnswers).map(([responseType, answers]) => (
                  <div key={responseType} className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={`${responseTypeColors[responseType] || 'bg-gray-100 text-gray-800'} text-sm px-3 py-1`}>
                        {responseTypeLabels[responseType] || responseType}
                      </Badge>
                      <span className="text-sm text-gray-600">({answers.length} question{answers.length !== 1 ? 's' : ''})</span>
                    </div>
                    
                    <div className="grid gap-3">
                      {answers.map((answer, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-2 mb-2">
                                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded font-mono">
                                  Q{answer.questionNum}
                                </span>
                              </div>
                              <p className="text-gray-900 font-medium mb-2">{answer.question}</p>
                              <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded border">
                                <span className="font-medium">Response:</span> {answer.responseLabel}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">{answer.answer}</div>
                              <div className="text-xs text-gray-500">Score</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clinical Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Clinical Interpretation</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3">DASH Score Interpretation:</h4>
              <div className="space-y-2 text-blue-800">
                <p><strong>0-15:</strong> Minimal or no disability</p>
                <p><strong>15-40:</strong> Mild disability</p>
                <p><strong>40-70:</strong> Moderate disability</p>
                <p><strong>70-100:</strong> Severe disability</p>
              </div>
              <div className="mt-4 p-4 bg-white rounded border border-blue-300">
                <p className="text-blue-900">
                  <strong>This patient's score of {dashScore.toFixed(1)} indicates {interpretation.level.toLowerCase()} disability.</strong>
                  {interpretation.level === 'Severe' && ' Consider additional interventions and closer monitoring.'}
                  {interpretation.level === 'Moderate' && ' Standard rehabilitation protocols recommended.'}
                  {interpretation.level === 'Mild' && ' Continue current treatment with regular monitoring.'}
                  {interpretation.level === 'Minimal' && ' Excellent progress - maintain current activities.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}