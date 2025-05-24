
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, File } from 'lucide-react';
import RegenerateButton from '@/components/RegenerateButton';

interface EditingViewProps {
  design: {
    id: number;
    imageUrl: string;
  };
  onExitEdit: () => void;
  onDownload: (id: number) => void;
  onVectorize: (id: number) => void;
}

const EditingView: React.FC<EditingViewProps> = ({
  design,
  onExitEdit,
  onDownload,
  onVectorize
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // 注释：这里需要连接AI图片生成API重新生成当前设计
    // 推荐使用：DALL-E, Midjourney, 或 Stable Diffusion
    // 通过Supabase Edge Functions调用API
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Refreshing design:', design.id);
      // 在真实实现中，这里会更新设计图片
    } catch (error) {
      console.error('Failed to refresh design:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="h-[80vh] flex flex-col animate-fade-in">
      <Card className="flex-1 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onExitEdit}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>编辑设计 #{design.id}</CardTitle>
            </div>
            <div className="flex space-x-2">
              <RegenerateButton 
                onRegenerate={handleRefresh}
                isGenerating={isRefreshing}
                label="刷新"
              />
              <Button variant="outline" size="sm" onClick={() => onDownload(design.id)}>
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
              <Button variant="outline" size="sm" onClick={() => onVectorize(design.id)}>
                <File className="h-4 w-4 mr-2" />
                矢量化
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-lg w-full">
            <img 
              src={design.imageUrl} 
              alt={`袜子设计 ${design.id}`} 
              className="w-full h-auto rounded-lg shadow-lg border transition-transform hover:scale-105"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditingView;
