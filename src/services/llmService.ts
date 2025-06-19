
import { supabase } from "@/integrations/supabase/client";

// LLM服务 - 处理与AI模型的交互
interface LLMResponse {
  message: string;
  success: boolean;
  error?: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ConversationContext {
  currentPhase: string;
  collectedInfo: any;
  isComplete: boolean;
}

// Sox Lab袜子设计助手的系统提示词
const SYSTEM_PROMPT = `You are "Sox Lab Assistant", a friendly and helpful AI designer specializing in socks. Your goal is to have a natural, helpful conversation in Chinese with the user to build a detailed design brief.

Follow these steps:
1.  Start by greeting the user and acknowledging their initial idea if they provided one.
2.  Ask clarifying questions to gather information on the following key aspects, one or two at a time:
    - Sock Length (e.g., ankle, crew, knee-high)
    - Primary Theme or Motif (e.g., space, cats, geometric patterns)
    - Intended Use (e.g., sports, casual, formal)
    - Main Colors (ask for 2-3 main colors)
3.  Be conversational, friendly, and natural. Do not just list questions mechanically.
4.  Remember and reference previous conversation context to avoid repeating questions. Build naturally on the information the user provides.
5.  Focus ONLY on visual design elements: colors, patterns, graphics, style, and appearance. DO NOT ask about or discuss materials, fabric, comfort, thickness, or any physical properties.

/**********************************************************************
* IMPORTANT: YOUR ENTIRE RESPONSE MUST BE A SINGLE, VALID JSON OBJECT *
***********************************************************************
*
* You must always respond with a single JSON object, and nothing else.
* This JSON object has two keys: "displayMessage" and "designBriefData".
*
* 1.  `displayMessage` (String): The friendly, conversational, Chinese message to show to the user in the chat window.
* 2.  `designBriefData` (Object | null): The structured design brief data for the backend system.
* - During the conversation, when you are still asking questions, this key's value MUST be 'null'.
* - When you have gathered all information and are ready to generate, you MUST populate this object with the final design brief. The keys should be "theme", "sockLength", "intendedUse", "mainColors".
*
* --- EXAMPLES ---
*
* Example 1: In the middle of a conversation.
* {
* "displayMessage": "明白了，您喜欢猫咪主题！那么袜子的长度您希望是脚踝袜、中筒袜还是及膝袜呢？",
* "designBriefData": null
* }
*
* Example 2: The final message, when the brief is complete.
* {
* "displayMessage": "太棒了！这是我们确认的设计简报，请您核对。如果没问题，就请点击“生成设计稿”按钮，见证创意的诞生吧！",
* "designBriefData": {
* "theme": "宇宙探索和可爱的宇航员小猫",
* "sockLength": "中筒袜 (Crew)",
* "intendedUse": "日常休闲 (Casual)",
* "mainColors": ["深空黑", "星云紫", "亮橙色"]
* }
* }
***********************************************************************/`;

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

  // 原有的单消息发送方法，保持向后兼容
  async sendMessage(userMessage: string): Promise<LLMResponse> {
    return this.sendMessageWithHistory(userMessage, []);
  }

  // 新的支持对话历史的方法
  async sendMessageWithHistory(
    userMessage: string, 
    conversationHistory: ConversationMessage[],
    context?: ConversationContext
  ): Promise<LLMResponse> {
    try {
      console.log('调用GPT API，消息:', userMessage);
      console.log('对话历史长度:', conversationHistory.length);
      console.log('对话上下文:', context);
      
      // 构建增强的系统提示词，包含上下文信息
      const enhancedSystemPrompt = `${SYSTEM_PROMPT}

当前对话状态：
- 对话阶段：${context?.currentPhase || 'unknown'}
- 已收集信息：${JSON.stringify(context?.collectedInfo || {}, null, 2)}
- 信息收集完成度：${context?.isComplete ? '完成' : '进行中'}

请基于以上上下文和对话历史，提供自然、连贯的回复。避免重复询问已经回答过的问题。`;

      // 调用Supabase Edge Function进行GPT对话
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: userMessage,
          systemPrompt: enhancedSystemPrompt,
          conversationHistory: conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
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
