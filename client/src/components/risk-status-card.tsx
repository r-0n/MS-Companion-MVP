import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskAssessment {
  riskScore: number;
  riskCategory: string;
  suggestion: string;
}

export default function RiskStatusCard() {
  const { user } = useAuth();

  const { data: riskData, isLoading } = useQuery<{ riskAssessment: RiskAssessment }>({
    queryKey: ['/api/latest-risk', user?.uid],
    enabled: !!user?.uid,
  });

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-24 bg-muted rounded"></div>
      </Card>
    );
  }

  const riskAssessment = riskData?.riskAssessment;
  const riskScore = riskAssessment?.riskScore ?? 0;
  const riskCategory = riskAssessment?.riskCategory ?? 'Unknown';
  const suggestion = riskAssessment?.suggestion ?? 'Complete your first health assessment to get personalized recommendations.';

  const getRiskColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'low':
        return 'green';
      case 'medium':
        return 'yellow';
      case 'high':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getRiskClass = (category: string) => {
    switch (category.toLowerCase()) {
      case 'low':
        return 'risk-low';
      case 'medium':
        return 'risk-medium';
      case 'high':
        return 'risk-high';
      default:
        return '';
    }
  };

  const color = getRiskColor(riskCategory);
  const riskClass = getRiskClass(riskCategory);

  return (
    <Card className={cn("p-6", riskClass)} data-testid="card-risk-status">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-foreground">Current Risk Status</h2>
          <div className="text-right">
            <div className={cn("text-3xl font-bold", `text-${color}-600`)} data-testid="text-risk-percentage">
              {Math.round(riskScore)}%
            </div>
            <div className={cn("text-sm font-medium", `text-${color}-600`)} data-testid="text-risk-category">
              {riskCategory.toUpperCase()} RISK
            </div>
          </div>
        </div>
        
        {/* Risk Score Visualization */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Risk Level</span>
            <span data-testid="text-risk-score">{Math.round(riskScore)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className={cn("h-3 rounded-full transition-all duration-500", `bg-${color}-500`)}
              style={{ width: `${riskScore}%` }}
              data-testid="progress-risk-bar"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>
        
        {/* Personalized Suggestion */}
        <div className="bg-background/50 rounded-md p-4">
          <h3 className="font-medium text-foreground mb-2 flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Today's Recommendation
          </h3>
          <p className="text-muted-foreground" data-testid="text-suggestion">
            {suggestion}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
