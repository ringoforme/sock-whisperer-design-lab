
import { useState, useEffect, useCallback } from 'react';
import { sessionService, DesignSession } from '@/services/sessionService';
import { ConversationManager } from '@/services/conversationManager';
import { toast } from 'sonner';

export interface SessionMessage {
  id: number;
  text: string;
  isUser: boolean;
  designWork?: {
    id: string;
    name: string;
    thumbnail_url?: string;
    image_url: string;
    status: string;
  };
}

export const useSessionManagement = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SessionMessage[]>([{
    id: 1,
    text: "欢迎来到Sox Lab设计工作室！我是您的专属设计助手。让我们开始创造属于您的独特袜子设计吧！请告诉我您想要什么样的袜子？",
    isUser: false
  }]);
  const [conversationManager, setConversationManager] = useState(() => new ConversationManager());
  const [hasUserInteraction, setHasUserInteraction] = useState(false);

  // 创建新会话（延迟创建，只在用户真正交互时）
  const createNewSession = useCallback(async (initialPrompt?: string) => {
    try {
      // 重置状态
      setCurrentSessionId(null);
      setHasUserInteraction(false);
      setMessages([{
        id: 1,
        text: "欢迎来到Sox Lab设计工作室！我是您的专属设计助手。让我们开始创造属于您的独特袜子设计吧！请告诉我您想要什么样的袜子？",
        isUser: false
      }]);
      
      // 重置对话管理器
      const newConversationManager = new ConversationManager();
      setConversationManager(newConversationManager);
      
      if (initialPrompt) {
        await handleUserMessage(initialPrompt);
      }
    } catch (error) {
      console.error('创建新会话失败:', error);
      toast.error('创建新会话失败');
    }
  }, []);

  // 加载现有会话
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      const sessionDetail = await sessionService.getSessionComplete(sessionId);
      
      if (!sessionDetail.session) {
        throw new Error('会话不存在');
      }

      setCurrentSessionId(sessionId);
      setHasUserInteraction(true);
      
      // 重建消息列表
      const sessionMessages: SessionMessage[] = [
        {
          id: 1,
          text: "欢迎来到Sox Lab设计工作室！我是您的专属设计助手。让我们开始创造属于您的独特袜子设计吧！请告诉我您想要什么样的袜子？",
          isUser: false
        }
      ];

      // 加载历史消息
      sessionDetail.messages.forEach((msg, index) => {
        sessionMessages.push({
          id: index + 2,
          text: msg.content,
          isUser: msg.role === 'user'
        });
      });

      // 加载设计作品并关联到相关消息
      sessionDetail.works.forEach((work) => {
        // 找到对应的助手消息并添加设计作品
        const relatedMessageIndex = sessionMessages.findIndex(
          (msg, idx) => !msg.isUser && idx > 0 && !msg.designWork
        );
        
        if (relatedMessageIndex > -1) {
          sessionMessages[relatedMessageIndex].designWork = {
            id: work.id,
            name: work.name,
            thumbnail_url: work.thumbnail_url || undefined,
            image_url: work.image_url,
            status: work.status
          };
        }
      });

      setMessages(sessionMessages);
      
      // 重建对话管理器状态
      const newConversationManager = new ConversationManager();
      // 恢复对话历史
      for (const msg of sessionDetail.messages) {
        if (msg.role === 'user') {
          await newConversationManager.addUserMessage(msg.content);
        }
      }
      setConversationManager(newConversationManager);
      
    } catch (error) {
      console.error('加载会话失败:', error);
      toast.error('加载会话失败');
    }
  }, []);

  // 处理用户消息
  const handleUserMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // 添加用户消息到UI
    const userMsg: SessionMessage = {
      id: Date.now(),
      text: userMessage,
      isUser: true
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // 如果这是用户的第一条真实消息且没有会话ID，创建数据库会话
      if (!hasUserInteraction && !currentSessionId) {
        const session = await sessionService.createSession(userMessage);
        setCurrentSessionId(session.id);
        setHasUserInteraction(true);
        
        // 更新对话管理器的会话ID
        conversationManager.setSessionId(session.id);
      }

      // 使用对话管理器生成智能回复
      const aiResponse = await conversationManager.generateResponse(userMessage);
      
      // 添加AI回复到UI
      const aiMsg: SessionMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        isUser: false
      };
      setMessages(prev => [...prev, aiMsg]);

      // 如果有会话ID，保存消息到数据库
      if (currentSessionId) {
        await sessionService.addMessage(currentSessionId, 'user', userMessage);
        await sessionService.addMessage(currentSessionId, 'assistant', aiResponse);
      }

    } catch (error) {
      console.error('处理用户消息失败:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "抱歉，我暂时无法回应。请稍后再试。",
        isUser: false
      }]);
    }
  }, [conversationManager, currentSessionId, hasUserInteraction]);

  // 添加设计作品到最新的AI消息
  const addDesignWorkToLastMessage = useCallback((designWork: {
    id: string;
    name: string;
    thumbnail_url?: string;
    image_url: string;
    status: string;
  }) => {
    setMessages(prev => {
      const newMessages = [...prev];
      // 找到最后一条AI消息
      for (let i = newMessages.length - 1; i >= 0; i--) {
        if (!newMessages[i].isUser && !newMessages[i].designWork) {
          newMessages[i] = {
            ...newMessages[i],
            designWork
          };
          break;
        }
      }
      return newMessages;
    });
  }, []);

  return {
    currentSessionId,
    messages,
    conversationManager,
    hasUserInteraction,
    createNewSession,
    loadSession,
    handleUserMessage,
    addDesignWorkToLastMessage
  };
};
