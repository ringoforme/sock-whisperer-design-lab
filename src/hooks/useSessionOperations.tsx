
import { useCallback } from 'react';
import { toast } from 'sonner';
import { sessionService } from '@/services/sessionService';
import { ConversationManager } from '@/services/conversationManager';
import type { SessionMessage } from '@/types/session';

interface UseSessionOperationsProps {
  sessionState: {
    currentSessionId: string | null;
    hasUserInteraction: boolean;
  };
  conversationManager: ConversationManager;
  updateSessionId: (sessionId: string) => void;
  addMessage: (message: SessionMessage) => void;
  setMessages: (messages: SessionMessage[]) => void;
  setConversationManager: (manager: ConversationManager) => void;
}

export const useSessionOperations = ({
  sessionState,
  conversationManager,
  updateSessionId,
  addMessage,
  setMessages,
  setConversationManager,
}: UseSessionOperationsProps) => {
  
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      const sessionDetail = await sessionService.getSessionComplete(sessionId);
      
      if (!sessionDetail.session) {
        throw new Error('会话不存在');
      }

      updateSessionId(sessionId);
      
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
      newConversationManager.setSessionId(sessionId);
      
      // 恢复对话历史
      for (const msg of sessionDetail.messages) {
        if (msg.role === 'user') {
          await newConversationManager.addUserMessage(msg.content);
        } else {
          newConversationManager.addToHistory('assistant', msg.content);
        }
      }
      setConversationManager(newConversationManager);
      
    } catch (error) {
      console.error('加载会话失败:', error);
      toast.error('加载会话失败');
    }
  }, [updateSessionId, setMessages, setConversationManager]);

  const handleUserMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // 添加用户消息到UI
    const userMsg: SessionMessage = {
      id: Date.now(),
      text: userMessage,
      isUser: true
    };
    addMessage(userMsg);

    try {
      // 如果这是用户的第一条真实消息且没有会话ID，创建数据库会话
      if (!sessionState.hasUserInteraction && !sessionState.currentSessionId) {
        const session = await sessionService.createSession(userMessage);
        updateSessionId(session.id);
        
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
      addMessage(aiMsg);

      // 如果有会话ID，保存消息到数据库
      if (sessionState.currentSessionId) {
        await sessionService.addMessage(sessionState.currentSessionId, 'user', userMessage);
        await sessionService.addMessage(sessionState.currentSessionId, 'assistant', aiResponse);
      }

    } catch (error) {
      console.error('处理用户消息失败:', error);
      addMessage({
        id: Date.now() + 1,
        text: "抱歉，我暂时无法回应。请稍后再试。",
        isUser: false
      });
    }
  }, [conversationManager, sessionState.currentSessionId, sessionState.hasUserInteraction, updateSessionId, addMessage]);

  return {
    loadSession,
    handleUserMessage,
  };
};
