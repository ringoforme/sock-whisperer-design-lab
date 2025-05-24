import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Book, Utensils, BarChart, Send } from 'lucide-react';
import DesignExamples from '@/components/DesignExamples';
import QuickPrompts from '@/components/QuickPrompts';
import ApiKeyConfig from '@/components/ApiKeyConfig';
import { DesignExample } from '@/data/designExamples';
import { llmService } from '@/services/llmService';
import { useToast } from '@/hooks/use-toast';

const Home = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      toast({
        title: "文件已选择",
        description: `已选择文件: ${e.target.files[0].name}`
      });
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleCreateClick = async () => {
    if (chatInput.trim()) {
      // 如果有输入内容，带着prompt跳转到设计页面
      const params = new URLSearchParams({ prompt: chatInput });
      navigate(`/design?${params.toString()}`);
    } else {
      // 没有输入内容，直接跳转
      navigate('/design');
    }
  };

  const handleCustomizedClick = () => {
    if (chatInput.trim()) {
      const params = new URLSearchParams({ prompt: chatInput });
      navigate(`/customized?${params.toString()}`);
    } else {
      navigate('/customized');
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    // 检查是否配置了LLM
    if (!llmService.isConfigured()) {
      setShowApiConfig(true);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await llmService.sendMessage(chatInput);
      
      if (response.success) {
        toast({
          title: "AI回复",
          description: response.message
        });
        
        // 自动跳转到设计页面
        setTimeout(() => {
          handleCreateClick();
        }, 2000);
      } else {
        toast({
          title: "错误",
          description: response.error || "AI服务不可用",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "发送消息失败",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setChatInput(prompt);
    // 自动发送或者让用户确认
    toast({
      title: "已填入提示词",
      description: "您可以修改后点击发送或直接创建设计"
    });
  };

  const handleExampleClick = (example: DesignExample) => {
    // 跳转到设计页面并传递示例数据
    const params = new URLSearchParams({ 
      prompt: example.prompt,
      example: example.id.toString()
    });
    navigate(`/design?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (showApiConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-red-50 flex items-center justify-center p-4">
        <ApiKeyConfig onConfigured={() => setShowApiConfig(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-red-50">
      {/* Header */}
      <header className="py-4 px-4">
        <div className="container mx-auto max-w-7xl flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 w-8 h-8 rounded-md mr-2"></div>
            <h1 className="text-2xl font-bold">Sox Lab工作室</h1>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>登录</Button>
            <Button className="bg-black hover:bg-gray-800 text-white">免费开始</Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section with Enhanced Chat Box */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              创造属于您的 <span className="relative">
                <span>Sox Lab作品</span>
                <span className="absolute -right-12 top-0">
                  <div className="bg-gradient-to-r from-orange-500 to-pink-500 w-8 h-8 rounded-md"></div>
                </span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12">
              从创意到落地，您的私人袜子设计师
            </p>
            
            {/* Enhanced Chat box */}
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 mb-8">
              <input 
                type="text" 
                placeholder="让Sox Lab为您创造一个..." 
                className="w-full px-4 py-3 text-lg bg-transparent border-none focus:outline-none"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div>
                  {/* Hidden file input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    style={{ display: 'none' }} 
                    accept="image/*" 
                  />
                  <Button variant="outline" size="sm" onClick={handleAttachClick}>
                    {selectedFile ? `${selectedFile.name.slice(0, 15)}...` : "上传"}
                  </Button>
                </div>
                <div className="flex items-center">
                  <Button variant="outline" size="sm" className="mr-2" onClick={handleCreateClick}>
                    创建
                  </Button>
                  <Button variant="outline" size="sm" className="mr-2" onClick={handleCustomizedClick}>
                    定制
                  </Button>
                  <Button 
                    size="sm" 
                    className="rounded-full aspect-square p-2 bg-sock-purple hover:bg-sock-dark-purple"
                    onClick={handleSendMessage}
                    disabled={isProcessing}
                  >
                    <Send className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Quick Prompt Buttons */}
            <QuickPrompts onPromptClick={handlePromptClick} />
            
            {/* App buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" className="bg-white flex items-center gap-2 px-4 py-2 rounded-full">
                <FileText className="h-4 w-4" />
                <span>文件上传器</span>
              </Button>
              <Button variant="outline" className="bg-white flex items-center gap-2 px-4 py-2 rounded-full">
                <Book className="h-4 w-4" />
                <span>笔记应用</span>
              </Button>
              <Button variant="outline" className="bg-white flex items-center gap-2 px-4 py-2 rounded-full">
                <Utensils className="h-4 w-4" />
                <span>食谱查找器</span>
              </Button>
              <Button variant="outline" className="bg-white flex items-center gap-2 px-4 py-2 rounded-full">
                <BarChart className="h-4 w-4" />
                <span>图表仪表板</span>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Design Examples Section */}
        <DesignExamples onExampleClick={handleExampleClick} />
      </main>

      <footer className="py-8 px-4 text-center text-gray-500 text-sm">
        <div className="container mx-auto">
          <p>© 2025 Sox Lab工作室. 由Sox Lab工作室提供支持。</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
