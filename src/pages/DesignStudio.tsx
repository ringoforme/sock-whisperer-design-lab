import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, Edit, AlertCircle, MessageCircle } from "lucide-react";
import ChatWindow from "@/components/ChatWindow";
import EditingView from "@/components/EditingView";
import { useDesignStorage } from "@/hooks/useDesignStorage";

import { generateDesigns, regenerateImage } from "@/services/design.service";
import { sessionService } from "@/services/sessionService";
import { llmService } from "@/services/llmService";
import type { DesignData } from "@/types/design";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

type DesignState = DesignData & { isEditing?: boolean; error?: string };

const DesignStudio = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "欢迎来到Sox Lab设计工作室！请先告诉我您想要什么样的袜子设计，我们可以先聊聊您的想法。",
      isUser: false,
    },
  ]);
  const [design, setDesign] = useState<DesignState | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const location = useLocation();
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
      // 创建新的设计会话
      const session = await sessionService.createSession("开始新的袜子设计会话");
      setCurrentSessionId(session.id);
      llmService.setCurrentSession(session.id);
      console.log('会话已初始化:', session.id);
    } catch (error) {
      console.error('初始化会话失败:', error);
      // 如果会话创建失败，仍可继续使用但不会记录到数据库
    }
  };

  // 创意设计沟通回复
  const generateChatResponse = (userMessage: string): string => {
    const responses = [
      `关于"${userMessage}"的设计想法很棒！我建议可以考虑使用渐变色彩，这样既时尚又有层次感。您希望偏向什么风格呢？运动风、商务风还是休闲风？`,
      `您的创意很有趣！对于袜子设计来说，颜色搭配很重要。您提到的元素可以作为主图案放在袜身中部，这样既突出又不会过于繁复。`,
      `这是一个很有创意的想法！建议可以结合一些几何元素来平衡设计，让整体看起来更协调。您对配色有什么特别的偏好吗？`,
      `您的设计概念很独特！可以考虑将主要图案放在脚踝部分，这样穿着时既能展示设计又很实用。需要考虑什么样的袜子长度呢？`,
      `很棒的灵感！建议可以用对比色来突出设计重点，同时保持整体的简洁感。您希望这款袜子适合什么场合穿着？当您准备好时，可以点击"生成图片"按钮来创建设计。`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // 生成图片功能
  const triggerImageGeneration = async () => {
    // 从聊天记录中提取用户的所有输入作为prompt
    const userMessages = messages.filter(m => m.isUser).map(m => m.text).join(' ');
    
    if (!userMessages.trim()) {
      toast.error("请先描述您的设计想法");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const newDesign = await generateDesigns(userMessages, currentSessionId);
      setDesign({ ...newDesign, isEditing: false });
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "太棒了！我已经根据您的想法生成了一个设计。您可以下载它或者点击编辑来进一步调整。",
        isUser: false
      }]);
      toast.success("设计生成成功！");
      
      // 更新会话状态为已完成
      if (currentSessionId) {
        await sessionService.updateSessionStatus(currentSessionId, 'completed');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(`生成失败: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // handleSendMessage 函数修改为支持聊天
  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isGenerating) return;
    const userMsg = { id: Date.now(), text: userMessage, isUser: true };
    setMessages((prev) => [...prev, userMsg]);

    if (isEditingMode && design) {
      setIsGenerating(true);
      const originalPrompt = design.prompt_en;
      const editInstruction = `Based on the original prompt: "${originalPrompt}", please apply this modification: "${userMessage}"`;
      try {
        const newDesign = await regenerateImage(editInstruction, currentSessionId);
        setDesign({ ...newDesign, isEditing: true });
        toast.success(`设计已更新！`);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: "我已根据您的指令更新了设计。",
            isUser: false,
          },
        ]);
      } catch (err: any) {
        toast.error(`编辑失败: ${err.message}`);
      } finally {
        setIsGenerating(false);
      }
    } else {
      // 默认聊天模式：只进行设计沟通，不生成图片
      const chatResponse = generateChatResponse(userMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: chatResponse,
          isUser: false,
        },
      ]);
    }
  };

  const handleEdit = () => {
    if (!design || design.design_name === "生成失败") {
      toast.info("无法编辑一个生成失败的设计。");
      return;
    }
    setIsEditingMode(true);
    setDesign(prev => prev ? { ...prev, isEditing: true } : null);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: "现在正在编辑模式，您可以告诉我想要做什么调整。",
        isUser: false,
      },
    ]);
  };

  const handleExitEdit = () => {
    setIsEditingMode(false);
    setDesign(prev => prev ? { ...prev, isEditing: false } : null);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: "已退出编辑模式。", isUser: false },
    ]);
  };

  const handleDownload = () => {
    if (!design) return;
    // Download logic here
    toast.success("图片下载已开始");
  };

  const handleVectorize = () => {
    if (!design) return;
    // Vectorize logic here
    toast.success("矢量化处理已开始");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sock-purple">
            袜匠设计工作室
          </h1>
          <nav className="flex items-center space-x-4">
            <Link
              to="/drafts"
              className="text-gray-700 hover:text-sock-purple transition-colors"
            >
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
                  {currentSessionId && (
                    <div className="text-xs text-muted-foreground">
                      会话ID: {currentSessionId.slice(-8)}
                    </div>
                  )}
                </div>

                {isGenerating && (
                  <div className="text-center text-gray-500 py-10">
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
                    <p>先和我聊聊您的设计想法，然后点击"生成图片"来创建设计</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DesignStudio;
