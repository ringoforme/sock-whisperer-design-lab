
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, File, Edit, AlertCircle } from 'lucide-react';

interface DesignImageDisplayProps {
  imageUrl: string;
  designName: string;
  error?: string;
  isEditing?: boolean;
  showEditButton?: boolean;
  onImageClick?: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
  onVectorize?: () => void;
  className?: string;
}

const DesignImageDisplay: React.FC<DesignImageDisplayProps> = ({
  imageUrl,
  designName,
  error,
  isEditing = false,
  showEditButton = true,
  onImageClick,
  onEdit,
  onDownload,
  onVectorize,
  className
}) => {
  return (
    <div className={`flex justify-center ${className || ''}`}>
      <Card className={`w-full max-w-2xl overflow-hidden transition-all ${isEditing ? "ring-2 ring-sock-purple" : ""} ${error ? "border-red-300" : ""}`}>
        {showEditButton && (
          <CardHeader className="pb-4">
            <CardTitle className="text-base">{designName}</CardTitle>
          </CardHeader>
        )}
        <CardContent className={showEditButton ? "p-0" : "p-8"}>
          <div className="aspect-square relative bg-gray-100">
            <img 
              src={imageUrl} 
              alt={designName}
              className={`w-full h-full object-cover transition-transform ${!error ? "cursor-pointer hover:scale-105" : ""} ${showEditButton ? "" : "rounded-lg shadow-lg"}`}
              onClick={onImageClick}
            />
            {error && (
              <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex flex-col items-center justify-center text-white p-2">
                <AlertCircle className="h-8 w-8 mb-2" />
                <span className="text-sm font-bold text-center">
                  生成失败
                </span>
              </div>
            )}
            {showEditButton && !error && (
              <div className="absolute bottom-2 right-2">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  onClick={onEdit}
                  className={isEditing ? "bg-sock-purple text-white" : "bg-white/90 hover:bg-white"}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          {showEditButton && (
            <div className="p-3">
              <span className={`text-sm font-medium ${error ? "text-red-500" : ""}`}>
                {designName}
              </span>
            </div>
          )}
        </CardContent>
        {!showEditButton && (
          <div className="flex justify-center space-x-4 mt-6">
            <Button variant="outline" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              下载
            </Button>
            <Button variant="outline" onClick={onVectorize}>
              <File className="h-4 w-4 mr-2" />
              矢量化
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DesignImageDisplay;
