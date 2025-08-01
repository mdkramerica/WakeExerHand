import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Target, User, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

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

  // Fetch DASH assessment data
  const { data: dashData, isLoading, error } = useQuery({
    queryKey: [`/api/admin/dash-results/${patientCode}/${assessmentId}`],
    enabled: !!patientCode && !!assessmentId,
  });

  const assessment = dashData as DashAssessment;

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

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Assessment Not Found</h3>
            <p className="text-gray-600 mb-4">
              The requested DASH assessment could not be found.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.close()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Close Window
            </Button>
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

  const interpretation = getScoreInterpretation(assessment.dashScore);

  // Group answers by difficulty level for better organization
  const groupedAnswers = assessment.answers?.reduce((groups: Record<string, DashAnswer[]>, answer) => {
    const difficulty = answer.difficulty || 'No difficulty';
    if (!groups[difficulty]) groups[difficulty] = [];
    groups[difficulty].push(answer);
    return groups;
  }, {}) || {};

  const difficultyColors: Record<string, string> = {
    'No difficulty': 'bg-green-100 text-green-800',
    'Mild difficulty': 'bg-yellow-100 text-yellow-800', 
    'Moderate difficulty': 'bg-orange-100 text-orange-800',
    'Severe difficulty': 'bg-red-100 text-red-800',
    'Unable': 'bg-red-200 text-red-900'
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
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {assessment.user.alias}
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                {assessment.user.code}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(assessment.completedAt), 'MMM dd, yyyy \'at\' h:mm a')}
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
                  {assessment.dashScore.toFixed(1)}
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
                <div><strong>Injury:</strong> {assessment.user.injuryType}</div>
                <div><strong>Patient ID:</strong> {assessment.user.code}</div>
                <div><strong>Assessment ID:</strong> {assessment.id}</div>
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
                {Object.entries(groupedAnswers).map(([difficulty, answers]) => (
                  <div key={difficulty} className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={`${difficultyColors[difficulty] || 'bg-gray-100 text-gray-800'} text-sm px-3 py-1`}>
                        {difficulty}
                      </Badge>
                      <span className="text-sm text-gray-600">({answers.length} responses)</span>
                    </div>
                    
                    <div className="grid gap-3">
                      {answers.map((answer, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium">{answer.question}</p>
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
                  <strong>This patient's score of {assessment.dashScore.toFixed(1)} indicates {interpretation.level.toLowerCase()} disability.</strong>
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