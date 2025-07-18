import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Send, Image, Paperclip, Sparkles, Info, Edit } from 'lucide-react';
import { ConversationManager } from '@/services/conversationManager';
import ThumbnailMessage from './ThumbnailMessage';
import type { Message } from '@/types/message';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onGenerateImage: () => void;
  onEditImage?: () => void;
  onThumbnailClick?: (imageUrl: string, designName?: string) => void;
  isEditingMode?: boolean;
  selectedDesignId?: number | null;
  isGenerating?: boolean;
  hasDesign?: boolean;
  hasPendingEditInstruction?: boolean;
  currentImageUrl?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages, 
  onSendMessage,
  onGenerateImage,
  onEditImage,
  onThumbnailClick,
  isEditingMode = false, 
  selectedDesignId,
  isGenerating = false,
  hasDesign = false,
  hasPendingEditInstruction = false,
  currentImageUrl
}) => {
  const [inputValue, setInputValue] = useState('');
  const [conversationManager] = useState(() => new ConversationManager());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
    inputRef.current?.focus();
  }, [messages]);

  useEffect(() => {
    if (isEditingMode) {
      conversationManager.setEditingMode();
    }
  }, [isEditingMode, conversationManager]);

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

  const handleThumbnailClickInternal = (imageUrl: string, designName?: string) => {
    if (onThumbnailClick) {
      onThumbnailClick(imageUrl, designName);
    }
  };

  const getPlaceholderText = () => {
    if (isEditingMode && selectedDesignId !== null) {
      return `告诉我您想要的修改...`;
    }
    
    const state = conversationManager.getState();
    switch (state.phase) {
      case 'welcome':
        return "描述您想要的袜子设计...";
      case 'collecting_type':
        return "选择袜子类型：船袜、中筒袜、长筒袜...";
      case 'collecting_colors':
        return "告诉我您喜欢的颜色...";
      case 'collecting_pattern':
        return "选择图案风格...";
      case 'collecting_occasion':
        return "这双袜子用于什么场合...";
      case 'collecting_style':
        return "您偏好什么设计风格...";
      default:
        return "继续聊天或点击生成图片...";
    }
  };

  const getHeaderText = () => {
    if (isEditingMode && selectedDesignId !== null) {
      return `编辑设计`;
    }
    return "SoxLab创意助手";
  };

  const getSubHeaderText = () => {
    if (isEditingMode && selectedDesignId !== null) {
      return "告诉我您想对这个设计做什么改动";
    }
    
    const state = conversationManager.getState();
    const phaseDescriptions = {
      'welcome': '让我们一起探讨您的袜子设计创意',
      'collecting_type': '正在收集：袜子类型',
      'collecting_colors': '正在收集：颜色偏好',
      'collecting_pattern': '正在收集：图案风格',
      'collecting_occasion': '正在收集：使用场合',
      'collecting_style': '正在收集：设计风格',
      'confirming': '请确认设计信息',
      'ready_to_generate': '设计信息已完善，可以生成图片',
      'editing_feedback': '编辑模式：收集修改建议'
    };
    
    return phaseDescriptions[state.phase] || '让我们一起探讨您的袜子设计创意';
  };

  const getHeaderIcon = () => {
    return <Image className="h-5 w-5 text-sock-purple" />;
  };

  const getCollectedInfo = () => {
    const info = conversationManager.getCollectedInfo();
    return info;
  };

  const isReadyToGenerate = () => {
    return conversationManager.isReadyToGenerate();
  };

  const getGenerateButtonText = () => {
    if (isGenerating) return '处理中...';
    if (isEditingMode) return '编辑图片';
    if (isReadyToGenerate()) return '生成图片';
    return '生成图片';
  };

  const handleActionButtonClick = () => {
    if (isEditingMode && onEditImage) {
      onEditImage();
    } else {
      onGenerateImage();
    }
  };

  const isActionButtonEnabled = () => {
    if (isEditingMode) {
      return hasPendingEditInstruction && !isGenerating;
    }
    return !isGenerating;
  };

  return (
    <div className="chat-container h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2 mb-2">
          {getHeaderIcon()}
          <h2 className="text-lg font-semibold text-sock-purple">{getHeaderText()}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{getSubHeaderText()}</p>
        
        {/* 显示收集到的设计信息 */}
        {!isEditingMode && getCollectedInfo().length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>已收集的设计信息：</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {getCollectedInfo().map((info, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {info}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {(isEditingMode && selectedDesignId !== null) && (
          <div className="mt-2 text-xs bg-sock-light-purple text-sock-purple px-2 py-1 rounded">
            正在编辑模式 {hasPendingEditInstruction && "- 有待处理的编辑指令"}
          </div>
        )}
      </div>
      
      <div className="messages-container flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message mb-4 flex ${
              message.isUser 
                ? 'justify-end' 
                : 'justify-start'
            }`}
          >
            <div className={`inline-block max-w-full px-4 py-2 rounded-lg ${
              message.isUser 
                ? 'bg-sock-purple text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <div className={`whitespace-pre-wrap text-sm ${
                message.isUser ? 'text-left' : 'text-left'
              }`}>
                {message.text}
              </div>
              {/* 添加缩略图显示 */}
              {message.brief_image_url && !message.isUser && (
                <ThumbnailMessage
                  imageUrl={message.brief_image_url}
                  designName={message.designName}
                  isSelected={currentImageUrl === message.detail_image_url}
                  onThumbnailClick={() => handleThumbnailClickInternal(message.detail_image_url!, message.designName)}
                />
              )}
            </div>
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
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleActionButtonClick}
              disabled={!isActionButtonEnabled()}
              className={`px-4 ${
                isReadyToGenerate() && !isEditingMode
                  ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse'
                  : isEditingMode && hasPendingEditInstruction
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isEditingMode ? (
                <Edit className="h-4 w-4 mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {getGenerateButtonText()}
            </Button>
            
            <Button 
              type="submit" 
              size="icon"
              className="bg-sock-purple hover:bg-sock-dark-purple"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
