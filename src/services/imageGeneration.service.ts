
import type { DesignData } from "../types/design";
import { sessionService } from "./sessionService";
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
 * @param sessionContext - 完整的会话上下文
 * @returns - 返回一个设计方案
 */
export async function generateDesigns(sessionContext: SessionContext): Promise<DesignData> {
  console.log('开始生成设计，会话上下文:', sessionContext);
  
  try {
    // 调用 Supabase Edge Function，传递完整的会话上下文
    const { data, error } = await supabase.functions.invoke('generate-sock-design', {
      body: { sessionContext }
    });

    if (error) {
      throw new Error(error.message || "Failed to generate designs.");
    }
    
    if (!data.success) {
      throw new Error(data.error || "Failed to generate designs.");
    }
    
    // 构造返回的设计数据
    const designData: DesignData = {
      url: data.imageUrl,
      prompt_en: data.expandedPrompt,
      design_name: data.designName || '袜子设计'
    };
    
    // 如果有会话ID，记录设计过程到数据库
    if (sessionContext.sessionId && designData) {
      try {
        // 1. 创建或更新设计简报
        const brief = await sessionService.upsertDesignBrief(sessionContext.sessionId, {
          completion_status: 'completed',
          additional_notes: `基于完整会话上下文生成`
        });
        
        // 2. 记录扩展提示词（从后端返回的expandedPrompt）
        if (designData.prompt_en) {
          const expandedPrompt = await sessionService.addExpandedPrompt(
            sessionContext.sessionId,
            brief.id,
            JSON.stringify(sessionContext.collectedInfo), // 原始简报
            designData.prompt_en // 扩展后的提示词
          );
          
          // 3. 记录生成的图片
          await sessionService.addGeneratedImage(
            sessionContext.sessionId,
            expandedPrompt.id,
            designData.url,
            designData.design_name || '袜子设计',
            designData.url ? 'success' : 'failed'
          );
        }
        
        console.log('设计过程已记录到数据库');
      } catch (dbError) {
        console.error('记录设计过程到数据库失败:', dbError);
        // 不影响主流程，继续返回设计结果
      }
    }
    
    return designData;
  } catch (error) {
    console.error('生成设计失败:', error);
    
    // 如果有会话ID，记录失败状态
    if (sessionContext.sessionId) {
      try {
        const brief = await sessionService.upsertDesignBrief(sessionContext.sessionId, {
          completion_status: 'completed',
          additional_notes: `生成失败：${error instanceof Error ? error.message : '未知错误'}`
        });
        
        // 记录失败的扩展提示词和图片
        const expandedPrompt = await sessionService.addExpandedPrompt(
          sessionContext.sessionId,
          brief.id,
          JSON.stringify(sessionContext.collectedInfo),
          `生成失败：${error instanceof Error ? error.message : '未知错误'}`
        );
        
        await sessionService.addGeneratedImage(
          sessionContext.sessionId,
          expandedPrompt.id,
          'https://placehold.co/1024x1024/f87171/ffffff?text=Generation+Failed',
          '生成失败',
          'failed',
          error instanceof Error ? error.message : '未知错误'
        );
      } catch (dbError) {
        console.error('记录失败状态到数据库失败:', dbError);
      }
    }
    
    throw error;
  }
}
