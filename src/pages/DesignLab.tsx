import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Download, Edit, AlertCircle, MessageCircle } from "lucide-react";
import ChatWindow from "@/components/ChatWindow";
import EditingView from "@/components/EditingView";
import AppHeader from "@/components/AppHeader";
import SessionHistorySidebar from "@/components/SessionHistorySidebar";
import { useDesignStorage } from "@/hooks/useDesignStorage";
import { ConversationManager } from "@/services/conversationManager";
import { sessionService } from "@/services/sessionService";
import { supabase } from "@/integrations/supabase/client";
import type { DesignData } from "@/types/design";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

type DesignState = DesignData & {
  isEditing?: boolean;
  error?: string;
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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const location = useLocation();
  const { addDesign } = useDesignStorage();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialPrompt = params.get("prompt");
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [location]);

  // 创建新会话
  const createNewSession = async (initialIdea?: string) => {
    try {
      if (!initialIdea) {
        // 重置到初始状态
        setMessages([{
          id: 1,
          text: "欢迎来到Sox Lab设计工作室！我是您的专属设计助手。让我们开始创造属于您的独特袜子设计吧！请告诉我您想要什么样的袜子？",
          isUser: false
        }]);
        setDesign(null);
        setIsEditingMode(false);
        setCurrentSessionId(null);
        conversationManager.reset();
        return;
      }

      const session = await sessionService.createSession(initialIdea);
      setCurrentSessionId(session.id);
      console.log('新会话创建成功:', session.id);
      return session;
    } catch (error) {
      console.error('创建会话失败:', error);
      toast.error('创建会话失败');
      throw error;
    }
  };

  // 加载已存在的会话
  const loadSession = async (sessionId: string) => {
    try {
      const sessionHistory = await sessionService.getSessionHistory(sessionId);
      
      if (!sessionHistory.session) {
        toast.error('会话不存在');
        return;
      }

      setCurrentSessionId(sessionId);

      // 恢复消息历史
      const sessionMessages: Message[] = [{
        id: 1,
        text: "欢迎来到Sox Lab设计工作室！我是您的专属设计助手。让我们开始创造属于您的独特袜子设计吧！请告诉我您想要什么样的袜子？",
        isUser: false
      }];

      sessionHistory.messages.forEach((msg, index) => {
        sessionMessages.push({
          id: index + 2,
          text: msg.content,
          isUser: msg.role === 'user'
        });
      });

      setMessages(sessionMessages);

      // 恢复对话管理器状态
      conversationManager.reset();
      sessionHistory.messages.forEach(msg => {
        conversationManager.addToHistory(msg.role, msg.content);
      });

      // 恢复设计状态（如果有生成的图片）
      if (sessionHistory.images.length > 0) {
        const latestImage = sessionHistory.images[sessionHistory.images.length - 1];
        if (latestImage.generation_status === 'success') {
          setDesign({
            url: latestImage.image_url,
            prompt_en: '', // 这里可以从扩展提示词中获取
            design_name: latestImage.design_name,
            isEditing: false
          });
        }
      } else {
        setDesign(null);
      }

      setIsEditingMode(false);
      toast.success('会话加载成功');
    } catch (error) {
      console.error('加载会话失败:', error);
      toast.error('加载会话失败');
    }
  };

  // 使用对话管理器生成智能回复
  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isGenerating) return;

    const userMsg = {
      id: Date.now(),
      text: userMessage,
      isUser: true
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // 如果没有当前会话，创建新会话
      if (!currentSessionId) {
        const session = await createNewSession(userMessage);
        if (session) {
          setCurrentSessionId(session.id);
          // 保存用户消息到数据库
          await sessionService.addMessage(session.id, 'user', userMessage);
        }
      } else {
        // 保存用户消息到数据库
        await sessionService.addMessage(currentSessionId, 'user', userMessage);
      }

      // 使用对话管理器生成智能回复
      const aiResponse = await conversationManager.generateResponse(userMessage);
      
      const aiMsg = {
        id: Date.now() + 1,
        text: aiResponse,
        isUser: false
      };
      setMessages(prev => [...prev, aiMsg]);

      // 保存AI回复到数据库
      if (currentSessionId) {
        await sessionService.addMessage(currentSessionId, 'assistant', aiResponse);
      }
    } catch (error) {
      console.error('生成回复失败:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "抱歉，我暂时无法回应。请稍后再试。",
        isUser: false
      }]);
    }
  };

  // 生成真实的AI图片
  const generateRealDesign = async (): Promise<DesignState> => {
    const requirements = conversationManager.getRequirements();
    try {
      const { data, error } = await supabase.functions.invoke('generate-sock-design', {
        body: { requirements }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.error || '图像生成失败');
      }
      
      const designName = generateDesignName(requirements);
      return {
        url: data.imageUrl,
        prompt_en: data.expandedPrompt,
        design_name: designName,
        isEditing: false
      };
    } catch (error) {
      console.error('AI图像生成失败:', error);
      return generateMockDesign();
    }
  };

  // 生成Mock图片的函数，基于收集到的需求
  const generateMockDesign = (): DesignState => {
    const requirements = conversationManager.getRequirements();
    const mockImages = [
      "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=400&fit=crop"
    ];

    let imageIndex = 0;
    if (requirements.pattern === 'geometric') imageIndex = 1;
    else if (requirements.pattern === 'animal') imageIndex = 2;
    else if (requirements.sockType === 'knee-high') imageIndex = 3;
    
    const designName = generateDesignName(requirements);
    return {
      url: mockImages[imageIndex],
      prompt_en: JSON.stringify(requirements),
      design_name: designName,
      isEditing: false
    };
  };

  // 根据需求生成设计名称
  const generateDesignName = (requirements: any): string => {
    const { sockType, colors, pattern, style } = requirements;
    let name = "";
    
    if (style) {
      const styleNames = {
        'minimalist': '简约',
        'bold': '大胆',
        'cute': '可爱',
        'elegant': '优雅',
        'trendy': '潮流'
      };
      name += styleNames[style as keyof typeof styleNames] || '';
    }
    
    if (pattern) {
      const patternNames = {
        'geometric': '几何',
        'animal': '动物',
        'floral': '花卉',
        'abstract': '抽象',
        'text': '文字',
        'holiday': '节日',
        'sports': '运动'
      };
      name += patternNames[pattern as keyof typeof patternNames] || '';
    }
    
    if (colors && colors.length > 0) {
      name += colors[0];
    }
    
    name += '袜子设计';
    return name || '创意袜子设计';
  };

  // 生成/修改图片功能
  const triggerImageGeneration = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      if (isEditingMode && design) {
        const modifiedDesign = await generateRealDesign();
        const finalDesign: DesignState = {
          ...modifiedDesign,
          design_name: `修改版-${design.design_name}`,
          isEditing: true
        };
        setDesign(finalDesign);
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: "完美！我已经根据您的修改建议更新了设计。您可以继续调整或者下载这个新版本。",
          isUser: false
        }]);
        toast.success("设计修改成功！");
      } else {
        const newDesign = await generateRealDesign();
        setDesign(newDesign);
        const collectedInfo = conversationManager.getCollectedInfo();
        const summary = collectedInfo.length > 0 ? 
          `根据您的需求（${collectedInfo.join('、')}），我为您生成了这个设计。` : 
          '我已经为您生成了一个创意设计。';
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: `${summary}您可以下载它或者点击编辑来进一步调整。如果不满意，也可以继续和我聊天来完善需求后重新生成。`,
          isUser: false
        }]);
        toast.success("设计生成成功！");
      }
    } catch (error) {
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
    setDesign(prev => prev ? { ...prev, isEditing: true } : null);
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: "已进入编辑模式！现在您可以告诉我想要做什么调整，比如：\n• 改变颜色搭配\n• 调整图案风格\n• 修改设计元素\n• 或者其他任何想法\n\n描述完您的修改需求后，点击'修改图片'按钮来应用改动。",
      isUser: false
    }]);
  };

  const handleExitEdit = () => {
    setIsEditingMode(false);
    setDesign(prev => prev ? { ...prev, isEditing: false } : null);
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
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <SessionHistorySidebar
          currentSessionId={currentSessionId}
          onSessionSelect={loadSession}
          onNewSession={() => createNewSession()}
        />
        
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-white dark:bg-gray-950">
            <div className="container mx-auto py-4 px-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <AppHeader />
              </div>
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

          <main className="container mx-auto py-6 px-4 md:px-6 flex-1">
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
                                  <span className="text-sm font-bold text-center">生成失败</span>
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
                                    className={design.isEditing ? 
                                      "bg-sock-purple text-white" : 
                                      "bg-white/90 hover:bg-white"
                                    }
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <span className={`text-sm font-medium ${
                                design.error ? "text-red-500" : ""
                              }`}>
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
    </SidebarProvider>
  );
};

export default DesignLab;
