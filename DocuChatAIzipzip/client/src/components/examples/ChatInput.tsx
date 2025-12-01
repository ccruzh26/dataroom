import ChatInput from '../ChatInput';

export default function ChatInputExample() {
  return (
    <div className="w-full max-w-2xl border rounded-lg">
      <ChatInput 
        onSend={(msg) => console.log('Message sent:', msg)}
        isLoading={false}
      />
    </div>
  );
}
