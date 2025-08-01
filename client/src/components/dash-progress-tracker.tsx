import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Calendar, Target, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface DashProgressData {
  patientCode: string;
  patientAlias: string;
  injuryType: string;
  assessments: Array<{
    id: number;
    score: number;
    completedAt: string;
    sessionNumber: number;
  }>;
  trend: {
    direction: 'improving' | 'stable' | 'declining';
    totalChange: number;
    improvementPercentage: number;
    changeRate: number;
    daysBetween: number;
    assessmentCount: number;
  } | null;
  latestScore: number;
  firstScore: number;
  message?: string;
}

interface DashProgressTrackerProps {
  patientCode: string;
}

export function DashProgressTracker({ patientCode }: DashProgressTrackerProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  // Fetch DASH progress data
  const { data: progressData, isLoading, error } = useQuery<DashProgressData>({
    queryKey: [`/api/admin/dash-progress/${patientCode}`],
    enabled: !!patientCode,
    queryFn: async () => {
      const adminToken = sessionStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin authentication required');
      }

      const response = await fetch(`/api/admin/dash-progress/${patientCode}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch progress data: ${response.status}`);
      }

      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading DASH progress data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load DASH progress data: {(error as Error).message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!progressData || progressData.assessments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No DASH Assessments</h3>
          <p className="text-muted-foreground">
            {progressData?.message || "This patient hasn't completed any DASH assessments yet."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { assessments, trend, latestScore, firstScore } = progressData;

  // Prepare chart data
  const chartData = assessments.map((assessment, index) => ({
    session: `Session ${assessment.sessionNumber}`,
    score: assessment.score,
    date: format(new Date(assessment.completedAt), 'MMM dd'),
    fullDate: assessment.completedAt,
    improvement: index === 0 ? 0 : firstScore - assessment.score // Positive = improvement
  }));

  // Get trend styling
  const getTrendIcon = () => {
    if (!trend) return <Minus className="h-4 w-4" />;
    switch (trend.direction) {
      case 'improving': return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingUp className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-600';
    switch (trend.direction) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getTrendBadgeVariant = () => {
    if (!trend) return 'secondary';
    switch (trend.direction) {
      case 'improving': return 'default'; // Green
      case 'declining': return 'destructive'; // Red
      default: return 'secondary'; // Yellow
    }
  };

  const getScoreInterpretation = (score: number) => {
    if (score >= 70) return { level: 'Severe', color: 'text-red-600', description: 'Significant disability' };
    if (score >= 40) return { level: 'Moderate', color: 'text-orange-600', description: 'Moderate disability' };
    if (score >= 15) return { level: 'Mild', color: 'text-yellow-600', description: 'Mild disability' };
    return { level: 'Minimal', color: 'text-green-600', description: 'Minimal or no disability' };
  };

  const latestInterpretation = getScoreInterpretation(latestScore);

  return (
    <div className="space-y-6">
      {/* Progress Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Latest Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestScore.toFixed(1)}</div>
            <p className={`text-xs ${latestInterpretation.color} font-medium`}>
              {latestInterpretation.level} Disability
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {getTrendIcon()}
              Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getTrendColor()}`}>
              {trend?.totalChange ? `${trend.totalChange > 0 ? '-' : '+'}${Math.abs(trend.totalChange).toFixed(1)}` : 'N/A'}
            </div>
            <Badge variant={getTrendBadgeVariant()} className="text-xs">
              {trend?.direction.charAt(0).toUpperCase() + trend?.direction.slice(1) || 'No data'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trend?.improvementPercentage ? `${trend.improvementPercentage.toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {firstScore.toFixed(1)} → {latestScore.toFixed(1)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessments.length}</div>
            <p className="text-xs text-muted-foreground">
              Over {trend?.daysBetween || 0} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">DASH Score Progression</h3>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'chart' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('chart')}
          >
            Chart View
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
        </div>
      </div>

      {/* Chart View */}
      {viewMode === 'chart' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score Over Time</CardTitle>
            <p className="text-sm text-muted-foreground">
              Lower scores indicate better functional ability (less disability)
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    fontSize={12}
                    label={{ value: 'DASH Score', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(1), 'DASH Score']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#0891b2" 
                    strokeWidth={3}
                    dot={{ fill: '#0891b2', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#0891b2', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assessment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chartData.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      {item.session}
                    </Badge>
                    <div>
                      <p className="font-medium">{item.date}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(item.fullDate), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{item.score.toFixed(1)}</div>
                    {index > 0 && (
                      <div className={`text-sm ${item.improvement > 0 ? 'text-green-600' : item.improvement < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {item.improvement > 0 ? '↓' : item.improvement < 0 ? '↑' : '→'} {Math.abs(item.improvement).toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinical Interpretation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clinical Interpretation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Current Status:</h4>
                <p className="text-blue-800">
                  Patient's latest DASH score of <strong>{latestScore.toFixed(1)}</strong> indicates <strong>{latestInterpretation.level.toLowerCase()} disability</strong>. 
                  {latestInterpretation.description}
                </p>
              </div>
              
              {trend && trend.assessmentCount > 1 && (
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Progress Analysis:</h4>
                  <p className="text-blue-800">
                    Over {trend.daysBetween} days, the patient shows a <strong>{trend.direction}</strong> trend with 
                    a {Math.abs(trend.totalChange).toFixed(1)}-point {trend.totalChange > 0 ? 'improvement' : 'decline'} 
                    ({Math.abs(trend.improvementPercentage).toFixed(1)}% change from baseline).
                    {trend.direction === 'improving' && ' This indicates positive recovery progress.'}
                    {trend.direction === 'declining' && ' Consider reviewing treatment plan or additional interventions.'}
                    {trend.direction === 'stable' && ' Patient maintains consistent functional level.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}