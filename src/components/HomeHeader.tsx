
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, LogOut, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const HomeHeader: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "已退出登录",
      description: "您已成功退出登录"
    });
  };

  return (
    <header className="py-4 px-4">
      <div className="container mx-auto max-w-7xl flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-orange-500 to-purple-500 w-8 h-8 rounded-md mr-2"></div>
          <h1 className="text-2xl font-bold">Sox Lab</h1>
        </div>
        <div className="flex gap-4 items-center">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={profile?.full_name || user.email || "用户"} />
                    <AvatarFallback>
                      {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{profile?.full_name || "用户"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>个人资料</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/drafts')}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>我的草稿</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/auth')}>登录</Button>
              <Button className="bg-black hover:bg-gray-800 text-white" onClick={() => navigate('/auth')}>免费开始</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
