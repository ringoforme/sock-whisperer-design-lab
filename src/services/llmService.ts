
import { createClient } from "@/integrations/supabase/client";

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
  private supabase = createClient();

  constructor() {
    // 使用Supabase客户端，API密钥通过环境变量管理
  }

  async isConfigured(): Promise<boolean> {
    try {
      // 测试 GPT API 连接
      const testResponse = await this.supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: '测试连接',
          systemPrompt: '简短回复：连接正常'
        }
      });

      console.log('GPT API 连接测试结果:', testResponse);
      return !testResponse.error && testResponse.data?.success;
    } catch (error) {
      console.error('GPT API 连接测试失败:', error);
      return false;
    }
  }

  // 发送消息到LLM
  async sendMessage(userMessage: string): Promise<LLMResponse> {
    try {
      console.log('调用GPT API，消息:', userMessage);
      
      // 调用Supabase Edge Function进行GPT对话
      const { data, error } = await this.supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: userMessage,
          systemPrompt: SYSTEM_PROMPT
        }
      });

      if (error) {
        console.error('GPT API调用失败:', error);
        throw new Error(error.message);
      }

      if (data && data.success && data.message) {
        console.log('GPT API响应成功:', data.message);
        return {
          message: data.message,
          success: true
        };
      } else {
        console.error('GPT API返回数据格式错误:', data);
        throw new Error('GPT API返回数据格式错误');
      }

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
