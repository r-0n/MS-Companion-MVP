import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface HistoryData {
  history: Array<{
    recordedAt: string;
    riskAssessment?: {
      riskScore: number;
      riskCategory: string;
    };
  }>;
}

export default function TrendChart() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/risk-history', user?.id],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <CardContent className="p-0">
          <div className="h-64 bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const historyData = (data as HistoryData)?.history || [];
  
  // Transform data for chart
  const chartData = historyData
    .filter(item => item.riskAssessment)
    .slice(0, 7)
    .reverse()
    .map((item, index) => ({
      day: format(new Date(item.recordedAt), 'EEE'),
      date: format(new Date(item.recordedAt), 'MMM dd'),
      riskScore: Math.round(item.riskAssessment!.riskScore),
      category: item.riskAssessment!.riskCategory,
    }));

  // If no data, show placeholder
  if (chartData.length === 0) {
    return (
      <Card className="p-6">
        <CardContent className="p-0">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            7-Day Risk Trend
          </h2>
          
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No risk history available yet.
                <br />
                Complete your first assessment to see trends.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getLineColor = (score: number) => {
    if (score <= 30) return '#22c55e'; // green-500
    if (score <= 70) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  };

  return (
    <Card className="p-6">
      <CardContent className="p-0">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          7-Day Risk Trend
        </h2>
        
        <div className="h-64 relative" data-testid="chart-risk-trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(215.4 16.3% 46.9%)"
                fontSize={12}
              />
              <YAxis 
                domain={[0, 100]}
                stroke="hsl(215.4 16.3% 46.9%)"
                fontSize={12}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{label} - {data.date}</p>
                        <p className="text-sm">
                          Risk Score: <span className="font-medium">{data.riskScore}%</span>
                        </p>
                        <p className="text-sm">
                          Category: <span className="font-medium">{data.category}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="riskScore"
                stroke="hsl(186 100% 42%)"
                strokeWidth={3}
                dot={{ fill: 'hsl(186 100% 42%)', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: 'hsl(186 100% 42%)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-muted-foreground">Low Risk</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-muted-foreground">Medium Risk</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-muted-foreground">High Risk</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
