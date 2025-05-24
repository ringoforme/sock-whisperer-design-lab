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
      text: "欢迎来到袜匠设计工作室！描述您理想的袜子，我会为您创作。例如，试着说：'我想要紫色船袜配白色圆点'或'创作万圣节主题的蝙蝠袜子'",
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
        "我已更新了您的袜子设计！请查看预览。",
        "您的新袜子设计已准备就绪！",
        "我已根据您的描述创建了袜子设计。您觉得怎么样？",
        "设计已更新！请看预览面板。",
        "您的定制袜子已准备好审查。需要任何调整吗？"
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
        <h2 className="text-lg font-semibold text-sock-purple">袜匠助手聊天</h2>
        <p className="text-sm text-muted-foreground">描述您理想的袜子设计</p>
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
          placeholder="描述您理想的袜子..."
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
