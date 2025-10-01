import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceJournalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VoiceJournal({ open, onOpenChange }: VoiceJournalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Voice recognition is not supported in your browser. Please type your message instead.',
        variant: 'destructive',
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      toast({
        title: 'Recording Error',
        description: 'There was an error with voice recording. Please try again.',
        variant: 'destructive',
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    (window as any).currentRecognition = recognition;
  };

  const stopRecording = () => {
    if ((window as any).currentRecognition) {
      (window as any).currentRecognition.stop();
    }
    setIsRecording(false);
  };

  const sendToAI = () => {
    if (!transcript.trim()) {
      toast({
        title: 'No Content',
        description: 'Please record something before sending to AI.',
        variant: 'destructive',
      });
      return;
    }

    localStorage.setItem('voiceMessage', transcript);
    
    onOpenChange(false);
    setTranscript('');
    setIsRecording(false);
    
    setLocation('/chat');
    
    toast({
      title: 'Voice Message Ready',
      description: 'Your voice message has been prepared. Click send in the chat to get AI advice.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Journal</DialogTitle>
          <DialogDescription>
            Record how you're feeling and get AI advice
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg min-h-[200px]">
            {isRecording ? (
              <div className="text-center space-y-4">
                <div className="relative">
                  <Mic className="h-16 w-16 text-red-500 animate-pulse mx-auto" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-20 w-20 border-4 border-red-500 rounded-full animate-ping opacity-20" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Recording... speak now</p>
              </div>
            ) : transcript ? (
              <div className="w-full">
                <p className="text-sm text-foreground whitespace-pre-wrap">{transcript}</p>
              </div>
            ) : (
              <div className="text-center">
                <Mic className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Tap the button below to start recording</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!isRecording && !transcript && (
              <Button
                onClick={startRecording}
                className="flex-1"
                data-testid="button-start-recording"
              >
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            )}
            
            {isRecording && (
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="flex-1"
                data-testid="button-stop-recording"
              >
                <MicOff className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}
            
            {!isRecording && transcript && (
              <>
                <Button
                  onClick={() => setTranscript('')}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-clear-recording"
                >
                  Clear
                </Button>
                <Button
                  onClick={sendToAI}
                  className="flex-1"
                  data-testid="button-send-to-ai"
                >
                  Send to AI
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
