import ChatMessage from '../ChatMessage';
import { ChatMessage as ChatMessageType } from '@/lib/types';

// todo: remove mock functionality
const userMessage: ChatMessageType = {
  id: 'msg-1',
  role: 'user',
  content: 'What are the projected revenue figures for 2024?',
  timestamp: new Date(),
};

const assistantMessage: ChatMessageType = {
  id: 'msg-2',
  role: 'assistant',
  content: 'Based on the Financial Plan 2024, the projected revenue is $12.5M, representing a 45% year-over-year growth.',
  citations: [
    { index: 1, docId: 'doc-1', sectionId: 'sec-1-2', docTitle: 'Financial Plan 2024', sectionTitle: 'Revenue Projections' },
  ],
  timestamp: new Date(),
};

export default function ChatMessageExample() {
  return (
    <div className="space-y-4 w-full max-w-2xl">
      <ChatMessage 
        message={userMessage} 
        onCitationClick={(c) => console.log('Citation clicked:', c)}
      />
      <ChatMessage 
        message={assistantMessage} 
        onCitationClick={(c) => console.log('Citation clicked:', c)}
      />
    </div>
  );
}
