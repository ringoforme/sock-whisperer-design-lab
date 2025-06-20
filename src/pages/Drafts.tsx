
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import DesignLibrary from '@/components/DesignLibrary';
import AppHeader from '@/components/AppHeader';
import { useDesignStorage } from '@/hooks/useDesignStorage';
import { Design } from '@/types/design';
import { toast } from 'sonner';

const Drafts = () => {
  const navigate = useNavigate();
  const { library, addDesign, removeDesign } = useDesignStorage();

  const handleEdit = (design: Design) => {
    console.log('Editing design:', design.id);
    // 跳转到编辑页面
    navigate(`/edit/${design.id}`);
  };
  
  const handleDownload = (design: Design) => {
    console.log('Downloading design:', design.id);
    // 注释：这里需要实现真实的下载功能
    // 需要连接文件存储服务，如Supabase Storage
    
    if (design.type !== 'downloaded') {
      addDesign({ ...design, type: 'downloaded' }, 'downloaded');
    }
    toast.success(`已下载设计: ${design.title}`);
  };
  
  const handleVectorize = (design: Design) => {
    console.log('Vectorizing design:', design.id);
    // 注释：这里需要实现矢量化功能
    // 需要连接矢量化API或服务
    
    if (design.type !== 'vectorized') {
      addDesign({ ...design, type: 'vectorized' }, 'vectorized');
    }
    toast.success(`已矢量化设计: ${design.title}`);
  };

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
              <TabsTrigger value="drafts">草稿库</TabsTrigger>
              <TabsTrigger value="edited">编辑库</TabsTrigger>
              <TabsTrigger value="vectorized">矢量库</TabsTrigger>
              <TabsTrigger value="downloaded">下载库</TabsTrigger>
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
                保存所有您查看过的设计稿
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
