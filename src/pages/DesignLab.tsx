import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, Edit, AlertCircle, MessageCircle } from "lucide-react";
import ChatWindow from "@/components/ChatWindow";
import EditingView from "@/components/EditingView";
import AppHeader from "@/components/AppHeader";
import SessionHistorySidebar from "@/components/SessionHistorySidebar";
import ChatThumbnail from "@/components/ChatThumbnail";
import { useDesignStorage } from "@/hooks/useDesignStorage";
import { ConversationManager } from "@/services/conversationManager";
import { sessionService } from "@/services/sessionService";
import { generateDesigns } from "@/services/imageGeneration.service";
import { supabase } from "@/integrations/supabase/client";
import type { DesignData } from "@/types/design";
import type { DesignSession, GeneratedImage } from "@/services/sessionService";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  thumbnail?: React.ReactNode;
}

type DesignState = DesignData & {
  isEditing?: boolean;
  error?: string;
  imageId?: string;
};

const DesignLab = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    text: "欢迎来到Sox Lab设计工作室！我是您的专属设计助手。让我们开始创造属于您的独特袜子设计吧！请告诉我您想要什么样的袜子？",
    isUser: false
  }]);
  
  const [design, setDesign] = useState<DesignState | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationManager] = useState(() => new ConversationManager());
  const [currentSession, setCurrentSession] = useState<DesignSession | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const location = useLocation();
  const { addDesign } = useDesignStorage();

  // 页面加载时自动创建或加载会话
  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log('初始化会话...');
        
        const params = new URLSearchParams(location.search);
        const initialPrompt = params.get("prompt");
        
        if (initialPrompt) {
          // 如果有初始提示，创建新会话
          console.log('发现初始提示，创建新会话:', initialPrompt);
          await createNewSession(initialPrompt);
          handleSendMessage(initialPrompt);
        } else {
          // 否则尝试获取最近的会话
          const userSessions = await sessionService.getUserSessions();
          console.log('获取到用户会话:', userSessions.length);
          
          if (userSessions.length > 0) {
            const latestSession = userSessions[0];
            console.log('加载最新会话:', latestSession.id);
            await loadSession(latestSession.id);
          } else {
            // 如果没有任何会话，创建一个新的
            console.log('没有找到会话，创建新会话');
            await createNewSession("开始新的袜子设计");
          }
        }
      } catch (error) {
        console.error('初始化会话失败:', error);
        toast.error('初始化失败，请刷新页面重试');
      }
    };

    initializeSession();
  }, [location]);

  // 创建新会话
  const createNewSession = async (initialIdea?: string) => {
    try {
      const idea = initialIdea || "开始新的袜子设计";
      console.log('创建新会话，初始想法:', idea);
      
      const newSession = await sessionService.createSession(idea);
      setCurrentSession(newSession);
      
      // 重置状态
      setMessages([{
        id: 1,
        text: "欢迎来到Sox Lab设计工作室！我是您的专属设计助手。让我们开始创造属于您的独特袜子设计吧！请告诉我您想要什么样的袜子？",
        isUser: false
      }]);
      setDesign(null);
      setGeneratedImages([]);
      setSelectedImageId(null);
      setIsEditingMode(false);
      
      console.log('新会话创建成功:', newSession);
      toast.success('新会话已创建');
      return newSession;
    } catch (error) {
      console.error('创建新会话失败:', error);
      toast.error('创建新会话失败');
      throw error;
    }
  };

  // 加载会话历史
  const loadSession = async (sessionId: string) => {
    try {
      console.log('加载会话:', sessionId);
      const history = await sessionService.getSessionHistory(sessionId);
      
      if (!history.session) {
        toast.error('会话不存在');
        return;
      }

      setCurrentSession(history.session);
      setGeneratedImages(history.images);
      
      // 重建消息历史
      const welcomeMessage = {
        id: 1,
        text: "欢迎来到Sox Lab设计工作室！我是您的专属设计助手。让我们开始创造属于您的独特袜子设计吧！请告诉我您想要什么样的袜子？",
        isUser: false
      };
      
      const reconstructedMessages: Message[] = [welcomeMessage];
      let messageId = 2;
      
      // 重建对话历史
      history.messages.forEach((msg) => {
        reconstructedMessages.push({
          id: messageId++,
          text: msg.content,
          isUser: msg.role === 'user'
        });
      });
      
      // 在消息中添加图片缩略图
      history.images.forEach((img) => {
        reconstructedMessages.push({
          id: messageId++,
          text: `我已经为您生成了设计"${img.design_name}"。`,
          isUser: false,
          thumbnail: (
            <ChatThumbnail
              imageUrl={img.thumbnail_url || img.image_url}
              designName={img.design_name}
              onThumbnailClick={() => handleThumbnailClick(img.id)}
              isSelected={selectedImageId === img.id}
            />
          )
        });
      });
      
      setMessages(reconstructedMessages);
      
      // 如果有图片，显示最新的一张
      if (history.images.length > 0) {
        const latestImage = history.images[0];
        setDesign({
          url: latestImage.image_url,
          prompt_en: '', 
          design_name: latestImage.design_name,
          imageId: latestImage.id
        });
        setSelectedImageId(latestImage.id);
      }
      
      console.log('会话加载成功，消息数量:', reconstructedMessages.length);
      toast.success('会话加载成功');
    } catch (error) {
      console.error('加载会话失败:', error);
      toast.error('加载会话失败');
    }
  };

  // 处理缩略图点击
  const handleThumbnailClick = (imageId: string) => {
    const image = generatedImages.find(img => img.id === imageId);
    if (image) {
      setDesign({
        url: image.image_url,
        prompt_en: '', 
        design_name: image.design_name,
        imageId: image.id
      });
      setSelectedImageId(imageId);
      console.log('选择图片:', image.design_name);
    }
  };

  // 使用对话管理器生成智能回复
  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isGenerating) return;

    console.log('发送消息:', userMessage);

    // 确保有当前会话
    let session = currentSession;
    if (!session) {
      console.log('没有当前会话，创建新会话');
      session = await createNewSession(userMessage);
    }

    const userMsg = {
      id: Date.now(),
      text: userMessage,
      isUser: true
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // 记录用户消息到数据库
      if (session) {
        await sessionService.addMessage(session.id, 'user', userMessage);
      }

      // 使用对话管理器生成智能回复
      const aiResponse = await conversationManager.generateResponse(userMessage);
      
      const aiMsg = {
        id: Date.now() + 1,
        text: aiResponse,
        isUser: false
      };
      setMessages(prev => [...prev, aiMsg]);

      // 记录AI回复到数据库
      if (session) {
        await sessionService.addMessage(session.id, 'assistant', aiResponse);
      }

      console.log('消息发送成功');
    } catch (error) {
      console.error('生成回复失败:', error);
      const errorMsg = {
        id: Date.now() + 1,
        text: "抱歉，我暂时无法回应。请稍后再试。",
        isUser: false
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  // 生成图片功能
  const triggerImageGeneration = async () => {
    if (!currentSession) {
      console.log('没有当前会话，创建新会话进行图片生成');
      await createNewSession("生成袜子设计");
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('开始生成图片...');
      
      // 准备会话上下文
      const sessionContext = {
        sessionId: currentSession!.id,
        messages: messages.map(m => ({
          id: m.id,
          text: m.text,
          isUser: m.isUser
        })),
        conversationState: conversationManager.getConversationHistory(),
        collectedInfo: conversationManager.getCollectedInfo(),
        requirements: conversationManager.getRequirements()
      };

      const newDesign = await generateDesigns(sessionContext);
      
      setDesign({
        ...newDesign,
        imageId: `temp-${Date.now()}`
      });

      // 在聊天中添加缩略图消息
      const thumbnailMsg = {
        id: Date.now() + 2,
        text: `我已经为您生成了设计"${newDesign.design_name}"。`,
        isUser: false,
        thumbnail: (
          <ChatThumbnail
            imageUrl={newDesign.url}
            designName={newDesign.design_name}
            onThumbnailClick={() => {
              // 临时处理，等待数据库更新后的真实ID
              const tempId = `temp-${Date.now()}`;
              setSelectedImageId(tempId);
            }}
            isSelected={false}
          />
        )
      };
      
      setMessages(prev => [...prev, thumbnailMsg]);
      
      // 等待一下让数据库更新，然后重新获取会话历史
      setTimeout(async () => {
        try {
          const updatedHistory = await sessionService.getSessionHistory(currentSession!.id);
          setGeneratedImages(updatedHistory.images);
          
          if (updatedHistory.images.length > 0) {
            const latestImage = updatedHistory.images[0];
            setSelectedImageId(latestImage.id);
            setDesign(prev => prev ? { ...prev, imageId: latestImage.id } : null);
            console.log('图片生成完成，ID:', latestImage.id);
          }
        } catch (error) {
          console.error('更新图片列表失败:', error);
        }
      }, 2000);

      toast.success("设计生成成功！");
      console.log('图片生成成功:', newDesign.design_name);
    } catch (error) {
      console.error('生成设计失败:', error);
      setError("生成失败，请重试");
      toast.error("生成失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = () => {
    if (!design || design.design_name === "生成失败") {
      toast.info("无法编辑一个生成失败的设计。");
      return;
    }
    setIsEditingMode(true);
    setDesign(prev => prev ? {
      ...prev,
      isEditing: true
    } : null);
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: "已进入编辑模式！现在您可以告诉我想要做什么调整，比如：\n• 改变颜色搭配\n• 调整图案风格\n• 修改设计元素\n• 或者其他任何想法\n\n描述完您的修改需求后，点击'修改图片'按钮来应用改动。",
      isUser: false
    }]);
  };

  const handleExitEdit = () => {
    setIsEditingMode(false);
    setDesign(prev => prev ? {
      ...prev,
      isEditing: false
    } : null);
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: "已退出编辑模式。您可以继续和我聊天或开始新的设计。",
      isUser: false
    }]);
  };

  const handleDownload = () => {
    if (!design) return;
    toast.success("图片下载已开始");
  };

  const handleVectorize = () => {
    if (!design) return;
    toast.success("矢量化处理已开始");
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Session History Sidebar */}
      <SessionHistorySidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentSessionId={currentSession?.id}
        onSessionSelect={loadSession}
        onNewSession={() => createNewSession()}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="border-b bg-white dark:bg-gray-950">
          <div className="container mx-auto py-4 px-4 flex justify-between items-center">
            <AppHeader />
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

        <main className="flex-1 container mx-auto py-6 px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            <div className="h-[80vh] flex flex-col border rounded-lg overflow-hidden">
              <ChatWindow 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                onGenerateImage={triggerImageGeneration} 
                isEditingMode={isEditingMode} 
                selectedDesignId={design ? 0 : null} 
                isGenerating={isGenerating} 
                hasDesign={!!design} 
              />
            </div>
            
            <div className="h-[80vh] overflow-y-auto">
              {isEditingMode && design ? (
                <EditingView 
                  design={design} 
                  onExitEdit={handleExitEdit} 
                  onDownload={handleDownload} 
                  onVectorize={handleVectorize} 
                />
              ) : (
                <div>
                  <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">设计作品</h2>
                  </div>

                  {isGenerating && (
                    <div className="text-center text-gray-500 py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sock-purple mx-auto mb-4"></div>
                      正在为您生成设计，请稍候...
                    </div>
                  )}

                  {error && (
                    <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg mb-4">
                      {error}
                    </div>
                  )}

                  {design && (
                    <div className="flex justify-center">
                      <Card className={`w-full max-w-md overflow-hidden transition-all ${
                        design.isEditing ? "ring-2 ring-sock-purple" : ""
                      } ${design.error ? "border-red-300" : ""}`}>
                        <CardContent className="p-0">
                          <div className="aspect-square relative bg-gray-100">
                            <img 
                              src={design.url} 
                              alt={design.design_name} 
                              className="w-full h-full object-cover" 
                            />
                            {design.error && (
                              <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex flex-col items-center justify-center text-white p-2">
                                <AlertCircle className="h-8 w-8 mb-2" />
                                <span className="text-sm font-bold text-center">
                                  生成失败
                                </span>
                              </div>
                            )}
                            {!design.error && (
                              <div className="absolute bottom-2 right-2 flex space-x-2">
                                <Button 
                                  variant="secondary" 
                                  size="icon" 
                                  onClick={handleDownload} 
                                  className="bg-white/90 hover:bg-white"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="secondary" 
                                  size="icon" 
                                  onClick={handleEdit} 
                                  className={design.isEditing ? "bg-sock-purple text-white" : "bg-white/90 hover:bg-white"}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <span className={`text-sm font-medium ${design.error ? "text-red-500" : ""}`}>
                              {design.design_name}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {!design && !isGenerating && (
                    <div className="text-center text-gray-500 py-10">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="mb-2">和我聊聊您的设计想法</p>
                      <p className="text-sm">我会引导您完善需求，然后生成专属设计</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DesignLab;
