import { Link, useLocation } from 'wouter';
import { Home, MessageCircle, History } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    {
      path: '/dashboard',
      label: 'Home',
      icon: Home,
      testId: 'nav-dashboard',
    },
    {
      path: '/chat',
      label: 'AI Chat',
      icon: MessageCircle,
      testId: 'nav-chat',
    },
    {
      path: '/history',
      label: 'History',
      icon: History,
      testId: 'nav-history',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 pb-safe">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-3 gap-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                data-testid={item.testId}
              >
                <Icon className={cn(
                  "h-5 w-5 mb-1",
                  isActive && "stroke-[2.5]"
                )} />
                <span className={cn(
                  "text-xs",
                  isActive && "font-semibold"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
