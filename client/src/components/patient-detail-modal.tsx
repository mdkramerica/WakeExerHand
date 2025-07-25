import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, Eye, Trash2, Archive, Calendar, Clock, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PatientDetailModalProps {
  patient: any;
  isOpen: boolean;
  onClose: () => void;
}

interface Assessment {
  id: number;
  assessmentName: string;
  completedAt: string;
  qualityScore: number;
  romData?: any;
  repetitionData?: any;
}

export function PatientDetailModal({ patient, isOpen, onClose }: PatientDetailModalProps) {
  const [selectedAssessments, setSelectedAssessments] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Helper function to calculate compliance metrics
  const calculateComplianceMetrics = (assessments: Assessment[], patient: any) => {
    if (!assessments.length || !patient.surgeryDate) {
      return { complianceRate: 0, daysCompleted: 0, totalDays: 0 };
    }

    // Get assessment assignment count based on injury type (including DASH survey)
    const getAssignedAssessmentCount = (injuryType: string): number => {
      const assignments: Record<string, number> = {
        'Carpal Tunnel': 6,     // assessments 1,2,3,4,5 + DASH survey
        'Tennis Elbow': 3,      // assessments 1,3 + DASH survey
        'Golfer\'s Elbow': 3,   // assessments 1,3 + DASH survey
        'Trigger Finger': 3,    // assessments 1,2 + DASH survey
        'Wrist Fracture': 6,    // assessments 1,2,3,4,5 + DASH survey
        'Tendon Injury': 6,     // assessments 1,2,3,4,5 + DASH survey
        'Distal Radius Fracture': 6, // assessments 1,2,3,4,5 + DASH survey
      };
      return assignments[injuryType] || 3;
    };

    // Calculate days since surgery
    const surgeryDate = new Date(patient.surgeryDate);
    const today = new Date();
    const totalDays = Math.max(1, Math.floor((today.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Count unique days with assessments completed
    const completionDates = new Set(
      assessments.map(a => new Date(a.completedAt).toDateString())
    );
    const daysCompleted = completionDates.size;

    // Calculate compliance rate based on assessments completed vs assigned
    const assignedCount = getAssignedAssessmentCount(patient.injuryType || '');
    const completedCount = assessments.length;
    const complianceRate = assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0;

    return { complianceRate, daysCompleted, totalDays };
  };

  // Fetch patient assessment history
  const { data: assessmentHistory, isLoading: loadingAssessments } = useQuery({
    queryKey: [`/api/users/by-code/${patient?.code}/history`],
    enabled: !!patient?.code && isOpen,
  });

  const assessments: Assessment[] = (assessmentHistory as any)?.history || [];
  const complianceMetrics = calculateComplianceMetrics(assessments, patient);

  // Delete assessment mutation
  const deleteAssessmentMutation = useMutation({
    mutationFn: async (assessmentId: number) => {
      const response = await fetch(`/api/admin/assessments/${assessmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error('Failed to delete assessment');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Assessment Deleted",
        description: "The assessment has been permanently removed."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/by-code/${patient?.code}/history`] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/patients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete assessment.",
        variant: "destructive"
      });
    }
  });

  // Download individual assessment
  const downloadAssessment = async (assessment: Assessment) => {
    try {
      const response = await fetch(`/api/user-assessments/${assessment.id}/download`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${patient.code}_${assessment.assessmentName}_${new Date(assessment.completedAt).toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Assessment data is being downloaded."
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download assessment data.",
        variant: "destructive"
      });
    }
  };

  // Download all assessments as ZIP
  const downloadAllAssessments = async () => {
    try {
      const token = sessionStorage.getItem('adminToken');
      console.log('Admin token for bulk download:', token);
      const response = await fetch(`/api/admin/patients/${patient.code}/download-all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Bulk download failed');
      }
      
      // Handle ZIP file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${patient.code}_AllAssessments_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Bulk Download Started",
        description: "All patient assessments are being downloaded as ZIP file."
      });
    } catch (error) {
      toast({
        title: "Bulk Download Failed",
        description: "Failed to download patient assessments.",
        variant: "destructive"
      });
    }
  };

  // View motion replay
  const viewMotionReplay = (assessmentId: number) => {
    window.open(`/patient/${patient.code}/motion-replay/${assessmentId}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQualityBadgeVariant = (score: number) => {
    if (score >= 90) return 'default'; // Green
    if (score >= 70) return 'secondary'; // Yellow  
    return 'destructive'; // Red
  };

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Patient Details: {patient.alias}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              Code: {patient.code}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Injury: {patient.injuryType}
            </span>
            {patient.surgeryDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Surgery: {formatDate(patient.surgeryDate)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Registered: {formatDate(patient.createdAt)}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assessments.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceMetrics.complianceRate}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {assessments.length} of {
                    patient.injuryType === 'Carpal Tunnel' || 
                    patient.injuryType === 'Wrist Fracture' || 
                    patient.injuryType === 'Tendon Injury' || 
                    patient.injuryType === 'Distal Radius Fracture' ? 6 :
                    patient.injuryType === 'Tennis Elbow' || 
                    patient.injuryType === 'Golfer\'s Elbow' || 
                    patient.injuryType === 'Trigger Finger' ? 3 : 3
                  } assigned
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Days Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceMetrics.daysCompleted}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  of {complianceMetrics.totalDays} post-surgery days
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bulk Actions */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Assessment History</h3>
            <div className="flex gap-2">
              <Button 
                onClick={downloadAllAssessments}
                disabled={assessments.length === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Archive className="w-4 h-4" />
                Download All
              </Button>
            </div>
          </div>

          {/* Assessment List */}
          <div className="space-y-3">
            {loadingAssessments ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading assessments...</p>
              </div>
            ) : assessments.length === 0 ? (
              <Card style={{ backgroundColor: '#FFFFFF' }}>
                <CardContent className="py-8 text-center text-muted-foreground" style={{ backgroundColor: '#FFFFFF' }}>
                  No assessments found for this patient.
                </CardContent>
              </Card>
            ) : (
              assessments.map((assessment) => (
                <Card key={assessment.id} className="hover:shadow-md transition-shadow" style={{ backgroundColor: '#FFFFFF' }}>
                  <CardContent className="p-4" style={{ backgroundColor: '#FFFFFF' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{assessment.assessmentName}</h4>
                          <Badge variant={getQualityBadgeVariant(assessment.qualityScore || 0)}>
                            {assessment.qualityScore || 0}% Quality
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Completed: {formatDate(assessment.completedAt)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewMotionReplay(assessment.id)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View Replay
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadAssessment(assessment)}
                          className="flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to permanently delete this assessment? This action cannot be undone.
                                <br /><br />
                                <strong>Assessment:</strong> {assessment.assessmentName}<br />
                                <strong>Completed:</strong> {formatDate(assessment.completedAt)}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteAssessmentMutation.mutate(assessment.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Assessment
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}