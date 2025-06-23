
import React from 'react';
import { Card } from '@/components/ui/card';

interface ChatThumbnailProps {
  imageUrl: string;
  designName: string;
  onThumbnailClick: () => void;
  isSelected?: boolean;
}

const ChatThumbnail: React.FC<ChatThumbnailProps> = ({
  imageUrl,
  designName,
  onThumbnailClick,
  isSelected = false
}) => {
  return (
    <div className="my-3">
      <Card 
        className={`p-2 cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-sock-purple' : ''
        }`}
        onClick={onThumbnailClick}
      >
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={imageUrl}
              alt={designName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 line-clamp-2">
              {designName}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              点击查看完整图片
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatThumbnail;
