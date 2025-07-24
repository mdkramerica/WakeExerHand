import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, TrendingUp, History, CheckCircle, PlayCircle, FileText } from 'lucide-react';

import { PatientHeader } from '@/components/patient-header';

interface UserAssessment {
  id: number;
  assessmentName: string;
  completedAt: string;
  qualityScore: number;
  totalActiveRom?: string;
  indexFingerRom?: string;
  middleFingerRom?: string;
  ringFingerRom?: string;
  pinkyFingerRom?: string;
  kapandjiScore?: number;
  maxWristFlexion?: number;
  maxWristExtension?: number;
  maxRadialDeviation?: string;
  maxUlnarDeviation?: string;
  handType?: string;
  sessionNumber?: number;
  repetitionData?: any[];
}

interface HistoryResponse {
  history: UserAssessment[];
}

export default function AssessmentHistory() {
  const { userCode } = useParams<{ userCode: string }>();

  const { data: historyData, isLoading, error } = useQuery<HistoryResponse>({
    queryKey: [`/api/users/by-code/${userCode}/history`],
    enabled: !!userCode,
    staleTime: 0, // Always refetch to get latest data
    gcTime: 0, // Don't cache results
  });

  // Fetch user data for the PatientHeader
  const { data: userData } = useQuery({
    queryKey: [`/api/users/by-code/${userCode}`],
    enabled: !!userCode
  });

  const user = (userData as any)?.user;



  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading assessment history...</p>
        </div>
      </div>
    );
  }

  if (!historyData || !(historyData as any)?.history || (historyData as any).history.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href={`/patient/${userCode}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Assessment History</h3>
              <p className="text-muted-foreground">
                Complete some assessments to see your history here.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Patient Header with Logout */}
      <PatientHeader 
        patientCode={userCode || ''} 
        patientAlias={user?.alias}
      />
      
      <div className="p-4">
        <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assessment History</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Complete record of all your assessments
            </p>
          </div>
          <Link href={`/patient/${userCode}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* History Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{(historyData as any).history.length}</div>
                <div className="text-sm text-muted-foreground">Total Assessments</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {new Set((historyData as any).history.map((h: any) => new Date(h.completedAt).toDateString())).size}
                </div>
                <div className="text-sm text-muted-foreground">Days Active</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Date((historyData as any).history[0]?.completedAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-muted-foreground">Last Assessment</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment History List */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <History className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">Complete History</CardTitle>
                <p className="text-sm text-gray-600">All assessments in chronological order</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(historyData as any).history.map((record: UserAssessment, index: number) => (
                <div
                  key={record.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-green-700">
                          {(historyData as any).history.length - index}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{record.assessmentName}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(record.completedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(record.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {record.handType && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Hand:</span>
                              <span>{record.handType}</span>
                            </div>
                          )}
                        </div>
                        





                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </Badge>
                      


                      {/* View Motion Replay Button - Patient friendly without scores */}
                      <div className="flex flex-col gap-2">
                        {/* Motion Replay Link - show for all non-DASH assessments */}
                        {record.assessmentName !== 'DASH Survey' && (
                          <Link href={`/patient/${userCode}/motion-replay/${record.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-200 hover:bg-green-50 w-full"
                            >
                              <PlayCircle className="w-3 h-3 mr-1" />
                              View Motion
                            </Button>
                          </Link>
                        )}
                        
                        {/* DASH Answers Link - show for DASH surveys */}
                        {record.assessmentName === 'DASH Survey' && (
                          <Link href={`/patient/${userCode}/dash-answers/${record.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-purple-600 border-purple-200 hover:bg-purple-50 w-full"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              View Answers
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}