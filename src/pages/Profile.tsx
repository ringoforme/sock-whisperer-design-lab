
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sock-purple">袜匠个人资料</h1>
          <nav className="flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-sock-purple transition-colors">
              首页
            </Link>
            <Link to="/drafts" className="text-gray-700 hover:text-sock-purple transition-colors">
              草稿
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 max-w-3xl">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="https://github.com/shadcn.png" alt="用户" />
              <AvatarFallback>用户</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">用户资料</CardTitle>
              <p className="text-sm text-gray-500">user@example.com</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">账户信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">姓名</p>
                    <p>张三</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">邮箱</p>
                    <p>user@example.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">注册时间</p>
                    <p>2025年5月15日</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">订阅类型</p>
                    <p>高级会员</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">统计数据</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-sock-purple">8</p>
                      <p className="text-sm text-gray-500">创建的设计</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-sock-purple">3</p>
                      <p className="text-sm text-gray-500">已下载</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-sock-purple">2</p>
                      <p className="text-sm text-gray-500">已矢量化</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2">编辑资料</Button>
                <Button className="bg-sock-purple hover:bg-sock-dark-purple">升级套餐</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
