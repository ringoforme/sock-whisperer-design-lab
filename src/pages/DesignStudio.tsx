import React, { useState } from "react";
// 导入我们创建的API服务和类型
import { generateDesigns, regenerateImage } from "../services/design.service";
import type { DesignData } from "../types/design";

// 这是单个设计卡片的组件，为了代码整洁我们把它也放在这里
const DesignCard: React.FC<{
  design: DesignData;
  onRegenerate: (prompt: string) => Promise<void>;
}> = ({ design, onRegenerate }) => {
  const [prompt, setPrompt] = useState(design.prompt_en);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerateClick = async () => {
    setIsRegenerating(true);
    await onRegenerate(prompt);
    setIsRegenerating(false);
  };

  return (
    <div className="border rounded-lg shadow-lg overflow-hidden transition-transform hover:-translate-y-1">
      <img
        src={design.url}
        alt={design.design_name}
        className="w-full h-80 object-cover bg-gray-200"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg">{design.design_name}</h3>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          className="w-full mt-2 p-2 border rounded-md text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleRegenerateClick}
          disabled={isRegenerating}
          className="w-full mt-2 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition"
        >
          {isRegenerating ? "生成中..." : "🔄 重新生成此图"}
        </button>
      </div>
    </div>
  );
};

// 这是主页面组件
const DesignStudio: React.FC = () => {
  const [idea, setIdea] = useState("");
  const [designs, setDesigns] = useState<DesignData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateClick = async () => {
    if (!idea) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateDesigns(idea);
      setDesigns(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardRegenerate = async (newPrompt: string, index: number) => {
    try {
      const newDesign = await regenerateImage(newPrompt);
      // 更新数组中对应的那一张卡片
      setDesigns((prevDesigns) =>
        prevDesigns.map((d, i) => (i === index ? newDesign : d))
      );
    } catch (err: any) {
      alert(`重新生成失败: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          AI 袜子设计师
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          输入一个灵感，见证 AI 的创造力！
        </p>
      </header>

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="例如：一只戴着草帽在沙滩度假的柯基"
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerateClick}
          disabled={isLoading}
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition shadow-md hover:shadow-lg disabled:bg-gray-400"
        >
          {isLoading ? "生成中..." : "✨ 生成设计"}
        </button>
      </div>

      {isLoading && (
        <div className="text-center my-8 text-gray-500">
          AI 正在努力创作中，请稍候... (这可能需要1-2分钟)
        </div>
      )}
      {error && (
        <div className="text-center my-8 text-red-500 bg-red-100 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
        {designs.map((design, index) => (
          <DesignCard
            key={`${index}-${design.url}`} // 使用更稳定的key
            design={design}
            onRegenerate={(prompt) => handleCardRegenerate(prompt, index)}
          />
        ))}
      </div>
    </div>
  );
};

export default DesignStudio;
