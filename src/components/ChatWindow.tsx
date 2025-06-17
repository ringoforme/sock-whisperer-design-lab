
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { useToast } from '@/components/ui/use-toast';
import { Send, MessageCircle, Image, Paperclip, Sparkles } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onGenerateImage: () => void;
  isEditingMode?: boolean;
  selectedDesignId?: number | null;
  isChatMode?: boolean;
  onChatModeToggle?: (enabled: boolean) => void;
  isGenerating?: boolean;
  hasDesign?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages, 
  onSendMessage,
  onGenerateImage,
  isEditingMode = false, 
  selectedDesignId,
  isChatMode = false,
  onChatModeToggle,
  isGenerating = false,
  hasDesign = false
}) => {
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

    // Pass message to parent component
    onSendMessage(inputValue);
    
    // Clear input
    setInputValue('');
  };

  const handleAttachFile = () => {
    toast({
      title: "上传图片功能即将推出"
    });
  };

  const getPlaceholderText = () => {
    if (isChatMode) {
      return "和我聊聊您的设计想法...";
    }
    if (isEditingMode && selectedDesignId !== null) {
      return `对设计说些什么...`;
    }
    return "描述您理想的袜子...";
  };

  const getHeaderText = () => {
    if (isChatMode) {
      return "设计创意聊天";
    }
    if (isEditingMode && selectedDesignId !== null) {
      return `编辑设计`;
    }
    return "Sox Lab助手聊天";
  };

  const getSubHeaderText = () => {
    if (isChatMode) {
      return "让我们一起探讨您的袜子设计创意";
    }
    if (isEditingMode && selectedDesignId !== null) {
      return "告诉我您想对这个设计做什么改动";
    }
    return "先聊聊您的设计想法，然后生成图片";
  };

  const getHeaderIcon = () => {
    if (isChatMode) {
      return <MessageCircle className="h-5 w-5 text-sock-purple" />;
    }
    return <Image className="h-5 w-5 text-sock-purple" />;
  };

  return (
    <div className="chat-container h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2 mb-2">
          {getHeaderIcon()}
          <h2 className="text-lg font-semibold text-sock-purple">{getHeaderText()}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{getSubHeaderText()}</p>
        {(isEditingMode && selectedDesignId !== null) && (
          <div className="mt-2 text-xs bg-sock-light-purple text-sock-purple px-2 py-1 rounded">
            正在编辑模式
          </div>
        )}
        {isChatMode && (
          <div className="mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            聊天模式 - 仅讨论创意，不生成图片
          </div>
        )}
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
      
      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex gap-2 mb-3">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={getPlaceholderText()}
            className="flex-1"
          />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleAttachFile}
              className="hover:bg-gray-100"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Toggle
              pressed={isChatMode}
              onPressedChange={onChatModeToggle}
              className="data-[state=on]:bg-sock-purple data-[state=on]:text-white text-sm px-3"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              聊天模式
            </Toggle>

            {!isChatMode && !isEditingMode && (
              <Button
                type="button"
                onClick={onGenerateImage}
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700 text-white px-4"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? '生成中...' : '生成图片'}
              </Button>
            )}
          </div>
          
          <Button 
            type="submit" 
            size="icon"
            className="bg-sock-purple hover:bg-sock-dark-purple"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
