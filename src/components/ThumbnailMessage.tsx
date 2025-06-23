
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ThumbnailMessageProps {
  imageUrl: string;
  designName?: string;
  isSelected?: boolean;
  onThumbnailClick: () => void;
}

const ThumbnailMessage: React.FC<ThumbnailMessageProps> = ({
  imageUrl,
  designName,
  isSelected = false,
  onThumbnailClick,
}) => {
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="mt-2">
      <div 
        className={`inline-block cursor-pointer transition-all hover:scale-105 ${
          isSelected ? 'ring-2 ring-sock-purple ring-offset-2' : 'hover:ring-1 hover:ring-gray-300'
        }`}
        onClick={onThumbnailClick}
      >
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {imageError ? (
            <div className="flex flex-col items-center justify-center text-gray-400 text-xs">
              <AlertCircle className="h-6 w-6 mb-1" />
              <span>加载失败</span>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={designName || '设计缩略图'}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
        </div>
      </div>
      {designName && (
        <p className="text-xs text-gray-600 mt-1 max-w-20 truncate">
          {designName}
        </p>
      )}
    </div>
  );
};

export default ThumbnailMessage;
