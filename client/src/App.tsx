import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import ChatPage from "@/pages/chat";
import HistoryPage from "@/pages/history";
import NotFound from "@/pages/not-found";
import InstallPrompt from "@/components/install-prompt";
import BottomNav from "@/components/bottom-nav";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  const { user } = useAuth();

  return (
    <>
      <Switch>
        <Route path="/" component={AuthPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/chat" component={ChatPage} />
        <Route path="/history" component={HistoryPage} />
        <Route component={NotFound} />
      </Switch>
      {user && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <InstallPrompt />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
