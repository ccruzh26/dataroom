import { useState } from 'react';
import ChatPanel from '../ChatPanel';
import { Button } from '@/components/ui/button';
import { mockChatMessages } from '@/lib/mockData';
import { ChatMessage } from '@/lib/types';
import { Sparkles } from 'lucide-react';

export default function ChatPanelExample() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSend = (content: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);
    setIsLoading(true);
    
    // todo: remove mock functionality
    setTimeout(() => {
      const response: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'This is a simulated response to your question about the documents.',
        citations: [
          { index: 1, docId: 'doc-1', sectionId: 'sec-1-1', docTitle: 'Financial Plan 2024', sectionTitle: 'Executive Summary' },
        ],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
      setIsLoading(false);
    }, 1500);
  };
  
  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        <Sparkles className="w-4 h-4 mr-2" />
        Open AI Assistant
      </Button>
      <ChatPanel 
        messages={messages}
        onSendMessage={handleSend}
        onCitationClick={(c) => console.log('Citation clicked:', c)}
        isLoading={isLoading}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
