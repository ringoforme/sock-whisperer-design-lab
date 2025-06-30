
import type { DesignData } from "../types/design";
import { supabase } from "@/integrations/supabase/client";

interface SessionContext {
  sessionId?: string;
  messages: Array<{ id: number; text: string; isUser: boolean }>;
  conversationState: any;
  collectedInfo: string[];
  requirements: any;
}

/**
 * 主流程：发送完整会话上下文到后端，获取1个设计方案
 * 数据库写入已移到 Edge Function 中，前端只需处理响应数据
 * @param sessionContext - 完整的会话上下文
 * @param messageId - 关联的消息ID，用于正确关联图片和消息
 * @returns - 返回一个设计方案
 */
export async function generateDesigns(sessionContext: SessionContext, messageId?: string): Promise<DesignData> {
  console.log('开始生成设计，会话上下文:', sessionContext);
  console.log('关联消息ID:', messageId);
  
  if (!sessionContext.sessionId) {
    throw new Error('缺少会话ID，无法记录设计过程');
  }
  
  try {
    // 调用 Supabase Edge Function，传递完整的会话上下文和消息ID
    console.log('调用 generate-sock-design Edge Function...');
    const { data, error } = await supabase.functions.invoke('generate-sock-design', {
      body: { 
        sessionContext,
        messageId // 传递消息ID给Edge Function
      }
    });

    if (error) {
      console.error('Edge Function 调用失败:', error);
      throw new Error(error.message || "Failed to generate designs.");
    }
    
    if (!data.success) {
      console.error('Edge Function 返回失败:', data);
      throw new Error(data.error || "Failed to generate designs.");
    }
    
    console.log('Edge Function 调用成功，返回数据:', data);
    
    // 构造返回的设计数据
    const designData: DesignData = {
      url: data.imageUrl,
      prompt_en: data.expandedPrompt,
      design_name: data.designName || '袜子设计'
    };
    
    console.log('设计生成成功，数据库写入在后台进行，消息ID已关联');
    
    return designData;
  } catch (error) {
    console.error('生成设计失败，详细错误:', error);
    console.error('错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
    
    throw error;
  }
}
