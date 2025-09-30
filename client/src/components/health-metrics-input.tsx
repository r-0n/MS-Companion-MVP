import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Activity } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const metricLabels = {
  sleepQuality: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'],
  fatigueLevel: ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'],
  moodScore: ['Very Low', 'Low', 'Neutral', 'Good', 'Excellent']
};

export default function HealthMetricsInput() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [sleepQuality, setSleepQuality] = useState([4]);
  const [sleepDuration, setSleepDuration] = useState(7.5);
  const [fatigueLevel, setFatigueLevel] = useState([2]);
  const [moodScore, setMoodScore] = useState([4]);
  const [activitySteps, setActivitySteps] = useState(6500);

  const predictRiskMutation = useMutation({
    mutationFn: async (metrics: any) => {
      const response = await apiRequest('POST', '/api/predict-risk', {
        userId: user?.uid,
        ...metrics,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Risk Assessment Updated',
        description: 'Your health metrics have been recorded and risk assessment updated.',
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/latest-risk'] });
      queryClient.invalidateQueries({ queryKey: ['/api/risk-history'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update risk assessment',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const metrics = {
      sleepQuality: sleepQuality[0],
      sleepDuration,
      fatigueLevel: fatigueLevel[0],
      moodScore: moodScore[0],
      activitySteps,
    };

    predictRiskMutation.mutate(metrics);
  };

  return (
    <Card className="p-6">
      <CardContent className="p-0">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Update Health Metrics
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sleep Quality */}
          <div>
            <Label className="block text-sm font-medium text-foreground mb-3">
              Sleep Quality (1-5)
            </Label>
            <Slider
              value={sleepQuality}
              onValueChange={setSleepQuality}
              max={5}
              min={1}
              step={1}
              className="mb-2"
              data-testid="slider-sleep-quality"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>Poor</span>
              <span className="font-medium text-foreground" data-testid="text-sleep-quality-value">
                {sleepQuality[0]} - {metricLabels.sleepQuality[sleepQuality[0] - 1]}
              </span>
              <span>Excellent</span>
            </div>
          </div>
          
          {/* Sleep Duration */}
          <div>
            <Label htmlFor="sleep-duration" className="block text-sm font-medium text-foreground mb-2">
              Sleep Duration (hours)
            </Label>
            <Input
              type="number"
              id="sleep-duration"
              min="1"
              max="12"
              step="0.5"
              value={sleepDuration}
              onChange={(e) => setSleepDuration(parseFloat(e.target.value))}
              className="text-lg py-3"
              data-testid="input-sleep-duration"
            />
          </div>
          
          {/* Fatigue Level */}
          <div>
            <Label className="block text-sm font-medium text-foreground mb-3">
              Fatigue Level (1-5)
            </Label>
            <Slider
              value={fatigueLevel}
              onValueChange={setFatigueLevel}
              max={5}
              min={1}
              step={1}
              className="mb-2"
              data-testid="slider-fatigue-level"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>None</span>
              <span className="font-medium text-foreground" data-testid="text-fatigue-level-value">
                {fatigueLevel[0]} - {metricLabels.fatigueLevel[fatigueLevel[0] - 1]}
              </span>
              <span>Severe</span>
            </div>
          </div>
          
          {/* Mood Score */}
          <div>
            <Label className="block text-sm font-medium text-foreground mb-3">
              Mood Score (1-5)
            </Label>
            <Slider
              value={moodScore}
              onValueChange={setMoodScore}
              max={5}
              min={1}
              step={1}
              className="mb-2"
              data-testid="slider-mood-score"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>Low</span>
              <span className="font-medium text-foreground" data-testid="text-mood-score-value">
                {moodScore[0]} - {metricLabels.moodScore[moodScore[0] - 1]}
              </span>
              <span>High</span>
            </div>
          </div>
          
          {/* Activity Steps */}
          <div>
            <Label htmlFor="activity-steps" className="block text-sm font-medium text-foreground mb-2">
              Activity Steps
            </Label>
            <Input
              type="number"
              id="activity-steps"
              min="0"
              value={activitySteps}
              onChange={(e) => setActivitySteps(parseInt(e.target.value))}
              className="text-lg py-3"
              data-testid="input-activity-steps"
            />
          </div>
          
          <Button
            type="submit"
            disabled={predictRiskMutation.isPending}
            className="w-full py-3 text-lg"
            data-testid="button-update-risk"
          >
            {predictRiskMutation.isPending ? 'Updating...' : 'Update Risk Assessment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
