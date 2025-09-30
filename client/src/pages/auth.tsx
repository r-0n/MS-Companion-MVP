import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { HeartPulse, Info } from 'lucide-react';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if already authenticated
  if (user) {
    setLocation('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password, name);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        toast({
          title: 'Authentication Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        setLocation('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-primary flex items-center justify-center mb-4">
            <HeartPulse className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">MS Companion</h1>
          <p className="text-muted-foreground mt-2">AI-powered Multiple Sclerosis management</p>
        </div>
        
        {/* Auth Form Container */}
        <Card className="p-8 shadow-lg">
          <CardContent className="p-0">
            <h2 className="text-2xl font-semibold text-center mb-6">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div>
                  <Label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </Label>
                  <Input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                    className="text-lg py-3"
                    placeholder="John Doe"
                    data-testid="input-name"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-lg py-3"
                  placeholder="your.email@example.com"
                  data-testid="input-email"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-lg py-3"
                  placeholder="••••••••"
                  data-testid="input-password"
                />
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-lg"
                data-testid="button-submit"
              >
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>
            
            <p className="text-center mt-6 text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-medium p-0 h-auto"
                data-testid="button-toggle-mode"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </Button>
            </p>
          </CardContent>
        </Card>
        
        {/* Demo Note */}
        <Card className="bg-accent border p-4 text-center">
          <p className="text-sm text-muted-foreground">
            <Info className="inline h-4 w-4 mr-1" />
            Create an account or sign in to access your personalized MS management dashboard
          </p>
        </Card>
      </div>
    </div>
  );
}
