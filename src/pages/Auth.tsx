
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
          if (error.message.includes('User already registered')) {
            toast.error('该邮箱已注册，请直接登录');
          } else {
            toast.error(`注册失败: ${error.message}`);
          }
        } else {
          toast.success('注册成功！请查看邮箱确认链接');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('邮箱或密码错误');
          } else {
            toast.error(`登录失败: ${error.message}`);
          }
        } else {
          toast.success('登录成功！');
        }
      }
    } catch (error) {
      toast.error('操作失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-red-50 flex items-center justify-center">
        <div>加载中...</div>
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
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-sock-purple hover:bg-sock-dark-purple text-white"
              disabled={isLoading}
            >
              {isLoading ? '处理中...' : (isSignUp ? '注册' : '登录')}
            </Button>
            <div className="text-center text-sm">
              {isSignUp ? '已有账户？' : '还没有账户？'}{" "}
              <button 
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sock-purple hover:underline"
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
