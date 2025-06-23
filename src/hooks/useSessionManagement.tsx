
import { useCallback } from 'react';
import { useSessionState } from '@/hooks/useSessionState';
import { useSessionOperations } from '@/hooks/useSessionOperations';

export const useSessionManagement = () => {
  const {
    sessionState,
    conversationManager,
    setConversationManager,
    resetSession,
    updateSessionId,
    addMessage,
    setMessages,
    addDesignWorkToLastMessage,
  } = useSessionState();

  const { loadSession, handleUserMessage } = useSessionOperations({
    sessionState,
    conversationManager,
    updateSessionId,
    addMessage,
    setMessages,
    setConversationManager,
  });

  // 创建新会话（延迟创建，只在用户真正交互时）
  const createNewSession = useCallback(async (initialPrompt?: string) => {
    try {
      resetSession();
      
      if (initialPrompt) {
        await handleUserMessage(initialPrompt);
      }
    } catch (error) {
      console.error('创建新会话失败:', error);
    }
  }, [resetSession, handleUserMessage]);

  return {
    currentSessionId: sessionState.currentSessionId,
    messages: sessionState.messages,
    conversationManager,
    hasUserInteraction: sessionState.hasUserInteraction,
    createNewSession,
    loadSession,
    handleUserMessage,
    addDesignWorkToLastMessage
  };
};
