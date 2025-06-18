
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { llmService } from '@/services/llmService';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyConfigProps {
  onConfigured: () => void;
}

const ApiKeyConfig: React.FC<ApiKeyConfigProps> = ({ onConfigured }) => {
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "错误",
        description: "请输入有效的API密钥",
        variant: "destructive"
      });
      return;
    }

    // 由于现在使用 Supabase Edge Functions，API 密钥在服务端管理
    // 这里只是展示给用户，实际的 API 密钥应该在 Supabase 项目设置中配置
    toast({
      title: "提示",
      description: "API密钥应该在 Supabase 项目设置中配置。当前应用使用 Supabase Edge Functions 来安全管理 OpenAI API 调用。",
      variant: "default"
    });
    onConfigured();
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>配置AI功能</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          当前应用使用 Supabase Edge Functions 来安全管理 OpenAI API 调用。
          <br />
          <strong>注意：</strong> API 密钥已在服务端安全配置。
        </p>
        
        <Input
          type="password"
          placeholder="sk-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled
        />
        
        <div className="flex gap-2">
          <Button onClick={onConfigured} className="flex-1">
            继续使用
          </Button>
        </div>
        
        <p className="text-xs text-gray-500">
          * API 密钥通过 Supabase Edge Functions 安全管理
        </p>
      </CardContent>
    </Card>
  );
};

export default ApiKeyConfig;
