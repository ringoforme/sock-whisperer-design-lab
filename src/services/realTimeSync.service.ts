
import { supabase } from "@/integrations/supabase/client";

/**
 * 实时同步服务 - 监听数据库变化并更新本地缓存
 * 当后台数据库写入完成时，实时更新前端状态
 */
export class RealTimeSyncService {
  private static instance: RealTimeSyncService;
  private channels: Map<string, any> = new Map();

  static getInstance(): RealTimeSyncService {
    if (!RealTimeSyncService.instance) {
      RealTimeSyncService.instance = new RealTimeSyncService();
    }
    return RealTimeSyncService.instance;
  }

  /**
   * 监听指定会话的数据库变化
   */
  subscribeToSession(sessionId: string, onUpdate: (payload: any) => void): () => void {
    console.log('开始监听会话数据变化:', sessionId);
    
    const channelName = `session-${sessionId}`;
    
    // 如果已经有监听器，先清理
    this.unsubscribeFromSession(sessionId);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'generated_images',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('检测到新图片生成:', payload);
          onUpdate({ type: 'image_generated', data: payload.new });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'expanded_prompts',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('检测到新扩展提示词:', payload);
          onUpdate({ type: 'prompt_expanded', data: payload.new });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'design_briefs',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('检测到设计简报更新:', payload);
          onUpdate({ type: 'brief_updated', data: payload.new });
        }
      )
      .subscribe();

    this.channels.set(sessionId, channel);

    // 返回取消订阅函数
    return () => this.unsubscribeFromSession(sessionId);
  }

  /**
   * 取消监听指定会话
   */
  unsubscribeFromSession(sessionId: string): void {
    const channel = this.channels.get(sessionId);
    if (channel) {
      console.log('取消监听会话:', sessionId);
      supabase.removeChannel(channel);
      this.channels.delete(sessionId);
    }
  }

  /**
   * 清理所有监听器
   */
  cleanup(): void {
    console.log('清理所有实时监听器');
    this.channels.forEach((channel, sessionId) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

export const realTimeSyncService = RealTimeSyncService.getInstance();
