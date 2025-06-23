
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Heart, Image as ImageIcon } from 'lucide-react';

interface ChatMessageProps {
  message: {
    id: number;
    text: string;
    isUser: boolean;
    designWork?: {
      id: string;
      name: string;
      thumbnail_url?: string;
      image_url: string;
      status: string;
    };
  };
  onDownload?: (workId: string) => void;
  onToggleFavorite?: (workId: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onDownload, 
  onToggleFavorite 
}) => {
  const handleImageClick = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  return (
    <div className={`message mb-4 flex ${
      message.isUser ? 'justify-end' : 'justify-start'
    }`}>
      <div className={`inline-block max-w-full ${
        message.isUser ? 'max-w-[80%]' : 'max-w-[85%]'
      }`}>
        <div className={`px-4 py-2 rounded-lg ${
          message.isUser 
            ? 'bg-sock-purple text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          <div className="whitespace-pre-wrap text-sm">
            {message.text}
          </div>
        </div>
        
        {/* 显示设计作品缩略图 */}
        {!message.isUser && message.designWork && (
          <Card className="mt-2 p-3 bg-white">
            <div className="flex items-start space-x-3">
              <div 
                className="relative cursor-pointer group"
                onClick={() => handleImageClick(message.designWork!.image_url)}
              >
                <img
                  src={message.designWork.thumbnail_url || message.designWork.image_url}
                  alt={message.designWork.name}
                  className="w-20 h-20 object-cover rounded transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded transition-all flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <Badge 
                  className={`absolute -top-1 -right-1 text-xs ${
                    message.designWork.status === 'generated' 
                      ? 'bg-green-500' 
                      : 'bg-yellow-500'
                  }`}
                >
                  {message.designWork.status === 'generated' ? '完成' : '处理中'}
                </Badge>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {message.designWork.name}
                </h4>
                <div className="flex items-center space-x-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload?.(message.designWork!.id)}
                    className="h-7 px-2"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    下载
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleFavorite?.(message.designWork!.id)}
                    className="h-7 px-2"
                  >
                    <Heart className="h-3 w-3 mr-1" />
                    收藏
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
