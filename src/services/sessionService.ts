import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Use Supabase generated types directly
export type DesignSession = Database['public']['Tables']['design_sessions']['Row'];
export type ConversationMessage = Database['public']['Tables']['conversation_messages']['Row'];
export type DesignBrief = Database['public']['Tables']['design_briefs']['Row'];
export type ExpandedPrompt = Database['public']['Tables']['expanded_prompts']['Row'];
export type GeneratedImage = Database['public']['Tables']['generated_images']['Row'];

// Insert types for creating new records
export type DesignSessionInsert = Database['public']['Tables']['design_sessions']['Insert'];
export type ConversationMessageInsert = Database['public']['Tables']['conversation_messages']['Insert'];
export type DesignBriefInsert = Database['public']['Tables']['design_briefs']['Insert'];
export type ExpandedPromptInsert = Database['public']['Tables']['expanded_prompts']['Insert'];
export type GeneratedImageInsert = Database['public']['Tables']['generated_images']['Insert'];

// 测试用户ID - 用于没有登录用户时的测试
const TEST_USER_ID = '00000000-0000-0000-0000-000000000000';

export class SessionService {
  // 创建新的设计会话
  async createSession(initialIdea: string): Promise<DesignSession> {
    const { data: { user } } = await supabase.auth.getUser();
    
    // 确保用户已登录
    if (!user) {
      throw new Error('用户未登录，无法创建会话');
    }

    console.log('创建会话，用户ID:', user.id);

    const { data, error } = await supabase
      .from('design_sessions')
      .insert({
        user_id: user.id,
        initial_idea: initialIdea,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('创建会话失败:', error);
      throw error;
    }
    console.log('会话创建成功:', data);
    return data;
  }

  // 获取会话详情
  async getSession(sessionId: string): Promise<DesignSession | null> {
    const { data, error } = await supabase
      .from('design_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // 更新会话状态
  async updateSessionStatus(sessionId: string, status: 'active' | 'completed' | 'abandoned'): Promise<void> {
    const { error } = await supabase
      .from('design_sessions')
      .update({ status })
      .eq('id', sessionId);

    if (error) throw error;
  }

  // 添加对话消息
  async addMessage(sessionId: string, role: 'user' | 'assistant', content: string, metadata?: any): Promise<ConversationMessage> {
    const { data, error } = await supabase
      .from('conversation_messages')
      .insert({
        session_id: sessionId,
        role,
        content,
        metadata
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 获取会话的所有消息
  async getSessionMessages(sessionId: string): Promise<ConversationMessage[]> {
    const { data, error } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // 创建或更新设计简报
  async upsertDesignBrief(sessionId: string, brief: Partial<Omit<DesignBrief, 'id' | 'session_id' | 'created_at' | 'updated_at'>>): Promise<DesignBrief> {
    // 先查找是否已存在
    const { data: existing } = await supabase
      .from('design_briefs')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (existing) {
      // 更新现有简报
      const { data, error } = await supabase
        .from('design_briefs')
        .update(brief)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // 创建新简报
      const { data, error } = await supabase
        .from('design_briefs')
        .insert({
          session_id: sessionId,
          ...brief
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  // 记录扩展提示词
  async addExpandedPrompt(sessionId: string, briefId: string, originalBrief: string, expandedPrompt: string): Promise<ExpandedPrompt> {
    const { data, error } = await supabase
      .from('expanded_prompts')
      .insert({
        session_id: sessionId,
        brief_id: briefId,
        original_brief: originalBrief,
        expanded_prompt: expandedPrompt
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 记录生成的图片
  async addGeneratedImage(sessionId: string, promptId: string, imageUrl: string, designName: string, status: 'success' | 'failed' | 'pending' = 'success', errorMessage?: string): Promise<GeneratedImage> {
    const { data, error } = await supabase
      .from('generated_images')
      .insert({
        session_id: sessionId,
        prompt_id: promptId,
        image_url: imageUrl,
        design_name: designName,
        generation_status: status,
        error_message: errorMessage
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 获取会话的完整历史记录
  async getSessionHistory(sessionId: string) {
    const [session, messages, briefs, prompts, images] = await Promise.all([
      this.getSession(sessionId),
      this.getSessionMessages(sessionId),
      this.getDesignBriefs(sessionId),
      this.getExpandedPrompts(sessionId),
      this.getGeneratedImages(sessionId)
    ]);

    return {
      session,
      messages,
      briefs,
      prompts,
      images
    };
  }

  private async getDesignBriefs(sessionId: string): Promise<DesignBrief[]> {
    const { data, error } = await supabase
      .from('design_briefs')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  private async getExpandedPrompts(sessionId: string): Promise<ExpandedPrompt[]> {
    const { data, error } = await supabase
      .from('expanded_prompts')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  private async getGeneratedImages(sessionId: string): Promise<GeneratedImage[]> {
    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // 获取用户的所有会话
  async getUserSessions(): Promise<DesignSession[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    const { data, error } = await supabase
      .from('design_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export const sessionService = new SessionService();
