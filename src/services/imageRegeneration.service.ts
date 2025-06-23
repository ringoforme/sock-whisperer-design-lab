
import type { DesignData } from "../types/design";
import { sessionService } from "./sessionService";
import { supabase } from "@/integrations/supabase/client";

/**
 * 次流程：发送修改后的单个Prompt，重新生成一张图片
 * @param prompt - 修改后的英文Prompt
 * @param sessionId - 可选的会话ID，用于跟踪设计过程
 * @returns - 返回单个新的设计方案数据
 */
export async function regenerateImage(prompt: string, sessionId?: string): Promise<DesignData> {
  console.log('开始重新生成图片，会话ID:', sessionId);
  
  try {
    // 调用 Supabase Edge Function 
    const { data, error } = await supabase.functions.invoke('generate-sock-design', {
      body: { requirements: prompt }
    });

    if (error) {
      throw new Error(error.message || "Failed to regenerate image.");
    }
    
    if (!data.success) {
      throw new Error(data.error || "Failed to regenerate image.");
    }
    
    // 构造返回的设计数据
    const designData: DesignData = {
      url: data.imageUrl,
      prompt_en: data.expandedPrompt,
      design_name: data.designName || '修改后设计'
    };
    
    // 如果有会话ID，记录重新生成过程
    if (sessionId && designData) {
      try {
        // 获取当前会话的最新需求
        const sessionDetail = await sessionService.getSessionComplete(sessionId);
        const latestRequirement = sessionDetail.requirements[sessionDetail.requirements.length - 1];
        
        if (latestRequirement) {
          // 记录重新生成的图片
          await sessionService.createDesignWork(sessionId, {
            name: designData.design_name || '修改后设计',
            prompt_used: prompt,
            image_url: designData.url,
            requirements_id: latestRequirement.id,
            status: designData.url ? 'generated' : 'failed'
          });
        }
        
        console.log('重新生成过程已记录到数据库');
      } catch (dbError) {
        console.error('记录重新生成过程到数据库失败:', dbError);
      }
    }
    
    return designData;
  } catch (error) {
    console.error('重新生成图片失败:', error);
    
    // 记录失败状态
    if (sessionId) {
      try {
        const sessionDetail = await sessionService.getSessionComplete(sessionId);
        const latestRequirement = sessionDetail.requirements[sessionDetail.requirements.length - 1];
        
        if (latestRequirement) {
          await sessionService.createDesignWork(sessionId, {
            name: '重新生成失败',
            prompt_used: `重新生成失败：${error instanceof Error ? error.message : '未知错误'}`,
            image_url: 'https://placehold.co/1024x1024/f87171/ffffff?text=Regeneration+Failed',
            requirements_id: latestRequirement.id,
            status: 'failed',
            error_message: error instanceof Error ? error.message : '未知错误'
          });
        }
      } catch (dbError) {
        console.error('记录重新生成失败状态失败:', dbError);
      }
    }
    
    throw error;
  }
}
