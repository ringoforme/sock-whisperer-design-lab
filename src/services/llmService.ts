
// LLM服务 - 处理与AI模型的交互
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

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('llm_api_key', key);
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // 发送消息到LLM
  async sendMessage(userMessage: string): Promise<LLMResponse> {
    // 临时使用ConversationManager的结构化回复
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      // 这里会被ConversationManager接管，提供更智能的结构化回复
      return {
        message: "这是一个占位回复，实际会由ConversationManager处理。",
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
