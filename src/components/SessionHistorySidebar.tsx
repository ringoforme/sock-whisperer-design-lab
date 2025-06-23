
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { 
  MessageCircle, 
  Plus, 
  Trash2, 
  Edit3,
  Clock
} from 'lucide-react';
import { sessionService, DesignSession } from '@/services/sessionService';
import { toast } from 'sonner';

interface SessionHistorySidebarProps {
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

const SessionHistorySidebar: React.FC<SessionHistorySidebarProps> = ({
  currentSessionId,
  onSessionSelect,
  onNewSession
}) => {
  const [sessions, setSessions] = useState<DesignSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const userSessions = await sessionService.getUserSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error('加载会话列表失败:', error);
      toast.error('加载会话列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await sessionService.updateSessionStatus(sessionId, 'archived');
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success('会话已删除');
      
      // 如果删除的是当前会话，创建新会话
      if (sessionId === currentSessionId) {
        onNewSession();
      }
    } catch (error) {
      console.error('删除会话失败:', error);
      toast.error('删除会话失败');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const groupSessionsByDate = (sessions: DesignSession[]) => {
    const groups: { [key: string]: DesignSession[] } = {};
    
    sessions.forEach(session => {
      const date = new Date(session.created_at!);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = '今天';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = '昨天';
      } else {
        groupKey = date.toLocaleDateString('zh-CN');
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(session);
    });
    
    return groups;
  };

  if (isLoading) {
    return (
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold">会话历史</h2>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent className="p-4">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  const groupedSessions = groupSessionsByDate(sessions);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">会话历史</h2>
          <SidebarTrigger />
        </div>
        <div className="px-4 pb-4">
          <Button 
            onClick={onNewSession}
            className="w-full bg-sock-purple hover:bg-sock-dark-purple"
          >
            <Plus className="h-4 w-4 mr-2" />
            新建会话
          </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {Object.keys(groupedSessions).length === 0 ? (
          <div className="text-center text-muted-foreground p-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无会话记录</p>
            <p className="text-sm mt-2">开始新的设计对话吧！</p>
          </div>
        ) : (
          Object.entries(groupedSessions).map(([dateGroup, groupSessions]) => (
            <SidebarGroup key={dateGroup}>
              <SidebarGroupLabel className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {dateGroup}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {groupSessions.map((session) => (
                    <SidebarMenuItem key={session.id}>
                      <SidebarMenuButton
                        onClick={() => onSessionSelect(session.id)}
                        isActive={currentSessionId === session.id}
                        className="flex items-center justify-between w-full p-3 hover:bg-gray-50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium truncate">
                              {session.title}
                            </span>
                            <Badge className={`text-xs ${getStatusColor(session.status)}`}>
                              {session.status === 'completed' ? '完成' :
                               session.status === 'active' ? '进行中' : '已暂停'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {session.initial_prompt}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(session.created_at!)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleDeleteSession(session.id, e)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default SessionHistorySidebar;
