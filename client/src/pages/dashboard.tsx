import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import AppHeader from '@/components/app-header';
import RiskStatusCard from '@/components/risk-status-card';
import HealthMetricsInput from '@/components/health-metrics-input';
import TrendChart from '@/components/trend-chart';
import VoiceJournal from '@/components/voice-journal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Zap, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [voiceJournalOpen, setVoiceJournalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto p-4 space-y-8">
        <RiskStatusCard />
        
        <div className="grid md:grid-cols-2 gap-8">
          <HealthMetricsInput />
          <TrendChart />
        </div>
        
        {/* Additional Features Section */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Voice Input Feature */}
          <Card className="p-6">
            <CardContent className="p-0">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Mic className="h-5 w-5 mr-2" />
                Voice Journal
              </h3>
              <p className="text-muted-foreground text-sm mb-4">Record how you're feeling today</p>
              <Button 
                variant="secondary" 
                className="w-full py-3 text-base"
                onClick={() => setVoiceJournalOpen(true)}
                data-testid="button-voice-journal"
              >
                Start Recording
              </Button>
            </CardContent>
          </Card>
          
          {/* Context-Aware Nudges */}
          <Card className="p-6">
            <CardContent className="p-0">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Smart Nudges
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-accent rounded-md p-3">
                  <p className="text-foreground">
                    <strong>2:45 PM</strong> - Time for a hydration break! 💧
                  </p>
                </div>
                <div className="bg-accent rounded-md p-3">
                  <p className="text-foreground">
                    <strong>Weather Alert</strong> - Cool day ahead, perfect for outdoor activity
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Emergency Contacts */}
          <Card className="p-6">
            <CardContent className="p-0">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Quick Contacts
              </h3>
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start bg-accent hover:bg-accent/80 p-3 h-auto"
                  onClick={() => {
                    toast({
                      title: 'Contact Dr. Smith',
                      description: 'Opening contact options for your neurologist...',
                    });
                  }}
                  data-testid="button-contact-doctor"
                >
                  <div className="text-left">
                    <div className="font-medium text-foreground">Dr. Smith</div>
                    <div className="text-sm text-muted-foreground">Neurologist</div>
                  </div>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start bg-accent hover:bg-accent/80 p-3 h-auto"
                  onClick={() => {
                    toast({
                      title: 'MS Helpline',
                      description: '24/7 Support: 1-800-FIGHT-MS',
                    });
                  }}
                  data-testid="button-contact-helpline"
                >
                  <div className="text-left">
                    <div className="font-medium text-foreground">MS Helpline</div>
                    <div className="text-sm text-muted-foreground">24/7 Support</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <VoiceJournal open={voiceJournalOpen} onOpenChange={setVoiceJournalOpen} />
    </div>
  );
}
