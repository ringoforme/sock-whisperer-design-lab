import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, File, Edit } from "lucide-react";
import ChatWindow from "@/components/ChatWindow";
import EditingView from "@/components/EditingView";
import RegenerateButton from "@/components/RegenerateButton";
import { useDesignStorage } from "@/hooks/useDesignStorage";

// --- 1. IMPORT API SERVICES AND TYPES ---
import { generateDesigns, regenerateImage } from "@/services/design.service";
import type { DesignData } from "@/types/design";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

// Add isEditing to our DesignData type for local state management
type DesignState = DesignData & { isEditing?: boolean };

const DesignLab = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "欢迎来到Sox Lab设计工作室！描述您理想的袜子，我会为您创作。例如，试着说：'我想要紫色船袜配白色圆点'或'创作万圣节主题的蝙蝠袜子'",
      isUser: false,
    },
  ]);
  // --- 2. UPDATE STATE TO USE REAL DATA ---
  const [designs, setDesigns] = useState<DesignState[]>([]);
  const [selectedDesignIndex, setSelectedDesignIndex] = useState<number | null>(
    null
  );
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // Unified loading state
  const [error, setError] = useState<string | null>(null); // For displaying API errors

  const location = useLocation();
  const { addDesign } = useDesignStorage();

  // Handle initial prompt from homepage if it exists
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialPrompt = params.get("prompt");
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [location]);

  // --- 3. CREATE A REUSABLE FUNCTION FOR API CALLS ---
  const triggerInitialGeneration = async (prompt: string) => {
    setIsGenerating(true);
    setError(null);
    setDesigns([]);

    try {
      const newDesigns = await generateDesigns(prompt);
      setDesigns(newDesigns.map((d) => ({ ...d, isEditing: false })));
      toast.success("已为您生成了6张精彩的设计！");
    } catch (err: any) {
      setError(err.message);
      toast.error(`生成失败: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- 4. CONNECT THE MAIN SEND MESSAGE LOGIC ---
  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isGenerating) return;

    const userMsg = { id: Date.now(), text: userMessage, isUser: true };
    setMessages((prev) => [...prev, userMsg]);

    // Handle single image regeneration when in editing mode
    if (isEditingMode && selectedDesignIndex !== null) {
      setIsGenerating(true);
      const originalPrompt = designs[selectedDesignIndex].prompt_en;
      const editInstruction = `Based on the original prompt: "${originalPrompt}", please apply this modification: "${userMessage}"`;

      // We can use the regenerateImage for simplicity, or a more complex chat-based edit call
      try {
        // Here we are creating a new prompt for regeneration based on the edit instruction.
        // For a true "edit", a different API call (like DALL-E 2's inpainting) would be needed.
        // For now, we regenerate based on the combined idea.
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
      // If not in editing mode, trigger a full 6-image generation
      triggerInitialGeneration(userMessage);
    }
  };

  // --- 5. CONNECT THE REGENERATE BUTTON LOGIC ---
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

  // --- MODIFY OTHER HANDLERS TO USE INDEX AND NEW DATA ---
  const handleEdit = (index: number) => {
    setSelectedDesignIndex(index);
    setIsEditingMode(true);

    setDesigns((prev) =>
      prev.map((design, i) => ({
        ...design,
        isEditing: i === index,
      }))
    );

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: `现在正在编辑设计 #${index + 1}。您可以告诉我想要做什么改动。`,
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
    const design = designs[index];
    if (design) {
      addDesign(
        {
          id: `${Date.now()}-${index}`, // Create a pseudo-unique ID
          imageUrl: design.url,
          title: design.design_name,
          createdAt: new Date().toISOString(),
          type: "downloaded",
        },
        "downloaded"
      );
      toast.success(`正在下载设计: ${design.design_name}`);
      // In a real app, you'd trigger a file download from the URL
      const link = document.createElement("a");
      link.href = design.url;
      link.setAttribute("download", `${design.design_name}.png`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleVectorize = (index: number) => {
    const design = designs[index];
    if (design) {
      addDesign(
        {
          id: `${Date.now()}-${index}`,
          imageUrl: design.url,
          title: design.design_name,
          createdAt: new Date().toISOString(),
          type: "vectorized",
        },
        "vectorized"
      );
      toast.success(`正在处理矢量化: ${design.design_name}`);
      // Placeholder for real vectorization API call
    }
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
                    label="重新生成6张"
                  />
                </div>

                {isGenerating && designs.length === 0 && (
                  <p>正在生成，请稍候...</p>
                )}
                {error && <p className="text-red-500">{error}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {designs.map((design, index) => (
                    <Card
                      key={`${index}-${design.url}`}
                      className={`overflow-hidden transition-all ${
                        design.isEditing ? "ring-2 ring-sock-purple" : ""
                      }`}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square relative">
                          <img
                            src={design.url}
                            alt={design.design_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3 flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {design.design_name}
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(index)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleVectorize(index)}
                            >
                              <File className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={design.isEditing ? "default" : "ghost"}
                              size="icon"
                              onClick={() => handleEdit(index)}
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

// import React, { useState, useEffect } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { Toaster } from "@/components/ui/sonner";
// import { toast } from "sonner";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   Download,
//   File,
//   Edit,
//   PaperclipIcon,
//   MessageSquare,
//   Send,
// } from "lucide-react";
// import ChatWindow from "@/components/ChatWindow";
// import EditingView from "@/components/EditingView";
// import RegenerateButton from "@/components/RegenerateButton";
// import { useDesignStorage } from "@/hooks/useDesignStorage";
// // 其他 import 语句...
// import { generateDesigns, regenerateImage } from "@/services/design.service";
// import type { DesignData } from "@/types/design";

// interface Message {
//   id: number;
//   text: string;
//   isUser: boolean;
// }

// const DesignLab = () => {
//   const [chatInput, setChatInput] = useState("");
//   const [chatMode, setChatMode] = useState(true);
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: 1,
//       text: "欢迎来到Sox Lab设计工作室！描述您理想的袜子，我会为您创作。例如，试着说：'我想要紫色船袜配白色圆点'或'创作万圣节主题的蝙蝠袜子'",
//       isUser: false,
//     },
//   ]);
//   // DesignData 已经包含了 url, prompt_en, design_name
//   // 我们可以给它加上可选的 isEditing 字段
//   type DesignState = DesignData & { isEditing?: boolean };

//   const [designs, setDesigns] = useState<DesignState[]>([]); // 初始值是一个空数组，因为我们将从API获取数据
//   // const [designs, setDesigns] = useState<
//   //   { id: number; imageUrl: string; isEditing?: boolean }[]
//   // >([
//   //   {
//   //     id: 1,
//   //     imageUrl:
//   //       "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format",
//   //   },
//   //   {
//   //     id: 2,
//   //     imageUrl:
//   //       "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format",
//   //   },
//   //   {
//   //     id: 3,
//   //     imageUrl:
//   //       "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format",
//   //   },
//   //   {
//   //     id: 4,
//   //     imageUrl:
//   //       "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format",
//   //   },
//   //   {
//   //     id: 5,
//   //     imageUrl:
//   //       "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format",
//   //   },
//   //   {
//   //     id: 6,
//   //     imageUrl:
//   //       "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format",
//   //   },
//   // ]);
//   const [selectedDesign, setSelectedDesign] = useState<number | null>(null);
//   const [isEditingMode, setIsEditingMode] = useState(false);
//   const [isRegenerating, setIsRegenerating] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { addDesign } = useDesignStorage();

//   // Check if there's an initial prompt from the homepage
//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const initialPrompt = params.get("prompt");

//     if (initialPrompt) {
//       handleInitialPrompt(initialPrompt);
//     }
//   }, [location]);

//   const handleInitialPrompt = (prompt: string) => {
//     const newMessages = [
//       ...messages,
//       { id: messages.length + 1, text: prompt, isUser: true },
//     ];
//     setMessages(newMessages);

//     // Simulate AI response
//     setTimeout(() => {
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: prev.length + 1,
//           text: "我理解您的需求。让我为您创作一些袜子设计。",
//           isUser: false,
//         },
//       ]);
//     }, 1000);
//   };

//   const handleSendMessage = (userMessage: string) => {
//     // Add user message to chat
//     const userMsg = {
//       id: messages.length + 1,
//       text: userMessage,
//       isUser: true,
//     };
//     setMessages((prev) => [...prev, userMsg]);

//     // Simulate AI response based on context
//     setTimeout(() => {
//       let aiResponse = "";

//       if (isEditingMode && selectedDesign) {
//         // 注释：这里需要连接图片编辑API
//         // 推荐使用：OpenAI DALL-E Edit API, Adobe Photoshop API, Canva API
//         // 通过Supabase Edge Functions处理API调用
//         // 实现步骤：
//         // 1. 解析用户的编辑指令（颜色、图案、样式等）
//         // 2. 调用图片编辑API
//         // 3. 更新designs中对应图片的imageUrl
//         // 4. 保存编辑历史到数据库

//         aiResponse = `我已根据您的指令"${userMessage}"更新了设计 #${selectedDesign}。请查看预览！`;

//         // 模拟图片更新
//         setTimeout(() => {
//           setDesigns((prev) =>
//             prev.map((design) =>
//               design.id === selectedDesign
//                 ? { ...design, imageUrl: `${design.imageUrl}&t=${Date.now()}` }
//                 : design
//             )
//           );
//         }, 1500);
//       } else {
//         // 普通设计对话
//         const responses = [
//           "我已根据您的描述创建了袜子设计！请查看右侧的设计作品。",
//           "您的设计想法很棒！我已为您生成了一些概念。",
//           "根据您的要求，我创建了几种不同的袜子设计方案。",
//         ];
//         aiResponse = responses[Math.floor(Math.random() * responses.length)];
//       }

//       setMessages((prev) => [
//         ...prev,
//         { id: prev.length + 1, text: aiResponse, isUser: false },
//       ]);
//     }, 1000);
//   };

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       // In a real app, you'd handle the file upload here
//       const newMessage = `已上传文件：${e.target.files[0].name}`;
//       setMessages([
//         ...messages,
//         { id: messages.length + 1, text: newMessage, isUser: true },
//       ]);
//     }
//   };

//   const toggleChatMode = () => {
//     setChatMode(!chatMode);
//   };

//   const handleDownload = (id: number) => {
//     console.log("Downloading design:", id);
//     const design = designs.find((d) => d.id === id);
//     if (design) {
//       // 注释：这里需要实现真实的下载功能
//       // 需要连接文件存储服务，如Supabase Storage
//       addDesign(
//         {
//           id: id.toString(),
//           imageUrl: design.imageUrl,
//           title: `设计 #${id}`,
//           createdAt: new Date().toISOString(),
//           type: "downloaded",
//         },
//         "downloaded"
//       );
//       toast.success(`正在下载设计 #${id}`);
//     }
//   };

//   const handleVectorize = (id: number) => {
//     console.log("Vectorizing design:", id);
//     const design = designs.find((d) => d.id === id);
//     if (design) {
//       // 注释：这里需要实现矢量化功能
//       // 需要连接矢量化API或服务
//       addDesign(
//         {
//           id: id.toString(),
//           imageUrl: design.imageUrl,
//           title: `设计 #${id}`,
//           createdAt: new Date().toISOString(),
//           type: "vectorized",
//         },
//         "vectorized"
//       );
//       toast.success(`正在矢量化设计 #${id}`);
//     }
//   };

//   const handleEdit = (id: number) => {
//     console.log("Editing design:", id);

//     // 保存到草稿库
//     const design = designs.find((d) => d.id === id);
//     if (design) {
//       addDesign(
//         {
//           id: id.toString(),
//           imageUrl: design.imageUrl,
//           title: `设计 #${id}`,
//           createdAt: new Date().toISOString(),
//           type: "draft",
//         },
//         "drafts"
//       );
//     }

//     // 进入编辑模式
//     setSelectedDesign(id);
//     setIsEditingMode(true);

//     // 标记设计为编辑状态
//     setDesigns(
//       designs.map((design) => ({
//         ...design,
//         isEditing: design.id === id,
//       }))
//     );

//     // 更新聊天上下文，包含图片信息
//     setMessages((prev) => [
//       ...prev,
//       {
//         id: prev.length + 1,
//         text: `现在正在编辑设计 #${id}。您可以告诉我想要做什么改动，比如：
//         • 更改颜色："把蓝色改成红色"
//         • 修改图案："添加圆点图案"
//         • 调整样式："改成船袜款式"
//         • 更换主题："改成运动风格"

//         请描述您想要的具体修改！`,
//         isUser: false,
//       },
//     ]);
//   };

//   const handleRegenerate = async () => {
//     setIsRegenerating(true);

//     // 注释：这里需要连接AI图片生成API
//     // 推荐使用：DALL-E, Midjourney, 或 Stable Diffusion
//     // 通过Supabase Edge Functions调用API

//     try {
//       // 模拟API调用
//       await new Promise((resolve) => setTimeout(resolve, 3000));

//       // 生成新的设计图片URLs
//       const newDesigns = Array.from({ length: 6 }, (_, index) => ({
//         id: Date.now() + index,
//         imageUrl: `https://images.unsplash.com/photo-${
//           Date.now() + index
//         }?w=500&auto=format`,
//       }));

//       setDesigns(newDesigns);
//       toast.success("已重新生成6张新设计！");

//       setMessages((prev) => [
//         ...prev,
//         {
//           id: prev.length + 1,
//           text: "我已为您重新生成了6张全新的袜子设计！",
//           isUser: false,
//         },
//       ]);
//     } catch (error) {
//       toast.error("重新生成失败，请稍后重试");
//     } finally {
//       setIsRegenerating(false);
//     }
//   };

//   const handleExitEdit = () => {
//     setIsEditingMode(false);
//     setSelectedDesign(null);

//     // Clear editing state from designs
//     setDesigns(
//       designs.map((design) => ({
//         ...design,
//         isEditing: false,
//       }))
//     );

//     // Add message about returning to overview
//     setMessages((prev) => [
//       ...prev,
//       {
//         id: prev.length + 1,
//         text: "已退出编辑模式。您可以继续编辑其他设计或创建新的设计。",
//         isUser: false,
//       },
//     ]);
//   };

//   const getSelectedDesignData = () => {
//     return designs.find((design) => design.id === selectedDesign);
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <header className="border-b bg-white dark:bg-gray-950">
//         <div className="container mx-auto py-4 px-4 flex justify-between items-center">
//           <h1 className="text-2xl font-bold text-sock-purple">
//             袜匠设计工作室
//           </h1>
//           <nav className="flex items-center space-x-4">
//             <Link
//               to="/drafts"
//               className="text-gray-700 hover:text-sock-purple transition-colors"
//             >
//               草稿
//             </Link>
//             <Link to="/profile" className="ml-4">
//               <Avatar className="h-8 w-8">
//                 <AvatarImage src="https://github.com/shadcn.png" alt="用户" />
//                 <AvatarFallback>用户</AvatarFallback>
//               </Avatar>
//             </Link>
//           </nav>
//         </div>
//       </header>

//       <main className="container mx-auto py-6 px-4 md:px-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
//           {/* Chat Area */}
//           <div className="h-[80vh] flex flex-col border rounded-lg overflow-hidden">
//             <ChatWindow
//               messages={messages}
//               onSendMessage={handleSendMessage}
//               isEditingMode={isEditingMode}
//               selectedDesignId={selectedDesign}
//             />
//           </div>

//           {/* Design Area - Dynamic based on editing mode */}
//           <div className="h-[80vh] overflow-y-auto">
//             {isEditingMode && selectedDesign && getSelectedDesignData() ? (
//               <EditingView
//                 design={getSelectedDesignData()!}
//                 onExitEdit={handleExitEdit}
//                 onDownload={handleDownload}
//                 onVectorize={handleVectorize}
//               />
//             ) : (
//               <div>
//                 {/* Run 重新生成按钮 */}
//                 <div className="mb-4 flex justify-between items-center">
//                   <h2 className="text-lg font-semibold">设计作品</h2>
//                   <RegenerateButton
//                     onRegenerate={handleRegenerate}
//                     isGenerating={isRegenerating}
//                     label="重新生成6张"
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   {designs.map((design) => (
//                     <Card
//                       key={design.id}
//                       className={`overflow-hidden transition-all ${
//                         design.isEditing ? "ring-2 ring-sock-purple" : ""
//                       }`}
//                     >
//                       <CardContent className="p-0">
//                         <div className="aspect-square relative">
//                           <img
//                             src={design.imageUrl}
//                             alt={`袜子设计 ${design.id}`}
//                             className="w-full h-full object-cover"
//                           />
//                           {design.isEditing && (
//                             <div className="absolute top-2 right-2 bg-sock-purple text-white text-xs px-2 py-1 rounded">
//                               编辑中
//                             </div>
//                           )}
//                         </div>
//                         <div className="p-3 flex justify-between items-center">
//                           <span className="text-sm font-medium">
//                             设计 #{design.id}
//                           </span>
//                           <div className="flex space-x-2">
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               onClick={() => handleDownload(design.id)}
//                             >
//                               <Download className="h-4 w-4" />
//                             </Button>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               onClick={() => handleVectorize(design.id)}
//                             >
//                               <File className="h-4 w-4" />
//                             </Button>
//                             <Button
//                               variant={design.isEditing ? "default" : "ghost"}
//                               size="icon"
//                               onClick={() => handleEdit(design.id)}
//                               className={
//                                 design.isEditing
//                                   ? "text-white bg-sock-purple"
//                                   : ""
//                               }
//                             >
//                               <Edit className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </main>

//       <Toaster />
//     </div>
//   );
// };

// export default DesignLab;
