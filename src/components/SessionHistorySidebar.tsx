
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { MessageCircle, Plus, Search, Trash2, Clock } from "lucide-react";
import { sessionService, DesignSession } from "@/services/sessionService";
import { toast } from "sonner";

interface SessionHistorySidebarProps {
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

const SessionHistorySidebar: React.FC<SessionHistorySidebarProps> = ({
  currentSessionId,
  onSessionSelect,
  onNewSession,
}) => {
  const [sessions, setSessions] = useState<DesignSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const userSessions = await sessionService.getUserSessions();
      // 过滤掉没有用户消息的会话
      const validSessions = await Promise.all(
        userSessions.map(async (session) => {
          const messages = await sessionService.getSessionMessages(session.id);
          const hasUserMessages = messages.some(msg => msg.role === 'user');
          return hasUserMessages ? session : null;
        })
      );
      setSessions(validSessions.filter(Boolean) as DesignSession[]);
    } catch (error) {
      console.error('加载会话失败:', error);
      toast.error('加载会话失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await sessionService.deleteSession(sessionId);
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

  const filteredSessions = sessions.filter(session =>
    session.session_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.initial_idea.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'abandoned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-sock-purple">设计会话</h2>
          <Button 
            size="sm" 
            onClick={onNewSession}
            className="bg-sock-purple hover:bg-sock-dark-purple"
          >
            <Plus className="h-4 w-4 mr-1" />
            新建
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索会话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>会话历史</SidebarGroupLabel>
          <SidebarGroupContent>
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sock-purple mx-auto mb-2"></div>
                加载中...
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchQuery ? '没有找到匹配的会话' : '暂无会话记录'}
                </p>
              </div>
            ) : (
              <SidebarMenu>
                {filteredSessions.map((session) => (
                  <SidebarMenuItem key={session.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={session.id === currentSessionId}
                    >
                      <div
                        className="cursor-pointer p-3 hover:bg-gray-50 transition-colors relative group"
                        onClick={() => onSessionSelect(session.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-sm truncate flex-1 pr-2">
                            {session.session_title}
                          </h3>
                          <div className="flex items-center space-x-1">
                            <Badge className={`text-xs ${getStatusColor(session.status)}`}>
                              {session.status === 'completed' ? '完成' : 
                               session.status === 'active' ? '活跃' : '暂停'}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => handleDeleteSession(session.id, e)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 truncate mb-2">
                          {session.initial_idea}
                        </p>
                        
                        <div className="flex items-center text-xs text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(session.created_at)}
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Link to="/session-history" className="text-sm text-sock-purple hover:underline">
          查看所有会话详情
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SessionHistorySidebar;
