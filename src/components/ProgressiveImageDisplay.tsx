
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, File, Edit, AlertCircle } from 'lucide-react';

interface ProgressiveImageDisplayProps {
  isGenerating: boolean;
  onDownload: () => void;
  onVectorize: () => void;
  onEdit: () => void;
  onImageClick: () => void;
  finalImageUrl?: string;
  designName?: string;
  error?: string;
}

interface ProgressStage {
  name: string;
  description: string;
}

const PROGRESS_STAGES: ProgressStage[] = [
  { name: '构思中', description: '正在理解您的设计需求...' },
  { name: '绘制轮廓', description: '开始勾勒基本形状...' },
  { name: '添加细节', description: '丰富图案和纹理...' },
  { name: '完善设计', description: '调整色彩和最终效果...' }
];

const ProgressiveImageDisplay: React.FC<ProgressiveImageDisplayProps> = ({
  isGenerating,
  onDownload,
  onVectorize,
  onEdit,
  onImageClick,
  finalImageUrl,
  designName,
  error
}) => {
  const [currentImage, setCurrentImage] = useState<string>('');
  const [currentStage, setCurrentStage] = useState(0);
  const [expandedPrompt, setExpandedPrompt] = useState<string>('');

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStage(0);
      setCurrentImage('');
      setExpandedPrompt('');
      return;
    }

    // Connect to streaming endpoint
    const eventSource = new EventSource('/functions/v1/generate-sock-design');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'expanded_prompt':
            setExpandedPrompt(data.data);
            setCurrentStage(1);
            break;
            
          case 'partial_image':
            const imageUrl = `data:image/png;base64,${data.data}`;
            setCurrentImage(imageUrl);
            setCurrentStage(Math.min(data.index + 1, PROGRESS_STAGES.length - 1));
            break;
            
          case 'final_image':
            const finalUrl = `data:image/png;base64,${data.data}`;
            setCurrentImage(finalUrl);
            setCurrentStage(PROGRESS_STAGES.length - 1);
            eventSource.close();
            break;
            
          case 'error':
            console.error('生成错误:', data.data);
            eventSource.close();
            break;
        }
      } catch (parseError) {
        console.error('解析事件数据失败:', parseError);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource 错误:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [isGenerating]);

  // Use final image if generation is complete and we have one
  const displayImage = finalImageUrl || currentImage;
  const hasImage = !!displayImage && !error;

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl mx-auto overflow-hidden transition-all">
        <CardContent className="p-6">
          {/* Buttons above the image */}
          {hasImage && (
            <div className="flex justify-center space-x-4 mb-6">
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
          
          {/* Image container */}
          <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
            {error ? (
              <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex flex-col items-center justify-center text-white p-2">
                <AlertCircle className="h-8 w-8 mb-2" />
                <span className="text-sm font-bold text-center">生成失败</span>
              </div>
            ) : hasImage ? (
              <>
                <img 
                  src={displayImage} 
                  alt={designName || '设计'} 
                  className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                  onClick={onImageClick}
                />
                {/* Floating edit button */}
                <div className="absolute bottom-2 right-2">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    onClick={onEdit}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sock-purple mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">
                  {PROGRESS_STAGES[currentStage]?.name || '准备中...'}
                </h3>
                <p className="text-sm text-center px-4">
                  {PROGRESS_STAGES[currentStage]?.description || '正在准备生成您的设计...'}
                </p>
                {expandedPrompt && (
                  <div className="mt-4 px-4 text-xs text-gray-500 text-center">
                    设计理念: {expandedPrompt.slice(0, 100)}...
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <span>等待生成设计...</span>
              </div>
            )}
          </div>
          
          {/* Design name */}
          {designName && hasImage && (
            <div className="mt-3 text-center">
              <span className="text-sm font-medium">{designName}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressiveImageDisplay;
