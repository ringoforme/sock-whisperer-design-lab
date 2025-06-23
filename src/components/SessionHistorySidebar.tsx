
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Plus, MessageCircle } from 'lucide-react';
import { sessionService } from '@/services/sessionService';
import { toast } from 'sonner';
import type { DesignSession } from '@/services/sessionService';

interface SessionHistorySidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

const SessionHistorySidebar: React.FC<SessionHistorySidebarProps> = ({
  isCollapsed,
  onToggle,
  currentSessionId,
  onSessionSelect,
  onNewSession
}) => {
  const [sessions, setSessions] = useState<DesignSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const userSessions = await sessionService.getUserSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error('加载会话历史失败:', error);
      toast.error('加载会话历史失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    if (sessionId !== currentSessionId) {
      onSessionSelect(sessionId);
    }
  };

  const formatSessionTitle = (session: DesignSession) => {
    return session.session_title || session.initial_idea.slice(0, 20) + '...';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`bg-white border-r transition-all duration-300 flex flex-col ${
      isCollapsed ? 'w-12' : 'w-80'
    }`}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-sock-purple" />
            <h2 className="font-semibold text-gray-900">会话历史</h2>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          {/* New Session Button */}
          <div className="p-4 border-b">
            <Button
              onClick={onNewSession}
              className="w-full bg-sock-purple hover:bg-sock-purple/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              新建设计会话
            </Button>
          </div>

          {/* Session List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {loading ? (
                <div className="text-center text-gray-500 py-8">
                  加载中...
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>还没有会话记录</p>
                  <p className="text-sm">点击上方按钮开始新的设计</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => handleSessionClick(session.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        currentSessionId === session.id
                          ? 'bg-sock-purple/10 border border-sock-purple/20'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900 line-clamp-2">
                        {formatSessionTitle(session)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(session.created_at)}
                      </div>
                      <div className={`text-xs mt-1 ${
                        session.status === 'active' ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {session.status === 'active' ? '进行中' : '已完成'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
};

export default SessionHistorySidebar;
