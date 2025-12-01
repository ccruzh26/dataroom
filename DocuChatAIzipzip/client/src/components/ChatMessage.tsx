import { ChatMessage as ChatMessageType, Citation } from '@/lib/types';
import CitationChip from './CitationChip';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  onCitationClick: (citation: Citation) => void;
}

export default function ChatMessage({ message, onCitationClick }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div
      data-testid={`message-${message.id}`}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-primary" />
        </div>
      )}
      
      <div className={`max-w-[85%] ${isUser ? 'max-w-[80%]' : ''}`}>
        <div
          className={`rounded-xl px-3 py-2 ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>
        
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {message.citations.map((citation) => (
              <CitationChip
                key={citation.index}
                citation={citation}
                onClick={onCitationClick}
              />
            ))}
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
