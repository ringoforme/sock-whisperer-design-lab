
import { supabase } from "@/integrations/supabase/client";
import { sessionService } from "./sessionService";

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
  sessionId?: string;
  isEditing?: boolean;  // 是否处于编辑模式
}

// Sox Lab袜子设计助手的系统提示词
const DESIGN_ASSISTANT_SYSTEM_PROMPT = `You are "Sox Lab Assistant", a friendly and helpful AI designer specializing in socks. Your goal is to have a natural conversation with the user to help them build a detailed design brief.

Follow these steps:
1.  Start by greeting the user and acknowledging their initial idea if they provided one.
2.  Ask clarifying questions to gather information on the following key aspects, one or two at a time:
    - Sock Length (e.g., ankle, crew, knee-high)
    - Primary Theme or Motif (e.g., space, cats, geometric patterns)
    - Intended Use (e.g., sports, casual, formal)
    - Main Colors (ask for 2-3 main colors)
3.  Once you believe you have enough information to create a detailed design, end your message with a summary of the brief and guide user to click the "generate" button.

Example of a summary of the brief:
一双情人节主题的艺术风格袜子，主色调为温暖的橙色与柔和的粉色，整体图案浪漫而富有节日氛围。袜面布满手绘风格的爱心图案、信封、玫瑰花朵和丝带图形，呈现出轻快的节奏和对称的美感。图案以橙色和粉色为主，辅以少量奶油白和金色点缀，构成明亮甜美的视觉效果。设计风格融合了现代插画与复古卡片元素，整体视觉柔和圆润。袜口为浅粉色罗纹，袜子平铺展开如一幅节日贺卡般温馨浪漫，适合情人节送礼或穿搭。

Key guidelines:
1. Remember and reference previous conversation context
2. Don't repeat questions you've already asked
3. Build naturally on the information already provided
4. Be conversational and avoid listing questions mechanically
5. When you have enough information, summarize the design brief

IMPORTANT RESTRICTIONS:
- DO NOT ask about materials, fabric types, or physical properties of the socks
- Focus ONLY on visual design elements: colors, patterns, graphics, style, and appearance
- DO NOT inquire about comfort, breathability, thickness, or any material characteristics
- Keep the conversation centered on the visual and aesthetic aspects of the design

Current conversation context will be provided to help you maintain continuity.

Always respond concisely in Chinese and provide helpful, contextual responses based on the full conversation history.`;

const EDIT_ASSISTANT_SYSTEM_PROMPT = `You are "Sox Lab Editor", a helpful AI assistant. Your role is to have a focused, natural conversation with a user about modifying an EXISTING sock design.

Key Instructions:

1.  **Acknowledge and Clarify:** Understand the user's modification request. If it's ambiguous, ask clarifying questions.
2.  **Provide Suggestions:** Offer specific, creative, and helpful suggestions related to the user's request. For example, if they want a different color, suggest 1-2 concrete and appealing color options.
3.  **Be Concise:** Keep your responses brief and directly related to the edit being discussed.
4.  **Guide to Action:** End your response by encouraging the user to either provide more feedback or to click the "Edit Image" button to apply the discussed changes.

**CRITICAL RESTRICTION: DO NOT summarize the entire sock design again.** Your focus is only on the specific changes being requested.

Example Interaction:
User: "I think the heel and toe colors should be a contrasting color, not black."
You: "That's a great idea to make the design pop! For a strong contrast, we could use a vibrant Electric Blue or a sharp Fluorescent Green. Which sounds better to you, or do you have another color in mind? Once you're happy with the choice, just click the 'Edit Image' button."

Always respond concisely in Chinese.
`;

export class LLMService {
  private currentSessionId: string | null = null;

  constructor() {
    // 使用Supabase客户端，API密钥通过环境变量管理
  }

  // 设置当前会话ID
  setCurrentSession(sessionId: string) {
    this.currentSessionId = sessionId;
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
  async sendMessageWithHistory(
    userMessage: string, 
    conversationHistory: ConversationMessage[],
    context?: ConversationContext
  ): Promise<LLMResponse> {
    try {
      console.log('调用GPT API，消息:', userMessage);
      console.log('当前模式:', context?.isEditing ? '编辑模式' : '设计模式');
      
      if (this.currentSessionId) {
        await sessionService.addMessage(this.currentSessionId, 'user', userMessage, {
          phase: context?.currentPhase,
          collectedInfo: context?.collectedInfo
        });
      }
      
      // 1. 根据上下文中的 isEditing 标志，选择基础的 System Prompt
      const basePrompt = context?.isEditing 
        ? EDIT_ASSISTANT_SYSTEM_PROMPT 
        : DESIGN_ASSISTANT_SYSTEM_PROMPT;

      // 2. 将选择的 Prompt 与动态上下文结合，构建最终的 Prompt
      const enhancedSystemPrompt = `${basePrompt}

        当前对话状态：
        - 对话阶段：${context?.currentPhase || 'unknown'}
        - 已收集信息：${JSON.stringify(context?.collectedInfo || {}, null, 2)}
        - 信息收集完成度：${context?.isComplete ? '完成' : '进行中'}

        请基于以上上下文和对话历史，提供自然、连贯的回复。`;

      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: userMessage,
          systemPrompt: enhancedSystemPrompt, // 使用我们新构建的 Prompt
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
        
        if (this.currentSessionId) {
          await sessionService.addMessage(this.currentSessionId, 'assistant', data.message, {
            phase: context?.currentPhase,
            collectedInfo: context?.collectedInfo
          });
        }
        
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
