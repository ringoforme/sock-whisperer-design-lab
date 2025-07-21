import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, Edit, AlertCircle, MessageCircle, Plus, File, Brush } from "lucide-react";
import ChatWindow from "@/components/ChatWindow";
import EditingView from "@/components/EditingView";
import ImageModal from "@/components/ImageModal";
import BrushMaskEditor from "@/components/BrushMaskEditor";
import AppHeader from "@/components/AppHeader";
import SessionHistorySidebar from "@/components/SessionHistorySidebar";
import { useDesignStorage } from "@/hooks/useDesignStorage";
import { downloadService } from "@/services/downloadService";
import { generateDesigns, editImage } from "@/services/design.service";
import { sessionService } from "@/services/sessionService";
import { llmService } from "@/services/llmService";
import { ConversationManager } from "@/services/conversationManager";
import { supabase } from "@/integrations/supabase/client";
import type { DesignData } from "@/types/design";
import type { Message } from "@/types/message";
import GenerationProgress from "@/components/GenerationProgress";

type DesignState = DesignData & {
  isEditing?: boolean;
  error?: string;
  imageId?: string; // Add imageId to track database record
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
  const [isBrushEditorOpen, setIsBrushEditorOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const location = useLocation();
  
  const {
    markAsDownloaded,
    markAsVectorized,
    markAsEdited
  } = useDesignStorage();

  useEffect(() => {
    // Priority 1: Check URL parameters first
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("sessionId");
    const imageId = params.get("imageId");
    const initialPrompt = params.get("prompt");
    if (sessionId) {
      console.log('从URL参数加载会话:', sessionId, '图片ID:', imageId);
      loadSession(sessionId, imageId);
    } else if (initialPrompt) {
      // Handle direct prompt generation
      initializeSession().then(() => {
        handleSendMessage(initialPrompt);
      });
    } else {
      // Only create new session if no parameters
      initializeSession();
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
        setCurrentImageUrl('');
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

  // Enhanced loadSession method to handle imageId for edit mode
  const loadSession = async (sessionId: string, imageId?: string) => {
    try {
      console.log('开始加载会话:', sessionId, '图片ID:', imageId);
      const sessionHistory = await sessionService.getSessionHistory(sessionId);
      if (!sessionHistory.session) {
        toast.error('会话不存在');
        return;
      }
      console.log('会话历史数据:', sessionHistory);
      setCurrentSessionId(sessionId);

      // Restore message history - avoid duplicate welcome message
      const sessionMessages: Message[] = [];

      // Create a map of image_id to message_id for precise matching
      const imageToMessageMap = new Map();
      sessionHistory.images.forEach(img => {
        if (img.message_id) {
          imageToMessageMap.set(img.message_id, {
            brief_image_url: img.brief_image_url,
            detail_image_url: img.detail_image_url,
            designName: img.design_name
          });
        }
      });

      // Add messages with proper image thumbnails only for generating messages
      sessionHistory.messages.forEach((msg, index) => {
        const message: Message = {
          id: index + 1,
          text: msg.content,
          isUser: msg.role === 'user'
        };

        // Only add thumbnail if this message generated an image (has message_id match)
        if (msg.role === 'assistant' && imageToMessageMap.has(msg.id)) {
          const imageData = imageToMessageMap.get(msg.id);
          message.detail_image_url = imageData.detail_image_url;
          message.brief_image_url = imageData.brief_image_url;
          message.designName = imageData.designName;
        }
        sessionMessages.push(message);
      });

      // Add welcome message if no messages exist
      if (sessionMessages.length === 0) {
        sessionMessages.push({
          id: 1,
          text: "欢迎来到Sox Lab设计工作室！我是您的专属设计助手。让我们开始创造属于您的独特袜子设计吧！请告诉我您想要什么样的袜子？",
          isUser: false
        });
      }
      setMessages(sessionMessages);
      console.log('恢复的消息数量:', sessionMessages.length);

      // Restore conversation manager state
      conversationManager.reset();
      sessionHistory.messages.forEach(msg => {
        const role = msg.role as 'user' | 'assistant';
        conversationManager.addToHistory(role, msg.content);
      });

      // Handle specific image selection and edit mode
      let targetImage = sessionHistory.latestImage;
      if (imageId) {
        // Find the specific image by ID
        const specificImage = sessionHistory.images.find(img => img.id === imageId);
        if (specificImage) {
          targetImage = specificImage;
          // console.log('找到指定图片:', specificImage);

          // Automatically enter edit mode
          setIsEditingMode(true);
          conversationManager.setEditingMode();

          // Add edit mode message
          const editModeMessage: Message = {
            id: Date.now(),
            text: "现在正在编辑模式，您可以告诉我想要做什么调整。",
            isUser: false
          };
          setMessages(prev => [...prev, editModeMessage]);

          // Record edit mode message in database
          await sessionService.addMessage(sessionId, 'assistant', "现在正在编辑模式，您可以告诉我想要做什么调整。");
          toast.success('已进入编辑模式');
        }
      }

      // Restore design state with target image
      if (targetImage) {
        console.log('恢复图片:', targetImage);
        const designData = {
          url: targetImage.detail_image_url,
          brief_image_url: targetImage.brief_image_url,
          prompt_en: '',
          design_name: targetImage.design_name,
          isEditing: !!imageId,
          // Set editing state if imageId provided
          imageId: targetImage.id
        };
        setDesign(designData);
        setCurrentImageUrl(targetImage.detail_image_url);
        console.log('设计状态已设置:', designData);
      } else {
        console.log('没有找到图片，设置design为null');
        setDesign(null);
        setCurrentImageUrl('');
      }
      toast.success('会话加载成功');
    } catch (error) {
      console.error('加载会话失败:', error);
      toast.error('加载会话失败');
    }
  };

  // 处理缩略图点击
  const handleThumbnailClick = (imageUrl: string, designName?: string) => {
    console.log('缩略图被点击:', imageUrl, designName);
    setCurrentImageUrl(imageUrl);
    setDesign({
      url: imageUrl,
      brief_image_url:'',
      prompt_en: '',
      design_name: designName || '设计',
      isEditing: false
    });
  };

  // 生成图片功能 - 修复消息关联时序问题
  const triggerImageGeneration = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      console.log('开始生成设计，会话ID:', currentSessionId);
      
      // 先创建助手消息并获取消息ID
      const successMessage = "太棒了！我已经根据您的想法生成了一个设计。您可以下载它或者点击编辑来进一步调整。";
      let messageId: string | undefined;
      
      if (currentSessionId) {
        const addedMessage = await sessionService.addMessage(currentSessionId, 'assistant', successMessage);
        messageId = addedMessage.id;
        // console.log('助手消息已创建，消息ID:', messageId);
      }

      const sessionContext = {
        sessionId: currentSessionId,
        messages: messages,
        conversationState: conversationManager.getState(),
        collectedInfo: conversationManager.getCollectedInfo(),
        requirements: conversationManager.getRequirements()
      };
      
      // 传递消息ID给生成服务
      const newDesign = await generateDesigns(sessionContext, messageId);
      
      setDesign({
        ...newDesign,
        isEditing: false,
        imageId: undefined // 将在后续设置
      });
      setCurrentImageUrl(newDesign.url);
      
      const messageWithThumbnail: Message = {
        id: Date.now(),
        text: successMessage,
        isUser: false,
        detail_image_url: newDesign.url,
        brief_image_url: newDesign.brief_image_url,
        designName: newDesign.design_name
      };
      setMessages(prev => [...prev, messageWithThumbnail]);
      
      if (currentSessionId) {
        await sessionService.updateSessionStatus(currentSessionId, 'completed');
      }
      toast.success("设计生成成功！");
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
      // console.log("editImage:",editedDesign)
      setCurrentImageUrl(editedDesign.url);
      toast.success(`设计已更新！`);
      const responseMessage = "我已根据您的指令编辑了设计。";
      let messageId: string | undefined;

      // 记录助手回复到数据库并获取消息ID
      if (currentSessionId) {
        const addedMessage = await sessionService.addMessage(currentSessionId, 'assistant', responseMessage);
        messageId = addedMessage.id;

        // Update the latest image with the message_id
        try {
          const sessionHistory = await sessionService.getSessionHistory(currentSessionId);
          const latestImage = sessionHistory.images.filter(img => img.generation_status === 'success').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          if (latestImage) {
            await supabase.from('generated_images').update({
              message_id: messageId
            }).eq('id', latestImage.id);
          }
        } catch (error) {
          console.error('关联编辑图片和消息失败:', error);
        }
      }
      const messageWithThumbnail: Message = {
        id: Date.now(),
        text: responseMessage,
        isUser: false,
        detail_image_url: editedDesign.url,
        brief_image_url: editedDesign.brief_image_url,
        designName: editedDesign.design_name
      };
      setMessages(prev => [...prev, messageWithThumbnail]);

      // 清空待处理的编辑指令
      setPendingEditInstruction('');
    } catch (err: any) {
      toast.error(`编辑失败: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 编辑 mask
  function replacePixels(base64Str, conditionFn, replaceColor): Promise<string>{
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                if (conditionFn(r, g, b, a)) {
                    data[i]     = replaceColor[0]; // R
                    data[i + 1] = replaceColor[1]; // G
                    data[i + 2] = replaceColor[2]; // B
                    data[i + 3] = replaceColor[3]; // A
                }
            }
            ctx.putImageData(imageData, 0, 0);
            const newBase64 = canvas.toDataURL();
            resolve(newBase64);
        };
        img.onerror = reject;
        img.src = base64Str;
    });
}

  // 触发笔刷遮罩编辑功能
  const triggerBrushEdit = async (maskData: string, editPrompt: string) => {
    if (!design) {
      toast.error("没有可编辑的设计");
      return;
    }
    setIsGenerating(true);
    setIsBrushEditorOpen(false);
    try {
      // 修改 mask 使其满足api需求
      const newMask = await replacePixels(maskData,(r,g,b,a) => r == 0 && b ==0 && g ==0, [0,0,0,0]);
      // console.log("newMask", newMask);
      // 使用 brushEditImage 函数编辑图片
      const editedDesign = await editImage(design.url, editPrompt, currentSessionId, newMask);
      setDesign({
        ...editedDesign,
        isEditing: true
      });
      setCurrentImageUrl(editedDesign.url);
      toast.success(`笔刷编辑完成！`);
      const responseMessage = "我已根据您的笔刷遮罩编辑了设计。";
      let messageId: string | undefined;

      // 记录助手回复到数据库并获取消息ID
      if (currentSessionId) {
        const addedMessage = await sessionService.addMessage(currentSessionId, 'assistant', responseMessage);
        messageId = addedMessage.id;

        // Update the latest image with the message_id
        try {
          const sessionHistory = await sessionService.getSessionHistory(currentSessionId);
          const latestImage = sessionHistory.images.filter(img => img.generation_status === 'success').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          if (latestImage) {
            await supabase.from('generated_images').update({
              message_id: messageId
            }).eq('id', latestImage.id);
          }
        } catch (error) {
          console.error('关联编辑图片和消息失败:', error);
        }
      }
      const messageWithThumbnail: Message = {
        id: Date.now(),
        text: responseMessage,
        isUser: false,
        detail_image_url: editedDesign.url,
        brief_image_url: editedDesign.brief_image_url,
        designName: editedDesign.design_name
      };
      setMessages(prev => [...prev, messageWithThumbnail]);
    } catch (err: any) {
      toast.error(`笔刷编辑失败: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 修改后的消息处理函数 - 防止重复保存
  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isGenerating || isChatLoading) return;
    const userMsg: Message = {
      id: Date.now(),
      text: userMessage,
      isUser: true
    };
    setMessages(prev => [...prev, userMsg]);

    // Save user message to database once
    let userMessageId: string | undefined;
    if (currentSessionId) {
      try {
        const addedMessage = await sessionService.addMessage(currentSessionId, 'user', userMessage);
        userMessageId = addedMessage.id;
      } catch (error) {
        console.error('记录用户消息失败:', error);
      }
    }
    if (isEditingMode && design) {
      setPendingEditInstruction(userMessage);
      const responseMessage = "我已收到您的编辑指令。请点击编辑图片按钮来应用修改。";
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: responseMessage,
        isUser: false
      }]);

      // Save assistant response to database once
      if (currentSessionId) {
        try {
          await sessionService.addMessage(currentSessionId, 'assistant', responseMessage);
        } catch (error) {
          console.error('记录助手消息失败:', error);
        }
      }
    } else {
      setIsChatLoading(true);
      try {
        console.log('发送消息到 ConversationManager:', userMessage);
        conversationManager.addToHistory('user', userMessage);
        const gptResponse = await conversationManager.generateResponse(userMessage);
        console.log('收到 GPT 回复:', gptResponse);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: gptResponse,
          isUser: false
        }]);

        // Save assistant response to database once
        if (currentSessionId) {
          try {
            await sessionService.addMessage(currentSessionId, 'assistant', gptResponse);
          } catch (error) {
            console.error('记录助手消息失败:', error);
          }
        }
      } catch (error) {
        console.error('GPT 聊天失败:', error);
        const fallbackResponse = "抱歉，AI 服务暂时不可用。请继续描述您的设计想法，稍后我会为您生成设计。";
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: fallbackResponse,
          isUser: false
        }]);

        // Save fallback response to database once
        if (currentSessionId) {
          try {
            await sessionService.addMessage(currentSessionId, 'assistant', fallbackResponse);
          } catch (error) {
            console.error('记录助手消息失败:', error);
          }
        }
        toast.error("AI 聊天服务暂时不可用");
      } finally {
        setIsChatLoading(false);
      }
    }
  };

  const handleEdit = async () => {
    if (!design || design.design_name === "生成失败") {
      toast.info("无法编辑一个生成失败的设计。");
      return;
    }
    if (design.imageId) {
      try {
        await markAsEdited(design.imageId);
        console.log('设计已标记为编辑状态');
      } catch (error) {
        console.error('标记编辑状态失败:', error);
      }
    }
    setIsEditingMode(true);
    setPendingEditInstruction('');
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
    setPendingEditInstruction('');
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
    const success = await downloadService.downloadImage(design.url, design.design_name);
    if (success) {
      if (design.imageId) {
        try {
          await markAsDownloaded(design.imageId);
          console.log('设计已标记为下载状态');
        } catch (error) {
          console.error('标记下载状态失败:', error);
        }
      }
      toast.success("图片下载成功！");
    } else {
      toast.error("下载失败，请重试");
    }
  };

  const handleVectorize = async () => {
    if (!design) return;
    if (design.imageId) {
      try {
        await markAsVectorized(design.imageId);
        toast.success("矢量化处理已完成");
        console.log('设计已标记为矢量化状态');
      } catch (error) {
        console.error('标记矢量化状态失败:', error);
        toast.error("矢量化处理失败");
      }
    } else {
      toast.success("矢量化处理已开始");
    }
  };

  // 处理图片点击放大
  const handleImageClick = () => {
    if (design && !design.error) {
      setIsImageModalOpen(true);
    }
  };

  // 处理笔刷编辑
  const handleBrushEdit = () => {
    if (!design || design.error) {
      toast.error("无法对该设计进行笔刷编辑");
      return;
    }
    setIsBrushEditorOpen(true);
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
            <SessionHistorySidebar currentSessionId={currentSessionId} onSessionSelect={loadSession} onNewSession={() => createNewSession()} />
            <AppHeader title="SoxLab工作室" />
          </div>
          <nav className="flex items-center space-x-4">
            <Button onClick={handleNewDesign} className="bg-sock-purple hover:bg-sock-purple/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Design
            </Button>
            <Link to="/drafts" className="text-gray-700 hover:text-sock-purple transition-colors">设计库
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
              onThumbnailClick={handleThumbnailClick} 
              isEditingMode={isEditingMode} 
              selectedDesignId={design ? 0 : null} 
              isGenerating={isGenerating || isChatLoading} 
              hasDesign={!!design} 
              hasPendingEditInstruction={!!pendingEditInstruction.trim()} 
              currentImageUrl={currentImageUrl} 
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

                {/* 新的进度条组件 */}
                {(isGenerating || isChatLoading) && (
                  <div className="text-center py-10">
                    {isGenerating ? (
                      <GenerationProgress 
                        isGenerating={isGenerating}
                        onComplete={() => {
                          // 进度条完成后的回调，可以添加额外的动效
                          console.log('进度条动画完成');
                        }}
                      />
                    ) : (
                      <div className="text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sock-purple mx-auto mb-4"></div>
                        正在思考回复，请稍候...
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                {design && (
                  <div className="flex justify-center">
                    <Card className={`w-full max-w-2xl mx-auto overflow-hidden transition-all ${design.isEditing ? "ring-2 ring-sock-purple" : ""} ${design.error ? "border-red-300" : ""}`}>
                      <CardContent className="p-6">
                        {/* Buttons above the image */}
                        {!design.error && (
                          <div className="flex justify-end space-x-2 mb-6">
                            <Button variant="outline" size="sm" onClick={handleDownload}>
                              <Download className="h-4 w-4 mr-2" />
                              下载
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleVectorize}>
                              <File className="h-4 w-4 mr-2" />
                              矢量化
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleBrushEdit}>
                              <Brush className="h-4 w-4 mr-2" />
                              笔刷编辑
                            </Button>
                          </div>
                        )}
                        
                        {/* Image container */}
                        <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={design.url} 
                            alt={design.design_name} 
                            className={`w-full h-full object-contain transition-transform ${!design.error ? "cursor-pointer hover:scale-105" : ""}`} 
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
                          {/* Floating edit button in bottom right */}
                          {!design.error && (
                            <div className="absolute bottom-2 right-2">
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
                        
                        {/* Design name */}
                        <div className="mt-3 text-center">
                          <span className={`text-sm font-medium ${design.error ? "text-red-500" : ""}`}>
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

      {/* 笔刷遮罩编辑器 */}
      {design && isBrushEditorOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <BrushMaskEditor
            imageUrl={design.url}
            onEdit={triggerBrushEdit}
            onClose={() => setIsBrushEditorOpen(false)}
            isLoading={isGenerating}
          />
        </div>
      )}
    </div>
  );
};

export default DesignStudio;
