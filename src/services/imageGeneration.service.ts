
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
 * @returns - 返回一个设计方案
 */
export async function generateDesigns(sessionContext: SessionContext): Promise<DesignData> {
  console.log('开始生成设计，会话上下文:', sessionContext);
  
  if (!sessionContext.sessionId) {
    throw new Error('缺少会话ID，无法记录设计过程');
  }
  
  try {
    // 调用 Supabase Edge Function，传递完整的会话上下文
    console.log('调用 generate-sock-design Edge Function...');
    const { data, error } = await supabase.functions.invoke('generate-sock-design', {
      body: { sessionContext }
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
    
    console.log('设计生成成功，数据库写入在后台进行，无需等待');
    
    return designData;
  } catch (error) {
    console.error('生成设计失败，详细错误:', error);
    console.error('错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
    
    throw error;
  }
}
