import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Edit, ArrowLeft, File, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DesignLibraryWithSkeleton from '@/components/DesignLibraryWithSkeleton';
import AppHeader from '@/components/AppHeader';
import { useDesignStorage } from '@/hooks/useDesignStorage';
import { downloadService } from '@/services/downloadService';
import { sessionService } from '@/services/sessionService';
import { toast } from 'sonner';
import type { Design } from '@/types/design';

const Drafts = () => {
  const { library, loading, error, markAsDownloaded, markAsVectorized, markAsEdited, refreshLibrary } = useDesignStorage();
  const navigate = useNavigate();

  const handleDownload = async (design: Design) => {
    try {
      const success = await downloadService.downloadImage(design.imageUrl, design.title);
      if (success) {
        await markAsDownloaded(design.id);
        toast.success("图片下载成功！");
      } else {
        toast.error("下载失败，请重试");
      }
    } catch (error) {
      console.error('下载处理失败:', error);
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

  const handleEdit = async (design: Design) => {
    try {
      console.log('处理编辑请求，设计ID:', design.id);
      
      const sessionInfo = await sessionService.getSessionByImageId(design.id);
      
      if (sessionInfo) {
        console.log('找到会话信息:', sessionInfo);
        await markAsEdited(design.id);
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

  const handleImageClick = async (design: Design) => {
    try {
      console.log('处理图片点击，设计ID:', design.id);
      
      const sessionInfo = await sessionService.getSessionByImageId(design.id);
      
      if (sessionInfo) {
        console.log('找到会话信息:', sessionInfo);
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

  if (error && error.includes('未登录')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
          <h1 className="text-xl font-semibold">需要登录</h1>
          <p className="text-gray-600">请先登录以查看您的设计库</p>
          <Button onClick={() => navigate('/auth')}>前往登录</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <AppHeader title="设计库" />
          <nav className="flex items-center space-x-4">
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
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={refreshLibrary}
              disabled={loading}
            >
              刷新数据
            </Button>
            <Link to="/design">
              <Button className="bg-sock-purple hover:bg-sock-purple/90 text-white">
                新建设计
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="drafts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="drafts">草稿库 ({library.drafts.length})</TabsTrigger>
            <TabsTrigger value="edited">编辑库 ({library.edited.length})</TabsTrigger>
            <TabsTrigger value="vectorized">矢量库 ({library.vectorized.length})</TabsTrigger>
            <TabsTrigger value="downloaded">下载库 ({library.downloaded.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="drafts">
            <DesignLibraryWithSkeleton
              designs={library.drafts}
              title="草稿库"
              loading={loading}
              error={error}
              onEdit={handleEdit}
              onDownload={handleDownload}
              onVectorize={handleVectorize}
              onImageClick={handleImageClick}
              onRefresh={refreshLibrary}
            />
          </TabsContent>

          <TabsContent value="edited">
            <DesignLibraryWithSkeleton
              designs={library.edited}
              title="编辑库"
              loading={loading}
              error={error}
              onEdit={handleEdit}
              onDownload={handleDownload}
              onVectorize={handleVectorize}
              onImageClick={handleImageClick}
              onRefresh={refreshLibrary}
            />
          </TabsContent>

          <TabsContent value="vectorized">
            <DesignLibraryWithSkeleton
              designs={library.vectorized}
              title="矢量库"
              loading={loading}
              error={error}
              onEdit={handleEdit}
              onDownload={handleDownload}
              onVectorize={handleVectorize}
              onImageClick={handleImageClick}
              onRefresh={refreshLibrary}
            />
          </TabsContent>

          <TabsContent value="downloaded">
            <DesignLibraryWithSkeleton
              designs={library.downloaded}
              title="下载库"
              loading={loading}
              error={error}
              onEdit={handleEdit}
              onDownload={handleDownload}
              onVectorize={handleVectorize}
              onImageClick={handleImageClick}
              onRefresh={refreshLibrary}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Drafts;
