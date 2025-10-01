import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type ChatMessage = {
  id: number;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export default function ChatPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  useEffect(() => {
    const voiceMessage = localStorage.getItem('voiceMessage');
    if (voiceMessage) {
      setMessage(voiceMessage);
      localStorage.removeItem('voiceMessage');
    }
  }, []);

  const { data: chatData } = useQuery<{ history: ChatMessage[] }>({
    queryKey: [`/api/chat/history/${user?.uid}`],
    enabled: !!user,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageContent: string) => {
      return apiRequest('POST', '/api/chat', {
        userId: user?.uid,
        message: messageContent,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chat/history/${user?.uid}`] });
      setMessage('');
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatData?.history]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(message);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background pb-16">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            AI Health Companion
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Get personalized health advice based on your data
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-4 pb-4">
          {!chatData?.history || chatData.history.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Start a conversation
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Ask me anything about your health, MS management, or get personalized advice based on your recent health metrics.
              </p>
            </div>
          ) : (
            chatData.history.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                data-testid={`chat-message-${msg.id}`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <Card className={`p-4 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </Card>
                </div>
              </div>
            ))
          )}
          
          {sendMessageMutation.isPending && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <Card className="p-4 bg-card">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-card border-t border-border p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about your health..."
              className="flex-1"
              disabled={sendMessageMutation.isPending}
              data-testid="input-chat-message"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || sendMessageMutation.isPending}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
