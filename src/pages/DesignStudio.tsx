
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ChatWindow from '@/components/ChatWindow';
import SockDesignArea from '@/components/SockDesignArea';
import SessionHistorySidebar from '@/components/SessionHistorySidebar';
import { useOptimizedSessionHistory } from '@/hooks/useOptimizedSessionHistory';
import { sessionService } from '@/services/sessionService';
import { llmService } from '@/services/llmService';
import { generateDesigns } from '@/services/imageGeneration.service';
import { editImage } from '@/services/imageEditing.service';
import { ConversationManager } from '@/services/conversationManager';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Message } from '@/types/message';
import type { DesignData } from '@/types/design';

const DesignStudio = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // URL参数
  const initialPrompt = searchParams.get('prompt') || '';
  const isEditingExample = searchParams.get('editExample') === 'true';
  const exampleId = searchParams.get('exampleId');
  const exampleTitle = searchParams.get('exampleTitle');
  const exampleImageUrl = searchParams.get('exampleImageUrl');
  const examplePrompt = searchParams.get('examplePrompt');

  // 状态管理
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [currentDesign, setCurrentDesign] = useState<DesignData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState<number | null>(null);
  const [hasPendingEditInstruction, setHasPendingEditInstruction] = useState(false);
  const [conversationManager] = useState(() => new ConversationManager());

  const {
    sessions,
    loading: sessionsLoading,
    loadSessions,
    refresh: refreshSessions
  } = useOptimizedSessionHistory();

  // 初始化会话
  useEffect(() => {
    if (!user) return;
    
    const initializeSession = async () => {
      try {
        console.log('开始初始化会话...');
        
        if (isEditingExample && exampleTitle && exampleImageUrl && examplePrompt) {
          // 示例编辑模式
          console.log('示例编辑模式，创建新会话');
          const session = await sessionService.createSession(`编辑示例: ${exampleTitle}`);
          setCurrentSessionId(session.id);
          setSelectedSessionId(session.id);
          llmService.setCurrentSession(session.id);
          
          // 设置为编辑模式
          setIsEditingMode(true);
          
          // 添加示例设计到当前设计中
          setCurrentDesign({
            url: exampleImageUrl,
            prompt_en: examplePrompt,
            design_name: exampleTitle
          });
          
          // 添加初始消息
          const welcomeMessage = `我已经为您加载了示例设计「${exampleTitle}」。您可以告诉我想要对这个设计做什么修改，比如改变颜色、图案、风格等。`;
          
          const assistantMessage = await sessionService.addMessage(session.id, 'assistant', welcomeMessage);
          
          setMessages([{
            id: Date.now(),
            text: welcomeMessage,
            isUser: false,
            imageUrl: exampleImageUrl,
            designName: exampleTitle
          }]);
          
          await refreshSessions();
          
        } else if (initialPrompt) {
          // 正常提示词模式
          const session = await sessionService.createSession(initialPrompt);
          setCurrentSessionId(session.id);
          setSelectedSessionId(session.id);
          llmService.setCurrentSession(session.id);
          
          const welcomeMessage = `欢迎来到Sox Lab设计工作室！我已经收到您的初始想法："${initialPrompt}"。让我们一起完善这个设计创意吧！`;
          
          await sessionService.addMessage(session.id, 'assistant', welcomeMessage);
          
          setMessages([{
            id: Date.now(),
            text: welcomeMessage,
            isUser: false
          }]);
          
          await refreshSessions();
        } else {
          // 空会话模式
          const session = await sessionService.createSession('开始新的袜子设计会话');
          setCurrentSessionId(session.id);
          setSelectedSessionId(session.id);
          llmService.setCurrentSession(session.id);
          
          const welcomeMessage = `欢迎来到Sox Lab设计工作室！我是您的专属设计助手。让我们开始创造属于您的独特袜子设计吧！请告诉我：

- 您想要什么样的袜子？
- 有特定的主题或风格偏好吗？
- 用于什么场合？

我会根据您的想法帮您设计出完美的袜子！`;

          await sessionService.addMessage(session.id, 'assistant', welcomeMessage);
          
          setMessages([{
            id: Date.now(),
            text: welcomeMessage,
            isUser: false
          }]);
          
          await refreshSessions();
        }
        
        console.log('会话初始化完成');
      } catch (error) {
        console.error('初始化会话失败:', error);
        toast({
          title: "初始化失败",
          description: "无法创建设计会话，请重试",
          variant: "destructive"
        });
      }
    };

    initializeSession();
  }, [user, initialPrompt, isEditingExample, exampleTitle, exampleImageUrl, examplePrompt, toast, refreshSessions]);

  // 处理发送消息
  const handleSendMessage = async (messageText: string) => {
    if (!currentSessionId || !user) return;

    try {
      // 添加用户消息到UI和数据库
      const userMessage: Message = {
        id: Date.now(),
        text: messageText,
        isUser: true
      };
      
      setMessages(prev => [...prev, userMessage]);
      await sessionService.addMessage(currentSessionId, 'user', messageText);

      // 如果是编辑模式，标记有待处理的编辑指令
      if (isEditingMode) {
        setHasPendingEditInstruction(true);
        return;
      }

      // 获取会话历史
      const sessionMessages = await sessionService.getSessionMessages(currentSessionId);
      const conversationHistory = sessionMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at).getTime()
      }));

      // 调用LLM获取回复
      const response = await llmService.sendMessageWithHistory(
        messageText,
        conversationHistory,
        {
          currentPhase: conversationManager.getState().phase,
          collectedInfo: conversationManager.getCollectedInfo(),
          isComplete: conversationManager.isReadyToGenerate(),
          sessionId: currentSessionId
        }
      );

      if (response.success) {
        // 添加AI回复到UI
        const assistantMessage: Message = {
          id: Date.now() + 1,
          text: response.message,
          isUser: false
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error || 'AI回复失败');
      }

      await refreshSessions();
    } catch (error) {
      console.error('发送消息失败:', error);
      toast({
        title: "发送失败",
        description: "消息发送失败，请重试",
        variant: "destructive"
      });
    }
  };

  // 处理生成图片
  const handleGenerateImage = async () => {
    if (!currentSessionId || isGenerating) return;

    setIsGenerating(true);
    
    try {
      const sessionMessages = await sessionService.getSessionMessages(currentSessionId);
      const sessionContext = {
        sessionId: currentSessionId,
        messages: messages,
        conversationState: conversationManager.getState(),
        collectedInfo: conversationManager.getCollectedInfo(),
        requirements: conversationManager.getRequirements()
      };

      const designData = await generateDesigns(sessionContext);
      
      if (designData) {
        setCurrentDesign(designData);
        
        // 添加图片消息到聊天记录
        const imageMessage: Message = {
          id: Date.now(),
          text: `我为您生成了新的袜子设计！如果您想要修改，请告诉我具体的改动想法。`,
          isUser: false,
          imageUrl: designData.url,
          designName: designData.design_name
        };
        
        setMessages(prev => [...prev, imageMessage]);
        
        toast({
          title: "设计生成成功",
          description: "您的袜子设计已经生成完成！"
        });
      }
    } catch (error) {
      console.error('生成图片失败:', error);
      toast({
        title: "生成失败",
        description: "图片生成失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 处理编辑图片
  const handleEditImage = async () => {
    if (!currentSessionId || !currentDesign || !hasPendingEditInstruction) return;

    setIsGenerating(true);
    
    try {
      // 获取最新的用户消息作为编辑指令
      const userMessages = messages.filter(msg => msg.isUser);
      const latestUserMessage = userMessages[userMessages.length - 1];
      
      if (!latestUserMessage) {
        throw new Error('没有找到编辑指令');
      }

      const editedDesign = await editImage(
        currentDesign.url,
        latestUserMessage.text,
        currentSessionId
      );
      
      if (editedDesign) {
        setCurrentDesign(editedDesign);
        
        // 添加编辑结果消息
        const editMessage: Message = {
          id: Date.now(),
          text: `我已经根据您的要求修改了设计！如果还需要其他调整，请继续告诉我。`,
          isUser: false,
          imageUrl: editedDesign.url,
          designName: editedDesign.design_name
        };
        
        setMessages(prev => [...prev, editMessage]);
        setHasPendingEditInstruction(false);
        
        toast({
          title: "编辑成功",
          description: "设计已根据您的要求进行修改！"
        });
      }
    } catch (error) {
      console.error('编辑图片失败:', error);
      toast({
        title: "编辑失败",
        description: "图片编辑失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 处理缩略图点击
  const handleThumbnailClick = (imageUrl: string, designName?: string) => {
    if (imageUrl && designName) {
      setCurrentDesign({
        url: imageUrl,
        design_name: designName,
        prompt_en: ''
      });
      setIsEditingMode(true);
      setSelectedDesignId(Date.now());
    }
  };

  // 处理会话切换
  const handleSessionSelect = async (sessionId: string) => {
    try {
      setSelectedSessionId(sessionId);
      setCurrentSessionId(sessionId);
      llmService.setCurrentSession(sessionId);
      
      // 清除当前状态
      setCurrentDesign(null);
      setIsEditingMode(false);
      setSelectedDesignId(null);
      setHasPendingEditInstruction(false);
      
      // 加载会话消息
      const sessionMessages = await sessionService.getSessionMessages(sessionId);
      
      // 转换为UI消息格式
      const uiMessages: Message[] = sessionMessages.map(msg => ({
        id: parseInt(msg.id),
        text: msg.content,
        isUser: msg.role === 'user'
      }));
      
      setMessages(uiMessages);
      
      // 检查是否有关联的图片
      const sessionHistory = await sessionService.getSessionHistory(sessionId);
      if (sessionHistory.latestImage) {
        setCurrentDesign({
          url: sessionHistory.latestImage.image_url,
          design_name: sessionHistory.latestImage.design_name,
          prompt_en: ''
        });
        setIsEditingMode(true);
      }
      
    } catch (error) {
      console.error('切换会话失败:', error);
      toast({
        title: "切换失败",
        description: "无法加载会话，请重试",
        variant: "destructive"
      });
    }
  };

  const handleNewSession = () => {
    navigate('/design');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">请先登录</h2>
          <button 
            onClick={() => navigate('/auth')}
            className="bg-sock-purple text-white px-6 py-2 rounded-lg hover:bg-sock-dark-purple"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* 左侧会话历史 */}
      <SessionHistorySidebar
        currentSessionId={selectedSessionId}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
      />
      
      {/* 主内容区 */}
      <div className="flex-1 flex">
        {/* 聊天窗口 */}
        <div className="w-1/2 border-r">
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            onGenerateImage={handleGenerateImage}
            onEditImage={handleEditImage}
            onThumbnailClick={handleThumbnailClick}
            isEditingMode={isEditingMode}
            selectedDesignId={selectedDesignId}
            isGenerating={isGenerating}
            hasDesign={!!currentDesign}
            hasPendingEditInstruction={hasPendingEditInstruction}
            currentImageUrl={currentDesign?.url}
          />
        </div>
        
        {/* 设计区域 */}
        <div className="w-1/2">
          {currentDesign ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    {currentDesign.design_name}
                  </h3>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={currentDesign.url} 
                      alt={currentDesign.design_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isGenerating && (
                    <div className="mt-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sock-purple mx-auto"></div>
                      <p className="text-sm text-gray-600 mt-2">处理中...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">还没有设计图片</p>
                <p className="text-sm">开始聊天并生成您的袜子设计</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignStudio;
