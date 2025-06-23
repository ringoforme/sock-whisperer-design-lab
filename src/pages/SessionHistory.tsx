
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MessageCircle, Image, FileText, Zap } from "lucide-react";
import { sessionService, DesignSession } from "@/services/sessionService";
import { toast } from "sonner";

const SessionHistory = () => {
  const [sessions, setSessions] = useState<DesignSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionDetail, setSessionDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserSessions();
  }, []);

  const loadUserSessions = async () => {
    try {
      const userSessions = await sessionService.getUserSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error('加载会话历史失败:', error);
      toast.error('加载会话历史失败');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessionDetail = async (sessionId: string) => {
    try {
      const detail = await sessionService.getSessionComplete(sessionId);
      setSessionDetail(detail);
      setSelectedSession(sessionId);
    } catch (error) {
      console.error('加载会话详情失败:', error);
      toast.error('加载会话详情失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sock-purple mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/design" className="flex items-center text-sock-purple hover:text-sock-dark-purple">
              <ArrowLeft className="h-5 w-5 mr-2" />
              返回设计工作室
            </Link>
            <h1 className="text-2xl font-bold text-sock-purple">会话历史</h1>
          </div>
          <Link to="/profile" className="ml-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="用户" />
              <AvatarFallback>用户</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 会话列表 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  设计会话列表
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    暂无设计会话记录
                  </p>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedSession === session.id
                          ? 'border-sock-purple bg-sock-light-purple'
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => loadSessionDetail(session.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm truncate flex-1">
                          {session.title}
                        </h3>
                        <Badge className={`ml-2 text-xs ${getStatusColor(session.status)}`}>
                          {session.status === 'completed' ? '已完成' : 
                           session.status === 'active' ? '进行中' : '已放弃'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(session.created_at!)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* 会话详情 */}
          <div className="lg:col-span-2">
            {!selectedSession ? (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>选择左侧的会话查看详细记录</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* 会话概览 */}
                {sessionDetail?.session && (
                  <Card>
                    <CardHeader>
                      <CardTitle>会话概览</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">初始提示</p>
                          <p className="font-medium">{sessionDetail.session.initial_prompt}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">状态</p>
                          <Badge className={getStatusColor(sessionDetail.session.status)}>
                            {sessionDetail.session.status === 'completed' ? '已完成' : 
                             sessionDetail.session.status === 'active' ? '进行中' : '已放弃'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">创建时间</p>
                          <p className="font-medium">{formatDate(sessionDetail.session.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">更新时间</p>
                          <p className="font-medium">{formatDate(sessionDetail.session.updated_at)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 对话消息 */}
                {sessionDetail?.messages && sessionDetail.messages.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        对话记录 ({sessionDetail.messages.length} 条)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {sessionDetail.messages.map((message: any) => (
                          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-lg ${
                              message.role === 'user' 
                                ? 'bg-sock-purple text-white' 
                                : 'bg-gray-100'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {formatDate(message.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 设计需求 */}
                {sessionDetail?.requirements && sessionDetail.requirements.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        设计需求
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {sessionDetail.requirements.map((req: any) => (
                        <div key={req.id} className="border rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {req.sock_type && (
                              <div>
                                <span className="text-muted-foreground">袜子类型:</span>
                                <span className="ml-2 font-medium">{req.sock_type}</span>
                              </div>
                            )}
                            {req.patterns && req.patterns.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">图案:</span>
                                <span className="ml-2 font-medium">{req.patterns.join(', ')}</span>
                              </div>
                            )}
                            {req.occasion && (
                              <div>
                                <span className="text-muted-foreground">场合:</span>
                                <span className="ml-2 font-medium">{req.occasion}</span>
                              </div>
                            )}
                            {req.style && (
                              <div>
                                <span className="text-muted-foreground">风格:</span>
                                <span className="ml-2 font-medium">{req.style}</span>
                              </div>
                            )}
                          </div>
                          {req.additional_notes && (
                            <div className="mt-4">
                              <p className="text-sm text-muted-foreground">备注:</p>
                              <p className="text-sm mt-1">{req.additional_notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* 生成的作品 */}
                {sessionDetail?.works && sessionDetail.works.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Image className="h-5 w-5 mr-2" />
                        生成的设计作品 ({sessionDetail.works.length} 个)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sessionDetail.works.map((work: any) => (
                          <div key={work.id} className="border rounded-lg p-4">
                            <div className="aspect-square mb-4">
                              <img
                                src={work.image_url}
                                alt={work.name}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">{work.name}</h4>
                                <Badge className={
                                  work.status === 'generated' ? 'bg-green-100 text-green-800' :
                                  work.status === 'failed' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }>
                                  {work.status === 'generated' ? '成功' :
                                   work.status === 'failed' ? '失败' : '处理中'}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(work.created_at)}
                              </p>
                              {work.error_message && (
                                <p className="text-xs text-red-600">{work.error_message}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionHistory;
