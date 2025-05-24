
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

    llmService.setApiKey(apiKey);
    toast({
      title: "成功",
      description: "API密钥已保存"
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
          为了使用AI设计功能，请输入您的OpenAI API密钥。
          <br />
          <strong>注意：</strong> 推荐使用Supabase集成来安全管理API密钥。
        </p>
        
        <Input
          type="password"
          placeholder="sk-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            保存配置
          </Button>
          <Button variant="outline" onClick={onConfigured}>
            跳过
          </Button>
        </div>
        
        <p className="text-xs text-gray-500">
          * API密钥仅保存在您的浏览器本地存储中
        </p>
      </CardContent>
    </Card>
  );
};

export default ApiKeyConfig;
