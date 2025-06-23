import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, History, Download, Edit3 } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import { sessionService } from '../services/sessionService';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';

const DesignStudio = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [designBrief, setDesignBrief] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: sessionHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['sessionHistory', currentSessionId],
    queryFn: () => currentSessionId ? sessionService.getSessionHistory(currentSessionId) : null,
    enabled: !!currentSessionId,
  });

  useEffect(() => {
    const createInitialSession = async () => {
      try {
        const newSession = await sessionService.createSession('新设计会话');
        setCurrentSessionId(newSession.id);
        console.log('创建初始会话:', newSession.id);
      } catch (error) {
        console.error('创建初始会话失败:', error);
        toast({
          title: "错误",
          description: "创建设计会话失败，请刷新页面重试",
          variant: "destructive",
        });
      }
    };

    createInitialSession();
  }, [toast]);

  const handleGenerate = async () => {
    if (!currentSessionId || !designBrief) {
      toast({
        title: "无法生成",
        description: "请先完成设计对话以生成设计简报",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('开始生成袜子设计...');
      
      const { data, error } = await supabase.functions.invoke('generate-sock-design', {
        body: {
          sessionId: currentSessionId,
          brief: designBrief
        }
      });

      if (error) {
        console.error('生成设计时出错:', error);
        throw error;
      }

      console.log('设计生成成功:', data);
      
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        await refetchHistory();
        
        toast({
          title: "设计生成成功！",
          description: "您的袜子设计已经生成完成",
        });
      }
    } catch (error) {
      console.error('生成设计失败:', error);
      toast({
        title: "生成失败",
        description: "设计生成过程中出现错误，请重试",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const imageUrl = generatedImage || sessionHistory?.latestImage?.image_url;
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `sock-design-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "下载成功",
        description: "设计图片已保存到您的设备",
      });
    } catch (error) {
      console.error('下载失败:', error);
      toast({
        title: "下载失败",
        description: "无法下载图片，请重试",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    const imageUrl = generatedImage || sessionHistory?.latestImage?.image_url;
    if (imageUrl) {
      navigate(`/edit?image=${encodeURIComponent(imageUrl)}`);
    }
  };

  const displayImage = generatedImage || sessionHistory?.latestImage?.image_url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sox Lab 设计工作室</h1>
          <p className="text-lg text-gray-600">与AI对话，设计专属于你的袜子</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Chat Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wand2 className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-semibold">设计对话</h2>
                </div>
                {currentSessionId && (
                  <ChatWindow 
                    sessionId={currentSessionId}
                    onDesignBriefUpdate={setDesignBrief}
                  />
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !designBrief}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    生成设计
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/history')}
                className="shadow-lg"
                size="lg"
              >
                <History className="w-4 h-4 mr-2" />
                历史记录
              </Button>
            </div>
          </div>

          {/* Design Preview Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-blue-600" />
                    设计预览
                  </h2>
                  {displayImage && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="shadow-sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        下载
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEdit}
                        className="shadow-sm"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        编辑
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  {displayImage ? (
                    <div className="w-full max-w-2xl mx-auto p-4">
                      <img 
                        src={displayImage} 
                        alt="Generated sock design"
                        className="w-full h-auto rounded-lg shadow-lg object-contain"
                      />
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 space-y-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                        <Wand2 className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium">等待设计生成</p>
                      <p className="text-sm">完成对话后点击"生成设计"按钮</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Design Brief Display */}
            {designBrief && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">设计简报</h3>
                  <div className="space-y-3">
                    {designBrief.sockType && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">袜子类型</Badge>
                        <span className="text-sm">{designBrief.sockType}</span>
                      </div>
                    )}
                    {designBrief.colors && designBrief.colors.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">主要颜色</Badge>
                        <div className="flex gap-1">
                          {designBrief.colors.map((color: string, index: number) => (
                            <span key={index} className="text-sm px-2 py-1 bg-gray-100 rounded">
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {designBrief.pattern && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">图案</Badge>
                        <span className="text-sm">{designBrief.pattern}</span>
                      </div>
                    )}
                    {designBrief.style && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">风格</Badge>
                        <span className="text-sm">{designBrief.style}</span>
                      </div>
                    )}
                    {designBrief.occasion && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">场合</Badge>
                        <span className="text-sm">{designBrief.occasion}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignStudio;
