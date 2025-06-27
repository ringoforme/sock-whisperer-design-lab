import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MessageCircle, Plus, Search, Trash2, Clock, Menu } from "lucide-react";
import { useOptimizedSessionHistory } from "@/hooks/useOptimizedSessionHistory";
import { sessionService } from "@/services/sessionService";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { sessions, loading, loadSessions, refresh } = useOptimizedSessionHistory();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await sessionService.deleteSession(sessionId);
      refresh(); // Use optimized refresh
      toast.success('会话已删除');
      
      if (sessionId === currentSessionId) {
        onNewSession();
      }
    } catch (error) {
      console.error('删除会话失败:', error);
      toast.error('删除会话失败');
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    onSessionSelect(sessionId);
    setIsOpen(false);
  };

  const handleNewSession = () => {
    onNewSession();
    setIsOpen(false);
  };

  const filteredSessions = sessions.filter(session =>
    session.session_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Menu className="h-4 w-4" />
          <span className="sr-only">打开会话历史</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-sock-purple">设计会话</h2>
              <Button 
                size="sm" 
                onClick={handleNewSession}
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
          </div>

          <div className="flex-1 overflow-y-auto px-4">
            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-600 mb-2">会话历史</h3>
              {loading ? (
                <div className="text-center text-gray-500 py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sock-purple mx-auto mb-2"></div>
                  加载中...
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery ? '没有找到匹配的会话' : '暂无会话记录'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors relative group ${
                        session.id === currentSessionId ? 'bg-sock-purple/10 border border-sock-purple/20' : ''
                      }`}
                      onClick={() => handleSessionSelect(session.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm truncate flex-1 pr-2">
                          {session.session_title || session.initial_idea}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <Badge className={`text-xs ${getStatusColor(session.status || 'active')}`}>
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
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t">
            <Link to="/sessions" className="text-sm text-sock-purple hover:underline">
              查看所有会话详情
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SessionHistorySidebar;
