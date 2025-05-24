
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Download, File, Edit, PaperclipIcon, MessageSquare, Send } from 'lucide-react';
import ChatWindow from '@/components/ChatWindow';
import EditingView from '@/components/EditingView';
import RegenerateButton from '@/components/RegenerateButton';
import { useDesignStorage } from '@/hooks/useDesignStorage';

const DesignLab = () => {
  const [chatInput, setChatInput] = useState('');
  const [chatMode, setChatMode] = useState(true);
  const [messages, setMessages] = useState<{text: string, sender: 'user' | 'ai'}[]>([
    {text: "您今天想要创作什么样的袜子设计呢？", sender: 'ai'}
  ]);
  const [designs, setDesigns] = useState<{id: number, imageUrl: string, isEditing?: boolean}[]>([
    {id: 1, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format'},
    {id: 2, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format'},
    {id: 3, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format'},
    {id: 4, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format'},
    {id: 5, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format'},
    {id: 6, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format'},
  ]);
  const [selectedDesign, setSelectedDesign] = useState<number | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { addDesign } = useDesignStorage();

  // Check if there's an initial prompt from the homepage
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialPrompt = params.get('prompt');
    
    if (initialPrompt) {
      // Add user message with the initial prompt
      handleInitialPrompt(initialPrompt);
    }
  }, [location]);

  const handleInitialPrompt = (prompt: string) => {
    setMessages([
      ...messages,
      {text: prompt, sender: 'user' as const}
    ]);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {text: "我理解您的需求。让我为您创作一些袜子设计。", sender: 'ai' as const}
      ]);
    }, 1000);
  };
  
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    // Add user message to chat
    const newMessages = [...messages, {text: chatInput, sender: 'user' as const}];
    setMessages(newMessages);
    
    // Simulate AI response
    setTimeout(() => {
      if (chatMode) {
        setMessages([...newMessages, {
          text: "我理解您的要求。让我想想如何帮助您实现这个设计。", 
          sender: 'ai' as const
        }]);
      } else {
        setMessages([...newMessages, {
          text: "我已根据您的输入创建了一些新的袜子设计。请在右侧查看！", 
          sender: 'ai' as const
        }]);
        // In a real app, you'd generate new designs here
      }
    }, 1000);
    
    setChatInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // In a real app, you'd handle the file upload here
      const newMessage = `已上传文件：${e.target.files[0].name}`;
      setMessages([...messages, {text: newMessage, sender: 'user' as const}]);
    }
  };

  const toggleChatMode = () => {
    setChatMode(!chatMode);
  };

  const handleDownload = (id: number) => {
    console.log('Downloading design:', id);
    const design = designs.find(d => d.id === id);
    if (design) {
      // 注释：这里需要实现真实的下载功能
      // 需要连接文件存储服务，如Supabase Storage
      addDesign({
        id: id.toString(),
        imageUrl: design.imageUrl,
        title: `设计 #${id}`,
        createdAt: new Date().toISOString(),
        type: 'downloaded'
      }, 'downloaded');
      toast.success(`正在下载设计 #${id}`);
    }
  };

  const handleVectorize = (id: number) => {
    console.log('Vectorizing design:', id);
    const design = designs.find(d => d.id === id);
    if (design) {
      // 注释：这里需要实现矢量化功能
      // 需要连接矢量化API或服务
      addDesign({
        id: id.toString(),
        imageUrl: design.imageUrl,
        title: `设计 #${id}`,
        createdAt: new Date().toISOString(),
        type: 'vectorized'
      }, 'vectorized');
      toast.success(`正在矢量化设计 #${id}`);
    }
  };

  const handleEdit = (id: number) => {
    console.log('Editing design:', id);
    
    // 保存到草稿库
    const design = designs.find(d => d.id === id);
    if (design) {
      addDesign({
        id: id.toString(),
        imageUrl: design.imageUrl,
        title: `设计 #${id}`,
        createdAt: new Date().toISOString(),
        type: 'draft'
      }, 'drafts');
    }
    
    // 进入编辑模式
    setSelectedDesign(id);
    setIsEditingMode(true);
    
    // 标记设计为编辑状态
    setDesigns(designs.map(design => ({
      ...design,
      isEditing: design.id === id
    })));
    
    // 更新聊天上下文
    setMessages(prev => [
      ...prev,
      {text: `现在正在编辑设计 #${id}。请告诉我您想要做什么改动？`, sender: 'ai' as const}
    ]);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    
    // 注释：这里需要连接AI图片生成API
    // 推荐使用：DALL-E, Midjourney, 或 Stable Diffusion
    // 通过Supabase Edge Functions调用API
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 生成新的设计图片URLs
      const newDesigns = Array.from({ length: 6 }, (_, index) => ({
        id: Date.now() + index,
        imageUrl: `https://images.unsplash.com/photo-${Date.now() + index}?w=500&auto=format`
      }));
      
      setDesigns(newDesigns);
      toast.success('已重新生成6张新设计！');
      
      setMessages(prev => [
        ...prev,
        {text: "我已为您重新生成了6张全新的袜子设计！", sender: 'ai' as const}
      ]);
    } catch (error) {
      toast.error('重新生成失败，请稍后重试');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExitEdit = () => {
    setIsEditingMode(false);
    setSelectedDesign(null);
    
    // Clear editing state from designs
    setDesigns(designs.map(design => ({
      ...design,
      isEditing: false
    })));
    
    // Add message about returning to overview
    setMessages(prev => [
      ...prev,
      {text: "感谢您的编辑！我回到了概览模式。请随时编辑其他设计或创建新的设计。", sender: 'ai' as const}
    ]);
  };

  const handleSockDesignPrompt = (message: string) => {
    // Add user message to chat
    setMessages(prev => [...prev, {text: message, sender: 'user' as const}]);
    
    // Simulate AI processing and response
    setTimeout(() => {
      // In a real app, you would process the message and generate/update designs
      setMessages(prev => [...prev, {
        text: isEditingMode && selectedDesign 
          ? `我已根据您的要求更新了设计 #${selectedDesign}。您可以在预览中看到更改。`
          : "我已根据您的描述创建了一些袜子设计！",
        sender: 'ai' as const
      }]);
    }, 1500);
  };

  const getSelectedDesignData = () => {
    return designs.find(design => design.id === selectedDesign);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sock-purple">袜匠设计工作室</h1>
          <nav className="flex items-center space-x-4">
            <Link to="/drafts" className="text-gray-700 hover:text-sock-purple transition-colors">
              草稿
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {/* Chat Area */}
          <div className="h-[80vh] flex flex-col border rounded-lg overflow-hidden">
            <ChatWindow onSendMessage={handleSockDesignPrompt} />
          </div>
          
          {/* Design Area - Dynamic based on editing mode */}
          <div className="h-[80vh] overflow-y-auto">
            {isEditingMode && selectedDesign && getSelectedDesignData() ? (
              <EditingView 
                design={getSelectedDesignData()!}
                onExitEdit={handleExitEdit}
                onDownload={handleDownload}
                onVectorize={handleVectorize}
              />
            ) : (
              <div>
                {/* Run 重新生成按钮 */}
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">设计作品</h2>
                  <RegenerateButton 
                    onRegenerate={handleRegenerate}
                    isGenerating={isRegenerating}
                    label="重新生成6张"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {designs.map((design) => (
                    <Card 
                      key={design.id} 
                      className={`overflow-hidden transition-all ${design.isEditing ? 'ring-2 ring-sock-purple' : ''}`}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square relative">
                          <img 
                            src={design.imageUrl} 
                            alt={`袜子设计 ${design.id}`} 
                            className="w-full h-full object-cover"
                          />
                          {design.isEditing && (
                            <div className="absolute top-2 right-2 bg-sock-purple text-white text-xs px-2 py-1 rounded">
                              编辑中
                            </div>
                          )}
                        </div>
                        <div className="p-3 flex justify-between items-center">
                          <span className="text-sm font-medium">设计 #{design.id}</span>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleDownload(design.id)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleVectorize(design.id)}>
                              <File className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant={design.isEditing ? "default" : "ghost"} 
                              size="icon" 
                              onClick={() => handleEdit(design.id)}
                              className={design.isEditing ? "text-white bg-sock-purple" : ""}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  );
};

export default DesignLab;
