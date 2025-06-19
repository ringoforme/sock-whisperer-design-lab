
// 导入我们刚刚定义的类型
import type { DesignData } from "../types/design";
import { sessionService } from "./sessionService";
import { supabase } from "@/integrations/supabase/client";

/**
 * 主流程：发送初始想法到后端，获取1个设计方案
 * @param idea - 用户输入的灵感字符串
 * @param sessionId - 可选的会话ID，用于跟踪设计过程
 * @returns - 返回一个设计方案
 */
export async function generateDesigns(idea: string, sessionId?: string): Promise<DesignData> {
  console.log('开始生成设计，会话ID:', sessionId);
  
  try {
    // 调用 Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate-sock-design', {
      body: { requirements: idea }
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
      design_name: data.designName || '未命名设计',
      style: 'ai-generated'
    };
    
    // 如果有会话ID，记录设计过程到数据库
    if (sessionId && designData) {
      try {
        // 1. 创建或更新设计简报
        const brief = await sessionService.upsertDesignBrief(sessionId, {
          completion_status: 'completed',
          additional_notes: `基于用户想法生成：${idea}`
        });
        
        // 2. 记录扩展提示词（从后端返回的prompt）
        if (designData.prompt_en) {
          const expandedPrompt = await sessionService.addExpandedPrompt(
            sessionId,
            brief.id,
            idea, // 原始简报
            designData.prompt_en // 扩展后的提示词
          );
          
          // 3. 记录生成的图片
          await sessionService.addGeneratedImage(
            sessionId,
            expandedPrompt.id,
            designData.url,
            designData.design_name || '未命名设计',
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
    if (sessionId) {
      try {
        const brief = await sessionService.upsertDesignBrief(sessionId, {
          completion_status: 'completed',
          additional_notes: `生成失败：${error instanceof Error ? error.message : '未知错误'}`
        });
        
        // 记录失败的扩展提示词和图片
        const expandedPrompt = await sessionService.addExpandedPrompt(
          sessionId,
          brief.id,
          idea,
          `生成失败：${error instanceof Error ? error.message : '未知错误'}`
        );
        
        await sessionService.addGeneratedImage(
          sessionId,
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
      design_name: data.designName || '修改后设计',
      style: 'ai-generated'
    };
    
    // 如果有会话ID，记录重新生成过程
    if (sessionId && designData) {
      try {
        // 获取当前会话的最新简报
        const sessionHistory = await sessionService.getSessionHistory(sessionId);
        const latestBrief = sessionHistory.briefs[sessionHistory.briefs.length - 1];
        
        if (latestBrief) {
          // 记录新的扩展提示词
          const expandedPrompt = await sessionService.addExpandedPrompt(
            sessionId,
            latestBrief.id,
            '用户修改指令', // 原始简报
            prompt // 修改后的提示词
          );
          
          // 记录重新生成的图片
          await sessionService.addGeneratedImage(
            sessionId,
            expandedPrompt.id,
            designData.url,
            designData.design_name || '修改后设计',
            designData.url ? 'success' : 'failed'
          );
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
        const sessionHistory = await sessionService.getSessionHistory(sessionId);
        const latestBrief = sessionHistory.briefs[sessionHistory.briefs.length - 1];
        
        if (latestBrief) {
          const expandedPrompt = await sessionService.addExpandedPrompt(
            sessionId,
            latestBrief.id,
            '用户修改指令',
            `重新生成失败：${error instanceof Error ? error.message : '未知错误'}`
          );
          
          await sessionService.addGeneratedImage(
            sessionId,
            expandedPrompt.id,
            'https://placehold.co/1024x1024/f87171/ffffff?text=Regeneration+Failed',
            '重新生成失败',
            'failed',
            error instanceof Error ? error.message : '未知错误'
          );
        }
      } catch (dbError) {
        console.error('记录重新生成失败状态失败:', dbError);
      }
    }
    
    throw error;
  }
}
