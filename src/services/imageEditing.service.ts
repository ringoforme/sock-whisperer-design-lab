
import type { DesignData } from "../types/design";
import { sessionService } from "./sessionService";
import { supabase } from "@/integrations/supabase/client";

/**
 * 新功能：使用 OpenAI Image Edit API 编辑现有图片
 * @param originalImageUrl - 原始图片的URL
 * @param editInstruction - 编辑指令
 * @param sessionId - 可选的会话ID，用于跟踪设计过程
 * @returns - 返回编辑后的设计方案数据
 */
export async function editImage(originalImageUrl: string, editInstruction: string, sessionId?: string): Promise<DesignData> {
  console.log('开始编辑图片，会话ID:', sessionId);
  
  try {
    // 调用新的 Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('edit-sock-design', {
      body: { 
        imageUrl: originalImageUrl,
        editInstruction: editInstruction
      }
    });

    if (error) {
      throw new Error(error.message || "Failed to edit image.");
    }
    
    if (!data.success) {
      throw new Error(data.error || "Failed to edit image.");
    }
    
    // 构造返回的设计数据
    const designData: DesignData = {
      url: `data:image/png;base64,${data.imageData}`,
      prompt_en: data.editInstruction,
      design_name: '编辑后设计'
    };
    
    // 如果有会话ID，记录编辑过程到数据库
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
            '图片编辑指令', // 原始简报
            editInstruction // 编辑指令
          );
          
          // 记录编辑后的图片
          await sessionService.addGeneratedImage(
            sessionId,
            expandedPrompt.id,
            designData.url,
            designData.design_name || '编辑后设计',
            'success' // Use literal status value
          );
        }
        
        console.log('图片编辑过程已记录到数据库');
      } catch (dbError) {
        console.error('记录图片编辑过程到数据库失败:', dbError);
      }
    }
    
    return designData;
  } catch (error) {
    console.error('编辑图片失败:', error);
    
    // 记录失败状态
    if (sessionId) {
      try {
        const sessionHistory = await sessionService.getSessionHistory(sessionId);
        const latestBrief = sessionHistory.briefs[sessionHistory.briefs.length - 1];
        
        if (latestBrief) {
          const expandedPrompt = await sessionService.addExpandedPrompt(
            sessionId,
            latestBrief.id,
            '图片编辑指令',
            `编辑失败：${error instanceof Error ? error.message : '未知错误'}`
          );
          
          await sessionService.addGeneratedImage(
            sessionId,
            expandedPrompt.id,
            'https://placehold.co/1024x1024/f87171/ffffff?text=Edit+Failed',
            '编辑失败',
            'failed', // Use literal status value
            error instanceof Error ? error.message : '未知错误'
          );
        }
      } catch (dbError) {
        console.error('记录编辑失败状态到数据库失败:', dbError);
      }
    }
    
    throw error;
  }
}
