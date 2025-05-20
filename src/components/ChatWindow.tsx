
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Send } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

interface ChatWindowProps {
  onSendMessage: (message: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Welcome to the Sock Whisperer Design Lab! Describe your ideal socks and I'll create them for you. For example, try saying: \"I want purple crew socks with white polka dots\" or \"Create Halloween socks with bats\"",
      isUser: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
    inputRef.current?.focus();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      isUser: true
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Pass message to parent component
    onSendMessage(inputValue);
    
    // Clear input
    setInputValue('');
    
    // Simulate AI response
    setTimeout(() => {
      const designDescriptions = [
        "I've updated your sock design! Check out the preview.",
        "Your new sock design is ready to view!",
        "I've created a sock design based on your description. What do you think?",
        "Design updated! Take a look at the preview panel.",
        "Your custom socks are ready for review. Need any adjustments?"
      ];
      
      const aiResponse = {
        id: messages.length + 2,
        text: designDescriptions[Math.floor(Math.random() * designDescriptions.length)],
        isUser: false
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="chat-container h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-sock-purple">Sock Whisperer Chat</h2>
        <p className="text-sm text-muted-foreground">Describe your ideal sock design</p>
      </div>
      
      <div className="messages-container flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}
          >
            {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Describe your ideal socks..."
          className="flex-1"
        />
        <Button type="submit" className="bg-sock-purple hover:bg-sock-dark-purple">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatWindow;
