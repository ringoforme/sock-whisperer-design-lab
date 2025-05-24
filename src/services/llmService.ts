
// LLM服务 - 处理与AI模型的交互
// 注释：这里需要连接到OpenAI GPT或Google Gemini API
// 推荐方案：
// 1. 使用Supabase Edge Functions来安全处理API密钥
// 2. 或者让用户在前端输入API密钥存储在localStorage

interface LLMResponse {
  message: string;
  success: boolean;
  error?: string;
}

// Sox Lab袜子设计助手的系统提示词
const SYSTEM_PROMPT = `你是Sox Lab袜子设计工作室的专业AI助手。你的主要功能包括：

1. 袜子设计创作：根据用户描述生成创意袜子设计
2. 设计编辑：帮助用户修改和完善现有设计
3. 流行趋势分析：提供当前流行的颜色、图案和主题建议
4. 专业建议：给出关于袜子类型、材质、场合的专业意见

设计风格包括：
- 袜子类型：船袜(no-show)、中筒袜(crew)、长筒袜(knee-high)
- 流行元素：几何图案、动物图案、节日主题、运动风格、商务风格
- 颜色搭配：单色、渐变、对比色、季节性配色

请始终保持专业、友好和创意的回答风格，帮助用户实现他们的袜子设计梦想。`;

export class LLMService {
  private apiKey: string | null = null;

  constructor() {
    // 从localStorage获取API密钥（临时方案）
    this.apiKey = localStorage.getItem('llm_api_key');
  }

  // 设置API密钥
  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('llm_api_key', key);
  }

  // 检查是否已配置API密钥
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // 发送消息到LLM
  async sendMessage(userMessage: string): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      return {
        message: "请先配置您的API密钥以使用AI功能。",
        success: false,
        error: "未配置API密钥"
      };
    }

    try {
      // 注释：这里应该调用实际的LLM API
      // 示例：OpenAI GPT API调用
      /*
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
      });
      */

      // 临时模拟AI回复（实际使用时删除此部分）
      const responses = [
        `我理解您想要${userMessage.includes('紫色') ? '紫色' : '彩色'}的袜子设计。我建议创建一个${userMessage.includes('船袜') ? '船袜' : '中筒袜'}款式，配合${userMessage.includes('圆点') ? '圆点' : '条纹'}图案。这种设计既时尚又实用。`,
        `基于您的描述"${userMessage}"，我推荐使用渐变色彩搭配几何图案，这样的设计在当前非常流行。`,
        `您的创意很棒！我已经为您生成了一些设计概念。建议选择透气材质，适合日常穿着。`,
        `根据您的需求，我建议采用${Math.random() > 0.5 ? '运动' : '休闲'}风格的设计，这样既符合潮流又很实用。`
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      return {
        message: randomResponse,
        success: true
      };

    } catch (error) {
      console.error('LLM API调用失败:', error);
      return {
        message: "抱歉，AI服务暂时不可用，请稍后再试。",
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  // 生成设计建议
  async generateDesignSuggestions(prompt: string): Promise<string[]> {
    // 注释：这里应该根据prompt生成具体的设计建议
    // 可以调用图像生成API如DALL-E、Midjourney等
    
    // 临时模拟设计建议
    const suggestions = [
      "渐变色彩搭配",
      "几何图案设计", 
      "季节性主题",
      "运动风格",
      "商务简约风",
      "卡通图案"
    ];
    
    return suggestions.slice(0, 4);
  }
}

export const llmService = new LLMService();
