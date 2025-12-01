import { useRef, useEffect, useState } from 'react';
import { ChatMessage as ChatMessageType, Citation } from '@/lib/types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Sparkles, X, MessageSquare } from 'lucide-react';

interface ChatPanelProps {
  messages: ChatMessageType[];
  onSendMessage: (message: string) => void;
  onCitationClick: (citation: Citation) => void;
  isLoading?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatPanel({ 
  messages, 
  onSendMessage, 
  onCitationClick, 
  isLoading = false,
  isOpen,
  onClose,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, shouldAutoScroll]);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setShouldAutoScroll(isAtBottom);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col"
        data-testid="chat-panel"
      >
        <SheetHeader className="shrink-0 px-4 py-3 border-b">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-base">AI Assistant</SheetTitle>
                <SheetDescription className="text-xs">Ask about your documents</SheetDescription>
              </div>
            </div>
            <Button
              data-testid="button-close-chat"
              size="icon"
              variant="ghost"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>
        
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
          onScroll={handleScroll}
        >
          <div className="p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <MessageSquare className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1 text-sm">Start a conversation</h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Ask questions about your documents and get answers with citations.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onCitationClick={onCitationClick}
                />
              ))
            )}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                </div>
                <div className="bg-card border rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <ChatInput
          onSend={onSendMessage}
          isLoading={isLoading}
        />
      </SheetContent>
    </Sheet>
  );
}
