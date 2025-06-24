
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2 } from 'lucide-react';
import DesignLibrary from '@/components/DesignLibrary';
import AppHeader from '@/components/AppHeader';
import { useDesignStorage } from '@/hooks/useDesignStorage';
import { Design } from '@/types/design';
import { toast } from 'sonner';

const Drafts = () => {
  const navigate = useNavigate();
  const { library, loading, markAsEdited, markAsVectorized, markAsDownloaded } = useDesignStorage();

  const handleEdit = async (design: Design) => {
    console.log('编辑设计:', design.id);
    try {
      await markAsEdited(design.id);
      toast.success(`设计已标记为编辑状态: ${design.title}`);
      // 跳转到编辑页面
      navigate(`/edit/${design.id}`);
    } catch (error) {
      console.error('标记编辑状态失败:', error);
      toast.error('标记编辑状态失败');
    }
  };
  
  const handleDownload = async (design: Design) => {
    console.log('下载设计:', design.id);
    try {
      // 创建下载链接
      const link = document.createElement('a');
      link.href = design.imageUrl;
      link.download = `${design.title}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 标记为已下载
      await markAsDownloaded(design.id);
      toast.success(`已下载设计: ${design.title}`);
    } catch (error) {
      console.error('下载失败:', error);
      toast.error('下载失败，请重试');
    }
  };
  
  const handleVectorize = async (design: Design) => {
    console.log('矢量化设计:', design.id);
    try {
      // 标记为已矢量化
      await markAsVectorized(design.id);
      toast.success(`已矢量化设计: ${design.title}`);
    } catch (error) {
      console.error('矢量化失败:', error);
      toast.error('矢量化失败，请重试');
    }
  };

  if (loading) {
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

        <main className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>加载设计库中...</span>
            </div>
          </div>
        </main>
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

      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">我的设计库</h2>
            <p className="text-gray-600">管理您的所有袜子设计作品</p>
          </div>

          <Tabs defaultValue="drafts" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="drafts">
                草稿库 ({library.drafts.length})
              </TabsTrigger>
              <TabsTrigger value="edited">
                编辑库 ({library.edited.length})
              </TabsTrigger>
              <TabsTrigger value="vectorized">
                矢量库 ({library.vectorized.length})
              </TabsTrigger>
              <TabsTrigger value="downloaded">
                下载库 ({library.downloaded.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="drafts" className="mt-6">
              <DesignLibrary
                designs={library.drafts}
                title="草稿库"
                onEdit={handleEdit}
                onDownload={handleDownload}
                onVectorize={handleVectorize}
              />
              <p className="text-sm text-gray-500 mt-4 text-center">
                保存所有您在设计工作室中成功生成的设计稿
              </p>
            </TabsContent>
            
            <TabsContent value="edited" className="mt-6">
              <DesignLibrary
                designs={library.edited}
                title="编辑库"
                onEdit={handleEdit}
                onDownload={handleDownload}
                onVectorize={handleVectorize}
              />
              <p className="text-sm text-gray-500 mt-4 text-center">
                保存所有您编辑过的设计作品
              </p>
            </TabsContent>
            
            <TabsContent value="vectorized" className="mt-6">
              <DesignLibrary
                designs={library.vectorized}
                title="矢量库"
                onEdit={handleEdit}
                onDownload={handleDownload}
                onVectorize={handleVectorize}
              />
              <p className="text-sm text-gray-500 mt-4 text-center">
                保存所有矢量化处理过的设计
              </p>
            </TabsContent>
            
            <TabsContent value="downloaded" className="mt-6">
              <DesignLibrary
                designs={library.downloaded}
                title="下载库"
                onEdit={handleEdit}
                onDownload={handleDownload}
                onVectorize={handleVectorize}
              />
              <p className="text-sm text-gray-500 mt-4 text-center">
                保存所有您下载过的设计文件
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Drafts;
