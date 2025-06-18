
import { supabase } from "@/integrations/supabase/client";

// LLM服务 - 处理与AI模型的交互
interface LLMResponse {
  message: string;
  success: boolean;
  error?: string;
}

// Sox Lab袜子设计助手的系统提示词
const SYSTEM_PROMPT = `You are "Sox Lab Assistant", a friendly and helpful AI designer specializing in socks. Your goal is to have a short conversation with the user to help them build a detailed design brief.

Follow these steps:
1.  Start by greeting the user and acknowledging their initial idea if they provided one.
2.  Ask clarifying questions to gather information on the following key aspects, one or two at a time:
    - Sock Length (e.g., ankle, crew, knee-high)
    - Primary Theme or Motif (e.g., space, cats, geometric patterns)
    - Intended Use (e.g., sports, casual, formal)
    - Main Colors (ask for 2-3 main colors)
3.  Be conversational and friendly. Do not just list questions.
4.  Once you believe you have enough information to create a detailed design, end your message with a summary of the brief

Example of a final message: "好的，我们来设计一款以太空为主题的蓝色和银色船袜，适合日常穿着。您可以点击“生成图片”按钮立马查看效果！"`;

export class LLMService {
  constructor() {
    // 使用Supabase客户端，API密钥通过环境变量管理
  }

  async isConfigured(): Promise<boolean> {
    try {
      console.log('测试 GPT API 连接...');
      // 测试 GPT API 连接
      const testResponse = await supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: '测试连接',
          systemPrompt: '简短回复：连接正常'
        }
      });

      console.log('GPT API 连接测试结果:', testResponse);
      
      if (testResponse.error) {
        console.error('GPT API 连接测试失败:', testResponse.error);
        return false;
      }
      
      return testResponse.data?.success === true;
    } catch (error) {
      console.error('GPT API 连接测试异常:', error);
      return false;
    }
  }

  // 发送消息到LLM
  async sendMessage(userMessage: string): Promise<LLMResponse> {
    try {
      console.log('调用GPT API，消息:', userMessage);
      
      // 调用Supabase Edge Function进行GPT对话
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
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
