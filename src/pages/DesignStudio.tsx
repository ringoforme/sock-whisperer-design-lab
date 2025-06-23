import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, Edit, AlertCircle, MessageCircle, Plus } from "lucide-react";
import ChatWindow from "@/components/ChatWindow";
import EditingView from "@/components/EditingView";
import ImageModal from "@/components/ImageModal";
import AppHeader from "@/components/AppHeader";
import SessionHistorySidebar from "@/components/SessionHistorySidebar";
import { useDesignStorage } from "@/hooks/useDesignStorage";
import { downloadService } from "@/services/downloadService";
import { generateDesigns, editImage } from "@/services/design.service";
import { sessionService } from "@/services/sessionService";
import { llmService } from "@/services/llmService";
import { ConversationManager } from "@/services/conversationManager";
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

const DesignStudio = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    text: "欢迎来到Sox Lab设计工作室！我是您的专属设计助手。让我们开始创造属于您的独特袜子设计吧！请告诉我您想要什么样的袜子？",
    isUser: false
  }]);
  const [design, setDesign] = useState<DesignState | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [conversationManager] = useState(() => new ConversationManager());
  const [pendingEditInstruction, setPendingEditInstruction] = useState<string>('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { addDesign } = useDesignStorage();

  useEffect(() => {
    // 初始化会话
    initializeSession();
    const params = new URLSearchParams(location.search);
    const initialPrompt = params.get("prompt");
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [location]);

  const initializeSession = async () => {
    try {
      console.log('开始初始化会话...');
      // 创建新的设计会话
      const session = await sessionService.createSession("开始新的袜子设计会话");
      setCurrentSessionId(session.id);
      llmService.setCurrentSession(session.id);
      console.log('会话已初始化:', session.id);

      // 添加系统消息到数据库
      await sessionService.addMessage(session.id, 'assistant', '欢迎来到Sox Lab设计工作室！我是您的专属设计助手。让我们开始创造属于您的独特袜子设计吧！请告诉我您想要什么样的袜子？');
    } catch (error) {
      console.error('初始化会话失败:', error);
      toast.error('会话初始化失败，但可以继续使用');
    }
  };

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
        // 重新初始化会话
        await initializeSession();
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

      // Restore message history
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

      // Restore conversation manager state
      conversationManager.reset();
      sessionHistory.messages.forEach(msg => {
        const role = msg.role as 'user' | 'assistant';
        conversationManager.addToHistory(role, msg.content);
      });

      // Restore design state with latest image
      if (sessionHistory.latestImage) {
        setDesign({
          url: sessionHistory.latestImage.image_url,
          prompt_en: '', 
          design_name: sessionHistory.latestImage.design_name,
          isEditing: false
        });
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

  // 生成图片功能 - 现在传递完整的会话上下文
  const triggerImageGeneration = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      console.log('开始生成设计，会话ID:', currentSessionId);

      // 收集完整的会话上下文
      const sessionContext = {
        sessionId: currentSessionId,
        messages: messages,
        conversationState: conversationManager.getState(),
        collectedInfo: conversationManager.getCollectedInfo(),
        requirements: conversationManager.getRequirements()
      };
      const newDesign = await generateDesigns(sessionContext);
      setDesign({
        ...newDesign,
        isEditing: false
      });
      const successMessage = "太棒了！我已经根据您的想法生成了一个设计。您可以下载它或者点击编辑来进一步调整。";
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: successMessage,
        isUser: false
      }]);

      // 记录助手消息到数据库
      if (currentSessionId) {
        await sessionService.addMessage(currentSessionId, 'assistant', successMessage);
      }
      toast.success("设计生成成功！");

      // 更新会话状态为已完成
      if (currentSessionId) {
        await sessionService.updateSessionStatus(currentSessionId, 'completed');
      }
    } catch (err: any) {
      console.error('生成设计失败:', err);
      setError(err.message);
      toast.error(`生成失败: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 触发图像编辑功能
  const triggerImageEdit = async () => {
    if (!design || !pendingEditInstruction.trim()) {
      toast.error("请先输入编辑指令");
      return;
    }
    setIsGenerating(true);
    try {
      // 使用 editImage 函数编辑图片
      const editedDesign = await editImage(design.url, pendingEditInstruction, currentSessionId);
      setDesign({
        ...editedDesign,
        isEditing: true
      });
      toast.success(`设计已更新！`);
      const responseMessage = "我已根据您的指令编辑了设计。";
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: responseMessage,
        isUser: false
      }]);

      // 记录助手回复到数据库
      if (currentSessionId) {
        await sessionService.addMessage(currentSessionId, 'assistant', responseMessage);
      }

      // 清空待处理的编辑指令
      setPendingEditInstruction('');
    } catch (err: any) {
      toast.error(`编辑失败: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 修改后的消息处理函数
  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isGenerating || isChatLoading) return;
    const userMsg = {
      id: Date.now(),
      text: userMessage,
      isUser: true
    };
    setMessages(prev => [...prev, userMsg]);

    // 记录用户消息到数据库
    if (currentSessionId) {
      try {
        await sessionService.addMessage(currentSessionId, 'user', userMessage);
      } catch (error) {
        console.error('记录用户消息失败:', error);
      }
    }

    if (isEditingMode && design) {
      // 在编辑模式下，只保存编辑指令，不立即执行编辑
      setPendingEditInstruction(userMessage);
      const responseMessage = "我已收到您的编辑指令。请点击编辑图片按钮来应用修改。";
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: responseMessage,
        isUser: false
      }]);

      // 记录助手回复到数据库
      if (currentSessionId) {
        await sessionService.addMessage(currentSessionId, 'assistant', responseMessage);
      }
    } else {
      // 使用真正的 GPT API 进行对话
      setIsChatLoading(true);
      try {
        console.log('发送消息到 ConversationManager:', userMessage);

        // 将当前消息历史传递给 ConversationManager
        conversationManager.addToHistory('user', userMessage);
        const gptResponse = await conversationManager.generateResponse(userMessage);
        console.log('收到 GPT 回复:', gptResponse);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: gptResponse,
          isUser: false
        }]);

        // 记录助手回复到数据库
        if (currentSessionId) {
          try {
            await sessionService.addMessage(currentSessionId, 'assistant', gptResponse);
          } catch (error) {
            console.error('记录助手消息失败:', error);
          }
        }
      } catch (error) {
        console.error('GPT 聊天失败:', error);

        // 降级到简单回复
        const fallbackResponse = "抱歉，AI 服务暂时不可用。请继续描述您的设计想法，稍后我会为您生成设计。";
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: fallbackResponse,
          isUser: false
        }]);
        toast.error("AI 聊天服务暂时不可用");
      } finally {
        setIsChatLoading(false);
      }
    }
  };

  const handleEdit = () => {
    if (!design || design.design_name === "生成失败") {
      toast.info("无法编辑一个生成失败的设计。");
      return;
    }
    setIsEditingMode(true);
    setPendingEditInstruction(''); // 清空编辑指令
    setDesign(prev => prev ? {
      ...prev,
      isEditing: true
    } : null);
    conversationManager.setEditingMode();
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: "现在正在编辑模式，您可以告诉我想要做什么调整。",
      isUser: false
    }]);
  };

  const handleExitEdit = () => {
    setIsEditingMode(false);
    setPendingEditInstruction(''); // 清空编辑指令
    setDesign(prev => prev ? {
      ...prev,
      isEditing: false
    } : null);
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: "已退出编辑模式。",
      isUser: false
    }]);
  };

  const handleDownload = async () => {
    if (!design) return;

    // Simplified download - directly to browser default folder
    const success = await downloadService.downloadImage(design.url, design.design_name);
    if (success) {
      toast.success("图片下载成功！");
    } else {
      toast.error("下载失败，请重试");
    }
  };

  const handleVectorize = () => {
    if (!design) return;
    // Vectorize logic here
    toast.success("矢量化处理已开始");
  };

  // 处理图片点击放大
  const handleImageClick = () => {
    if (design && !design.error) {
      setIsImageModalOpen(true);
    }
  };

  // 处理新设计按钮点击
  const handleNewDesign = () => {
    createNewSession();
    toast.success("已开始新的设计会话");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <SessionHistorySidebar
              currentSessionId={currentSessionId}
              onSessionSelect={loadSession}
              onNewSession={() => createNewSession()}
            />
            <AppHeader title="SoxLab工作室" />
          </div>
          <nav className="flex items-center space-x-4">
            <Button
              onClick={handleNewDesign}
              className="bg-sock-purple hover:bg-sock-purple/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Design
            </Button>
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
          <div className="h-[80vh] flex flex-col border rounded-lg overflow-hidden">
            <ChatWindow 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              onGenerateImage={triggerImageGeneration} 
              onEditImage={triggerImageEdit} 
              isEditingMode={isEditingMode} 
              selectedDesignId={design ? 0 : null} 
              isGenerating={isGenerating || isChatLoading} 
              hasDesign={!!design} 
              hasPendingEditInstruction={!!pendingEditInstruction.trim()} 
            />
          </div>
          <div className="h-[80vh] overflow-y-auto">
            {isEditingMode && design ? (
              <EditingView 
                design={design} 
                onExitEdit={handleExitEdit} 
                onDownload={handleDownload} 
                onVectorize={handleVectorize} 
                onImageClick={handleImageClick} 
              />
            ) : (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">设计作品</h2>
                  {currentSessionId && (
                    <div className="text-xs text-muted-foreground">
                      会话ID: {currentSessionId.slice(-8)}
                    </div>
                  )}
                </div>

                {(isGenerating || isChatLoading) && (
                  <div className="text-center text-gray-500 py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sock-purple mx-auto mb-4"></div>
                    {isGenerating ? "正在为您生成设计，请稍候..." : "正在思考回复，请稍候..."}
                  </div>
                )}

                {error && (
                  <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                {design && (
                  <div className="flex justify-center">
                    <Card className={`w-full max-w-2xl overflow-hidden transition-all ${
                      design.isEditing ? "ring-2 ring-sock-purple" : ""
                    } ${design.error ? "border-red-300" : ""}`}>
                      <CardContent className="p-0">
                        <div className="aspect-square relative bg-gray-100">
                          <img 
                            src={design.url} 
                            alt={design.design_name} 
                            className={`w-full h-full object-cover transition-transform ${
                              !design.error ? "cursor-pointer hover:scale-105" : ""
                            }`} 
                            onClick={handleImageClick} 
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

                {!design && !isGenerating && !isChatLoading && (
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

      {/* 图片预览模态框 */}
      {design && (
        <ImageModal 
          isOpen={isImageModalOpen} 
          onClose={() => setIsImageModalOpen(false)} 
          imageUrl={design.url} 
          imageTitle={design.design_name} 
        />
      )}
    </div>
  );
};

export default DesignStudio;
