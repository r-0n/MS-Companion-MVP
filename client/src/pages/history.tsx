import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Calendar, Activity, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type HealthMetric = {
  id: number;
  userId: string;
  sleepQuality: number;
  sleepDuration: number;
  fatigueLevel: number;
  moodScore: number;
  activitySteps: number;
  timestamp: string;
};

type RiskAssessment = {
  id: number;
  userId: string;
  healthMetricId: number;
  riskScore: number;
  riskCategory: string;
  suggestion: string;
  timestamp: string;
};

export default function HistoryPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  const { data: metricsData } = useQuery<{ metrics: HealthMetric[] }>({
    queryKey: [`/api/health-metrics/${user?.uid}`],
    enabled: !!user,
  });

  const { data: riskData } = useQuery<{ history: RiskAssessment[] }>({
    queryKey: [`/api/risk-history/${user?.uid}`],
    enabled: !!user,
  });

  const generateDummyDataMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/generate-dummy-data/${user?.uid}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/health-metrics/${user?.uid}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/risk-history/${user?.uid}`] });
      toast({
        title: 'Sample Data Added',
        description: '5 sample health records have been added to your history.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to generate sample data. Please try again.',
        variant: 'destructive',
      });
    },
  });

  if (!user) {
    return null;
  }

  const getRiskColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'low': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'moderate': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'high': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
    return <Minus className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                Health History
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track your health metrics and risk assessments over time
              </p>
            </div>
            <Button
              onClick={() => generateDummyDataMutation.mutate()}
              disabled={generateDummyDataMutation.isPending}
              variant="outline"
              size="sm"
              data-testid="button-generate-dummy-data"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sample Data
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Risk History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Risk Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!riskData?.history || riskData.history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No risk assessments yet. Complete a health check to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {riskData.history.map((assessment, index) => (
                    <div
                      key={assessment.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                      data-testid={`risk-assessment-${assessment.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getRiskColor(assessment.riskCategory)}>
                            {assessment.riskCategory}
                          </Badge>
                          <span className="text-lg font-semibold text-foreground">
                            {assessment.riskScore}%
                          </span>
                          {index < riskData.history.length - 1 && 
                            getTrendIcon(assessment.riskScore, riskData.history[index + 1].riskScore)
                          }
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {assessment.suggestion}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(assessment.timestamp), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Health Metrics History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Health Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!metricsData?.metrics || metricsData.metrics.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No health metrics recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {metricsData.metrics.map((metric) => (
                    <div
                      key={metric.id}
                      className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                      data-testid={`health-metric-${metric.id}`}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Sleep Quality</p>
                          <p className="text-sm font-medium text-foreground">{metric.sleepQuality}/10</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Sleep Duration</p>
                          <p className="text-sm font-medium text-foreground">{metric.sleepDuration}h</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Fatigue</p>
                          <p className="text-sm font-medium text-foreground">{metric.fatigueLevel}/10</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Mood</p>
                          <p className="text-sm font-medium text-foreground">{metric.moodScore}/10</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Activity</p>
                          <p className="text-sm font-medium text-foreground">{metric.activitySteps.toLocaleString()} steps</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(metric.timestamp), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
