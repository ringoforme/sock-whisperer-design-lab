import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, File, Edit, AlertCircle } from "lucide-react";
import ChatWindow from "@/components/ChatWindow";
import EditingView from "@/components/EditingView";
import RegenerateButton from "@/components/RegenerateButton";
import { useDesignStorage } from "@/hooks/useDesignStorage";

import { generateDesigns, regenerateImage } from "@/services/design.service";
import type { DesignData } from "@/types/design";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

type DesignState = DesignData & { isEditing?: boolean; error?: string };

const DesignLab = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "欢迎来到Sox Lab设计工作室！描述您理想的袜子，我会为您创作。",
      isUser: false,
    },
  ]);
  const [designs, setDesigns] = useState<DesignState[]>([]);
  const [selectedDesignIndex, setSelectedDesignIndex] = useState<number | null>(
    null
  );
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const { addDesign } = useDesignStorage();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialPrompt = params.get("prompt");
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [location]);

  // 需求3: 优化前端状态管理逻辑
  const triggerInitialGeneration = async (prompt: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const newDesigns = await generateDesigns(prompt);
      // 只有在API完全成功时，才用新结果覆盖旧结果
      setDesigns(newDesigns.map((d) => ({ ...d, isEditing: false })));
      toast.success("已为您生成了4张精彩的设计！");
    } catch (err: any) {
      // 如果API调用失败，只显示错误提示，不影响界面上已有的图片
      setError(err.message);
      toast.error(`生成失败: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // handleSendMessage 函数无变化...
  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isGenerating) return;
    const userMsg = { id: Date.now(), text: userMessage, isUser: true };
    setMessages((prev) => [...prev, userMsg]);
    if (isEditingMode && selectedDesignIndex !== null) {
      setIsGenerating(true);
      const originalPrompt = designs[selectedDesignIndex].prompt_en;
      const editInstruction = `Based on the original prompt: "${originalPrompt}", please apply this modification: "${userMessage}"`;
      try {
        const newDesign = await regenerateImage(editInstruction);
        setDesigns((prev) =>
          prev.map((design, index) =>
            index === selectedDesignIndex
              ? { ...newDesign, isEditing: true }
              : design
          )
        );
        toast.success(`设计 #${selectedDesignIndex + 1} 已更新！`);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: "我已根据您的指令更新了设计。",
            isUser: false,
          },
        ]);
      } catch (err: any) {
        toast.error(`编辑失败: ${err.message}`);
      } finally {
        setIsGenerating(false);
      }
    } else {
      triggerInitialGeneration(userMessage);
    }
  };

  const handleRegenerate = async () => {
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((m) => m.isUser)?.text;
    if (!lastUserMessage) {
      toast.error("没有可用于重新生成的上下文，请先发送一条设计指令。");
      return;
    }
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: `好的，正在根据您之前的想法 "${lastUserMessage}" 重新生成...`,
        isUser: false,
      },
    ]);
    triggerInitialGeneration(lastUserMessage);
  };

  // 其他 handlers (handleEdit, handleExitEdit 等) 保持不变...
  const handleEdit = (index: number) => {
    if (designs[index].design_name === "生成失败") {
      toast.info("无法编辑一个生成失败的设计。");
      return;
    }
    setSelectedDesignIndex(index);
    setIsEditingMode(true);
    setDesigns((prev) =>
      prev.map((design, i) => ({ ...design, isEditing: i === index }))
    );
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: `现在正在编辑设计 #${index + 1}。`,
        isUser: false,
      },
    ]);
  };

  const handleExitEdit = () => {
    setIsEditingMode(false);
    setSelectedDesignIndex(null);
    setDesigns((prev) =>
      prev.map((design) => ({ ...design, isEditing: false }))
    );
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: "已退出编辑模式。", isUser: false },
    ]);
  };

  const handleDownload = (index: number) => {
    /* ...函数内容不变... */
  };
  const handleVectorize = (index: number) => {
    /* ...函数内容不变... */
  };
  const getSelectedDesignData = () => {
    if (selectedDesignIndex === null) return undefined;
    return designs[selectedDesignIndex];
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sock-purple">
            袜匠设计工作室
          </h1>
          <nav className="flex items-center space-x-4">
            <Link
              to="/drafts"
              className="text-gray-700 hover:text-sock-purple transition-colors"
            >
              草稿
            </Link>
            <Link to="/profile" className="ml-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="用户" />
                <AvatarFallback>用户</AvatarFallback>
              </Avatar>
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto py-6 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          <div className="h-[80vh] flex flex-col border rounded-lg overflow-hidden">
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              isEditingMode={isEditingMode}
              selectedDesignId={selectedDesignIndex}
            />
          </div>
          <div className="h-[80vh] overflow-y-auto">
            {isEditingMode &&
            selectedDesignIndex !== null &&
            getSelectedDesignData() ? (
              <EditingView
                design={getSelectedDesignData()!}
                onExitEdit={handleExitEdit}
                onDownload={() => handleDownload(selectedDesignIndex)}
                onVectorize={() => handleVectorize(selectedDesignIndex)}
              />
            ) : (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">设计作品</h2>
                  <RegenerateButton
                    onRegenerate={handleRegenerate}
                    isGenerating={isGenerating}
                    label="重新生成4张" // 需求1: 修改按钮文字
                  />
                </div>

                {isGenerating && designs.length === 0 && (
                  <p className="text-center text-gray-500 py-10">
                    正在为您生成全新的设计，请稍候...
                  </p>
                )}
                {error && (
                  <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {designs.map((design, index) => (
                    <Card
                      key={`${index}-${design.url}`}
                      className={`overflow-hidden transition-all ${
                        design.isEditing ? "ring-2 ring-sock-purple" : ""
                      } ${design.error ? "border-red-300" : ""}`}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square relative bg-gray-100">
                          <img
                            src={design.url}
                            alt={design.design_name}
                            className="w-full h-full object-cover"
                          />
                          {design.error && (
                            <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex flex-col items-center justify-center text-white p-2">
                              <AlertCircle className="h-8 w-8 mb-2" />
                              <span className="text-sm font-bold text-center">
                                生成失败
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-3 flex justify-between items-center">
                          <span
                            className={`text-sm font-medium ${
                              design.error ? "text-red-500" : ""
                            }`}
                          >
                            {design.design_name}
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(index)}
                              disabled={!!design.error}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleVectorize(index)}
                              disabled={!!design.error}
                            >
                              <File className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={design.isEditing ? "default" : "ghost"}
                              size="icon"
                              onClick={() => handleEdit(index)}
                              disabled={!!design.error}
                              className={
                                design.isEditing
                                  ? "text-white bg-sock-purple"
                                  : ""
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DesignLab;
