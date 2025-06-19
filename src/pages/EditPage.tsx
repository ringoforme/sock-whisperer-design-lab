import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, File, Save } from 'lucide-react';
import RegenerateButton from '@/components/RegenerateButton';
import ImageModal from '@/components/ImageModal';
import { useDesignStorage } from '@/hooks/useDesignStorage';
import { Design } from '@/types/design';
import { toast } from 'sonner';

const EditPage = () => {
  const { designId } = useParams<{ designId: string }>();
  const navigate = useNavigate();
  const { library, updateDesign, addDesign } = useDesignStorage();
  const [currentDesign, setCurrentDesign] = useState<Design | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    if (designId) {
      // 从所有库中查找设计
      const allDesigns = [
        ...library.edited,
        ...library.drafts,
        ...library.vectorized,
        ...library.downloaded
      ];
      const design = allDesigns.find(d => d.id === designId);
      if (design) {
        setCurrentDesign(design);
      } else {
        toast.error('设计未找到');
        navigate('/design');
      }
    }
  }, [designId, library, navigate]);

  const handleRegenerate = async () => {
    if (!currentDesign) return;
    
    setIsRegenerating(true);
    // 注释：这里需要连接AI图片生成API
    // 推荐使用：DALL-E, Midjourney, 或 Stable Diffusion
    // 通过Supabase Edge Functions调用API
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟新的图片URL
      const newImageUrl = `https://images.unsplash.com/photo-${Date.now()}?w=500&auto=format`;
      
      const updatedDesign = {
        ...currentDesign,
        imageUrl: newImageUrl,
        editHistory: [
          ...(currentDesign.editHistory || []),
          {
            id: Date.now().toString(),
            action: 'regenerate',
            timestamp: new Date().toISOString(),
            changes: { imageUrl: newImageUrl }
          }
        ]
      };
      
      setCurrentDesign(updatedDesign);
      toast.success('设计已重新生成');
    } catch (error) {
      toast.error('重新生成失败');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSave = () => {
    if (!currentDesign) return;
    
    // 保存到编辑库
    const editedDesign = {
      ...currentDesign,
      type: 'edited' as const,
      title: `编辑版 - ${currentDesign.title}`
    };
    
    addDesign(editedDesign, 'edited');
    toast.success('设计已保存到编辑库');
  };

  const handleDownload = () => {
    if (!currentDesign) return;
    
    // 注释：这里需要实现真实的下载功能
    // 需要连接文件存储服务，如Supabase Storage
    console.log('Downloading design:', currentDesign.id);
    
    addDesign({ ...currentDesign, type: 'downloaded' }, 'downloaded');
    toast.success('设计已添加到下载库');
  };

  const handleVectorize = () => {
    if (!currentDesign) return;
    
    // 注释：这里需要实现矢量化功能
    // 需要连接矢量化API或服务
    console.log('Vectorizing design:', currentDesign.id);
    
    addDesign({ ...currentDesign, type: 'vectorized' }, 'vectorized');
    toast.success('设计已添加到矢量化库');
  };

  const handleImageClick = () => {
    setIsImageModalOpen(true);
  };

  if (!currentDesign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/design')}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-sock-purple">编辑设计</h1>
          </div>
          <div className="flex space-x-2">
            <RegenerateButton 
              onRegenerate={handleRegenerate}
              isGenerating={isRegenerating}
              label="刷新"
            />
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{currentDesign.title}</CardTitle>
            {currentDesign.originalPrompt && (
              <p className="text-sm text-gray-600">
                原始提示词: {currentDesign.originalPrompt}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="aspect-square relative mb-6">
              <img 
                src={currentDesign.imageUrl} 
                alt={currentDesign.title}
                className="w-full h-full object-cover rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform"
                onClick={handleImageClick}
              />
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
              <Button variant="outline" onClick={handleVectorize}>
                <File className="h-4 w-4 mr-2" />
                矢量化
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* 图片预览模态框 */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={currentDesign.imageUrl}
        imageTitle={currentDesign.title}
      />
    </div>
  );
};

export default EditPage;
