
import { useState } from 'react';
import { ConversationManager } from '@/services/conversationManager';
import type { SessionMessage, SessionState } from '@/types/session';

const INITIAL_MESSAGE: SessionMessage = {
  id: 1,
  text: "欢迎来到Sox Lab设计工作室！我是您的专属设计助手。让我们开始创造属于您的独特袜子设计吧！请告诉我您想要什么样的袜子？",
  isUser: false
};

export const useSessionState = () => {
  const [sessionState, setSessionState] = useState<SessionState>({
    currentSessionId: null,
    messages: [INITIAL_MESSAGE],
    hasUserInteraction: false,
  });

  const [conversationManager, setConversationManager] = useState(() => new ConversationManager());

  const resetSession = () => {
    setSessionState({
      currentSessionId: null,
      messages: [INITIAL_MESSAGE],
      hasUserInteraction: false,
    });
    setConversationManager(new ConversationManager());
  };

  const updateSessionId = (sessionId: string) => {
    setSessionState(prev => ({
      ...prev,
      currentSessionId: sessionId,
      hasUserInteraction: true,
    }));
  };

  const addMessage = (message: SessionMessage) => {
    setSessionState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  };

  const setMessages = (messages: SessionMessage[]) => {
    setSessionState(prev => ({
      ...prev,
      messages,
    }));
  };

  const addDesignWorkToLastMessage = (designWork: {
    id: string;
    name: string;
    thumbnail_url?: string;
    image_url: string;
    status: string;
  }) => {
    setSessionState(prev => {
      const newMessages = [...prev.messages];
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
      return {
        ...prev,
        messages: newMessages,
      };
    });
  };

  return {
    sessionState,
    conversationManager,
    setConversationManager,
    resetSession,
    updateSessionId,
    addMessage,
    setMessages,
    addDesignWorkToLastMessage,
  };
};
