import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Edit, ArrowLeft, File } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DesignLibrary from '@/components/DesignLibrary';
import { useDesignStorage } from '@/hooks/useDesignStorage';
import { downloadService } from '@/services/downloadService';
import { sessionService } from '@/services/sessionService';
import { toast } from 'sonner';
import type { Design } from '@/types/design';

const Drafts = () => {
  const { library, loading, markAsDownloaded, markAsVectorized, markAsEdited } = useDesignStorage();
  const navigate = useNavigate();

  const handleDownload = async (design: Design) => {
    const success = await downloadService.downloadImage(design.imageUrl, design.title);
    if (success) {
      await markAsDownloaded(design.id);
      toast.success("图片下载成功！");
    } else {
      toast.error("下载失败，请重试");
    }
  };

  const handleVectorize = async (design: Design) => {
    try {
      await markAsVectorized(design.id);
      toast.success("矢量化处理已完成");
    } catch (error) {
      toast.error("矢量化处理失败");
    }
  };

  // Updated to navigate to session with edit mode
  const handleEdit = async (design: Design) => {
    try {
      console.log('处理编辑请求，设计ID:', design.id);
      
      // Get session info for this image
      const sessionInfo = await sessionService.getSessionByImageId(design.id);
      
      if (sessionInfo) {
        console.log('找到会话信息:', sessionInfo);
        
        // Mark as edited
        await markAsEdited(design.id);
        
        // Navigate to design studio with session and image parameters
        navigate(`/design?sessionId=${sessionInfo.session_id}&imageId=${design.id}`);
        toast.success("正在跳转到编辑模式...");
      } else {
        console.warn('未找到对应的会话信息');
        toast.error("无法找到对应的设计会话");
      }
    } catch (error) {
      console.error('处理编辑请求失败:', error);
      toast.error("跳转到编辑模式失败");
    }
  };

  // Handle image click to navigate to session
  const handleImageClick = async (design: Design) => {
    try {
      console.log('处理图片点击，设计ID:', design.id);
      
      // Get session info for this image
      const sessionInfo = await sessionService.getSessionByImageId(design.id);
      
      if (sessionInfo) {
        console.log('找到会话信息:', sessionInfo);
        
        // Navigate to design studio with session parameter
        navigate(`/design?sessionId=${sessionInfo.session_id}`);
        toast.success("正在跳转到设计会话...");
      } else {
        console.warn('未找到对应的会话信息');
        toast.error("无法找到对应的设计会话");
      }
    } catch (error) {
      console.error('处理图片点击失败:', error);
      toast.error("跳转到设计会话失败");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sock-purple"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <AppHeader title="设计库" />
          <nav className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/design')}
              className="bg-sock-purple hover:bg-sock-dark-purple text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Design
            </Button>
            <Link to="/design" className="text-gray-700 hover:text-sock-purple transition-colors">
              设计工作室
            </Link>
            <Link to="/profile" className="ml-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="用户" />
                <AvatarFallback>用户</AvatarFallback>
              </Avatar>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">我的设计库</h1>
          <Link to="/design">
            <Button className="bg-sock-purple hover:bg-sock-purple/90 text-white">
              新建设计
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="drafts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="drafts">草稿库 ({library.drafts.length})</TabsTrigger>
            <TabsTrigger value="edited">编辑库 ({library.edited.length})</TabsTrigger>
            <TabsTrigger value="vectorized">矢量库 ({library.vectorized.length})</TabsTrigger>
            <TabsTrigger value="downloaded">下载库 ({library.downloaded.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="drafts">
            <DesignLibrary
              designs={library.drafts}
              title="草稿库"
              onEdit={handleEdit}
              onDownload={handleDownload}
              onVectorize={handleVectorize}
              onImageClick={handleImageClick}
            />
          </TabsContent>

          <TabsContent value="edited">
            <DesignLibrary
              designs={library.edited}
              title="编辑库"
              onEdit={handleEdit}
              onDownload={handleDownload}
              onVectorize={handleVectorize}
              onImageClick={handleImageClick}
            />
          </TabsContent>

          <TabsContent value="vectorized">
            <DesignLibrary
              designs={library.vectorized}
              title="矢量库"
              onEdit={handleEdit}
              onDownload={handleDownload}
              onVectorize={handleVectorize}
              onImageClick={handleImageClick}
            />
          </TabsContent>

          <TabsContent value="downloaded">
            <DesignLibrary
              designs={library.downloaded}
              title="下载库"
              onEdit={handleEdit}
              onDownload={handleDownload}
              onVectorize={handleVectorize}
              onImageClick={handleImageClick}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Drafts;
