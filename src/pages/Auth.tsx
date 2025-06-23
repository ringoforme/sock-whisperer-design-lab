
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { user, signIn, signUp, loading } = useAuth();

  // 如果已登录，重定向到主页
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          console.error('注册错误详情:', error);
          
          // 如果是网络错误且重试次数少于3次，允许重试
          if (error.message.includes('网络') && retryCount < 3) {
            setRetryCount(prev => prev + 1);
            toast.error(`注册失败，正在重试... (${retryCount + 1}/3)`);
            // 延迟重试
            setTimeout(() => handleSubmit(e), 2000);
            return;
          }
          
          toast.error(error.message || '注册失败，请重试');
        } else {
          toast.success('注册成功！正在自动登录...');
          setRetryCount(0); // 重置重试计数
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          console.error('登录错误详情:', error);
          
          // 如果是网络错误且重试次数少于3次，允许重试
          if (error.message.includes('网络') && retryCount < 3) {
            setRetryCount(prev => prev + 1);
            toast.error(`登录失败，正在重试... (${retryCount + 1}/3)`);
            // 延迟重试
            setTimeout(() => handleSubmit(e), 2000);
            return;
          }
          
          toast.error(error.message || '登录失败，请重试');
        } else {
          toast.success('登录成功！');
          setRetryCount(0); // 重置重试计数
        }
      }
    } catch (error) {
      console.error('认证过程中发生未捕获错误:', error);
      toast.error('操作失败，请检查网络连接后重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sock-purple mx-auto mb-2"></div>
          <div>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center mb-2">
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 w-8 h-8 rounded-md mr-2"></div>
            <h1 className="text-2xl font-bold">Sox Lab工作室</h1>
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? '注册账户' : '欢迎回来'}
          </CardTitle>
          <CardDescription>
            {isSignUp ? '创建您的账户开始设计' : '请输入您的账户信息以登录'}
          </CardDescription>
          {retryCount > 0 && (
            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
              正在重试 ({retryCount}/3)...
            </div>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">姓名</label>
                <Input 
                  id="fullName"
                  type="text" 
                  placeholder="您的姓名"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignUp}
                  disabled={isLoading}
                />
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">邮箱</label>
              <Input 
                id="email"
                type="email" 
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">密码</label>
              <Input 
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              {isSignUp && (
                <p className="text-xs text-gray-500">密码至少需要6个字符</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-sock-purple hover:bg-sock-dark-purple text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isSignUp ? '注册中...' : '登录中...'}
                </div>
              ) : (
                isSignUp ? '注册' : '登录'
              )}
            </Button>
            <div className="text-center text-sm">
              {isSignUp ? '已有账户？' : '还没有账户？'}{" "}
              <button 
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setRetryCount(0); // 切换模式时重置重试计数
                }}
                className="text-sock-purple hover:underline"
                disabled={isLoading}
              >
                {isSignUp ? '登录' : '注册'}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
