
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Upload, X } from 'lucide-react';
import QuickPrompts from '@/components/QuickPrompts';
import { llmService } from '@/services/llmService';
import { useToast } from '@/hooks/use-toast';

interface HeroSectionProps {
  showApiConfig: boolean;
  setShowApiConfig: (show: boolean) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ showApiConfig, setShowApiConfig }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "文件类型错误",
          description: "请选择图片文件 (JPG, PNG)",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: "文件大小不能超过 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      toast({
        title: "文件已选择",
        description: `已选择文件: ${file.name}`
      });
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateClick = async () => {
    if (chatInput.trim()) {
      const params = new URLSearchParams({
        prompt: chatInput
      });
      navigate(`/design?${params.toString()}`);
    } else {
      navigate('/design');
    }
  };

  const handleCustomizedClick = () => {
    if (chatInput.trim()) {
      const params = new URLSearchParams({
        prompt: chatInput
      });
      navigate(`/customized?${params.toString()}`);
    } else {
      navigate('/customized');
    }
  };

  const handleUploadGenerate = () => {
    if (!selectedFile) {
      toast({
        title: "请选择图片",
        description: "请先选择要处理的图片文件",
        variant: "destructive"
      });
      return;
    }
    
    if (!chatInput.trim()) {
      toast({
        title: "请输入提示词",
        description: "请输入您想要的设计要求",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate to design studio with upload parameters
    const params = new URLSearchParams({
      mode: 'upload',
      prompt: chatInput
    });
    
    // Store file in sessionStorage temporarily
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        sessionStorage.setItem('uploadFile', JSON.stringify({
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          data: e.target.result
        }));
        navigate(`/design?${params.toString()}`);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    if (!llmService.isConfigured()) {
      setShowApiConfig(true);
      return;
    }
    setIsProcessing(true);
    try {
      const response = await llmService.sendMessage(chatInput);
      if (response.success) {
        toast({
          title: "AI回复",
          description: response.message
        });

        setTimeout(() => {
          handleCreateClick();
        }, 2000);
      } else {
        toast({
          title: "错误",
          description: response.error || "AI服务不可用",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "发送消息失败",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setChatInput(prompt);
    toast({
      title: "已填入提示词",
      description: "您可以修改后点击发送或直接创建设计"
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateClick(); // 直接调用快速创建，而不是缓慢的AI对话流程
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          创造属于您的 <span className="relative">
            <span>Sox Lab作品</span>
            <span className="absolute -right-12 top-0">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 w-8 h-8 rounded-md"></div>
            </span>
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-12">
          从创意到落地，您的私人袜子设计师
        </p>
        
        {/* Enhanced Chat box */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 mb-8">
          <Textarea 
            placeholder="让Sox Lab为您创造一个..." 
            className="w-full px-4 py-3 text-lg bg-transparent border-none focus:outline-none resize-none min-h-[60px] focus-visible:ring-0" 
            value={chatInput} 
            onChange={e => setChatInput(e.target.value)} 
            onKeyPress={handleKeyPress} 
          />
          
          {/* File preview */}
          {selectedFile && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                style={{ display: 'none' }} 
                accept="image/*" 
              />
              <Button variant="outline" size="sm" onClick={handleAttachClick}>
                <Upload className="h-4 w-4 mr-2" />
                {selectedFile ? "更换图片" : "上传图片"}
              </Button>
              <span className="text-xs text-gray-500">按Enter快速创建，点击发送按钮获取AI建议</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleCreateClick}>
                创建
              </Button>
              <Button variant="outline" size="sm" onClick={handleCustomizedClick}>
                定制
              </Button>
              {selectedFile && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleUploadGenerate}
                  className="bg-green-50 hover:bg-green-100 text-green-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  上传生成
                </Button>
              )}
              <Button 
                size="sm" 
                className="rounded-full aspect-square p-2 bg-sock-purple hover:bg-sock-dark-purple" 
                onClick={handleSendMessage} 
                disabled={isProcessing}
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Quick Prompt Buttons */}
        <QuickPrompts onPromptClick={handlePromptClick} />
      </div>
    </section>
  );
};

export default HeroSection;
