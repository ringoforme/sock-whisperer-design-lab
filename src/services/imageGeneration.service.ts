
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
    
    // 记录设计过程到数据库
    try {
      console.log('开始记录设计过程到数据库，会话ID:', sessionContext.sessionId);
      
      // 1. 创建或更新设计简报
      console.log('创建设计简报...');
      const brief = await sessionService.upsertDesignBrief(sessionContext.sessionId, {
        completion_status: 'complete',
        additional_notes: `基于完整会话上下文生成，收集的信息: ${JSON.stringify(sessionContext.collectedInfo)}`
      });
      console.log('设计简报创建成功:', brief);
      
      // 2. 记录扩展提示词（从后端返回的expandedPrompt）
      if (designData.prompt_en) {
        console.log('记录扩展提示词...');
        const expandedPrompt = await sessionService.addExpandedPrompt(
          sessionContext.sessionId,
          brief.id,
          JSON.stringify(sessionContext.collectedInfo), // 原始简报
          designData.prompt_en // 扩展后的提示词
        );
        console.log('扩展提示词记录成功:', expandedPrompt);
        
        // 3. 记录生成的图片
        console.log('记录生成的图片...');
        const imageRecord = await sessionService.addGeneratedImage(
          sessionContext.sessionId,
          expandedPrompt.id,
          designData.url,
          designData.design_name || '袜子设计',
          undefined, // messageId
          'success' // status as literal
        );
        console.log('生成图片记录成功:', imageRecord);
      } else {
        console.warn('没有扩展提示词，跳过扩展提示词和图片记录');
      }
      
      console.log('设计过程已成功记录到数据库');
    } catch (dbError) {
      console.error('记录设计过程到数据库失败，详细错误:', dbError);
      console.error('错误堆栈:', dbError instanceof Error ? dbError.stack : '无堆栈信息');
      
      // 尝试记录失败状态
      try {
        console.log('尝试记录失败状态...');
        const failedBrief = await sessionService.upsertDesignBrief(sessionContext.sessionId, {
          completion_status: 'complete',
          additional_notes: `生成成功但数据库记录失败：${dbError instanceof Error ? dbError.message : '未知错误'}`
        });
        console.log('失败状态记录成功:', failedBrief);
      } catch (failedRecordError) {
        console.error('连记录失败状态都失败了:', failedRecordError);
      }
      
      // 不影响主流程，继续返回设计结果
      console.log('继续返回设计结果，尽管数据库记录失败');
    }
    
    return designData;
  } catch (error) {
    console.error('生成设计失败，详细错误:', error);
    console.error('错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
    
    // 如果有会话ID，记录失败状态
    if (sessionContext.sessionId) {
      try {
        console.log('记录生成失败状态到数据库...');
        const brief = await sessionService.upsertDesignBrief(sessionContext.sessionId, {
          completion_status: 'complete',
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
          undefined, // messageId
          'failed', // status as literal
          error instanceof Error ? error.message : '未知错误'
        );
        console.log('生成失败状态记录成功');
      } catch (dbError) {
        console.error('记录失败状态到数据库也失败了:', dbError);
      }
    }
    
    throw error;
  }
}
