
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// 使用新的数据库类型
export type DesignSession = Database['public']['Tables']['design_sessions']['Row'];
export type ConversationMessage = Database['public']['Tables']['conversation_messages']['Row'];
export type DesignRequirement = Database['public']['Tables']['design_requirements']['Row'];
export type DesignWork = Database['public']['Tables']['design_works']['Row'];
export type DesignTag = Database['public']['Tables']['design_tags']['Row'];
export type UserFavorite = Database['public']['Tables']['user_favorites']['Row'];

// Insert types for creating new records
export type DesignSessionInsert = Database['public']['Tables']['design_sessions']['Insert'];
export type ConversationMessageInsert = Database['public']['Tables']['conversation_messages']['Insert'];
export type DesignRequirementInsert = Database['public']['Tables']['design_requirements']['Insert'];
export type DesignWorkInsert = Database['public']['Tables']['design_works']['Insert'];

export class SessionService {
  // 创建新的设计会话
  async createSession(initialPrompt: string, title?: string): Promise<DesignSession> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('用户未登录，无法创建会话');
    }

    console.log('创建会话，用户ID:', user.id);

    const { data, error } = await supabase
      .from('design_sessions')
      .insert({
        user_id: user.id,
        initial_prompt: initialPrompt,
        title: title || '新设计会话',
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
  async updateSessionStatus(sessionId: string, status: 'active' | 'completed' | 'archived'): Promise<void> {
    const { error } = await supabase
      .from('design_sessions')
      .update({ status })
      .eq('id', sessionId);

    if (error) throw error;
  }

  // 更新会话标题
  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    const { error } = await supabase
      .from('design_sessions')
      .update({ title })
      .eq('id', sessionId);

    if (error) throw error;
  }

  // 添加对话消息
  async addMessage(sessionId: string, role: 'user' | 'assistant' | 'system', content: string, metadata?: any): Promise<ConversationMessage> {
    const { data, error } = await supabase
      .from('conversation_messages')
      .insert({
        session_id: sessionId,
        role,
        content,
        metadata: metadata || {}
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

  // 创建或更新设计需求
  async upsertDesignRequirement(sessionId: string, requirement: Partial<Omit<DesignRequirement, 'id' | 'session_id' | 'created_at' | 'updated_at'>>): Promise<DesignRequirement> {
    // 先查找是否已存在
    const { data: existing } = await supabase
      .from('design_requirements')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (existing) {
      // 更新现有需求
      const { data, error } = await supabase
        .from('design_requirements')
        .update(requirement)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // 创建新需求
      const { data, error } = await supabase
        .from('design_requirements')
        .insert({
          session_id: sessionId,
          ...requirement
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  // 创建设计作品
  async createDesignWork(sessionId: string, workData: Partial<Omit<DesignWork, 'id' | 'session_id' | 'created_at' | 'updated_at'>>): Promise<DesignWork> {
    const { data, error } = await supabase
      .from('design_works')
      .insert({
        session_id: sessionId,
        ...workData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 更新设计作品
  async updateDesignWork(workId: string, updates: Partial<Omit<DesignWork, 'id' | 'created_at' | 'updated_at'>>): Promise<DesignWork> {
    const { data, error } = await supabase
      .from('design_works')
      .update(updates)
      .eq('id', workId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 获取会话的设计作品
  async getSessionWorks(sessionId: string): Promise<DesignWork[]> {
    const { data, error } = await supabase
      .from('design_works')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

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

  // 获取用户的收藏作品
  async getUserFavorites(): Promise<DesignWork[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        work_id,
        design_works (*)
      `)
      .eq('user_id', user.id);

    if (error) throw error;
    return data?.map(item => item.design_works).filter(Boolean) || [];
  }

  // 添加/移除收藏
  async toggleFavorite(workId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    // 检查是否已收藏
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('work_id', workId)
      .maybeSingle();

    if (existing) {
      // 取消收藏
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', existing.id);
      
      if (error) throw error;
      return false;
    } else {
      // 添加收藏
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          work_id: workId
        });
      
      if (error) throw error;
      return true;
    }
  }

  // 获取会话的完整信息（包含消息、需求、作品等）
  async getSessionComplete(sessionId: string) {
    const [session, messages, requirements, works] = await Promise.all([
      this.getSession(sessionId),
      this.getSessionMessages(sessionId),
      this.getSessionRequirements(sessionId),
      this.getSessionWorks(sessionId)
    ]);

    return {
      session,
      messages,
      requirements,
      works
    };
  }

  // 获取会话的设计需求
  private async getSessionRequirements(sessionId: string): Promise<DesignRequirement[]> {
    const { data, error } = await supabase
      .from('design_requirements')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // 获取所有标签
  async getAllTags(): Promise<DesignTag[]> {
    const { data, error } = await supabase
      .from('design_tags')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // 为作品添加标签
  async addTagsToWork(workId: string, tagIds: string[]): Promise<void> {
    const insertData = tagIds.map(tagId => ({
      design_work_id: workId,
      tag_id: tagId
    }));

    const { error } = await supabase
      .from('design_work_tags')
      .upsert(insertData);

    if (error) throw error;
  }

  // 获取作品的标签
  async getWorkTags(workId: string): Promise<DesignTag[]> {
    const { data, error } = await supabase
      .from('design_work_tags')
      .select(`
        tag_id,
        design_tags (*)
      `)
      .eq('design_work_id', workId);

    if (error) throw error;
    return data?.map(item => item.design_tags).filter(Boolean) || [];
  }
}

export const sessionService = new SessionService();
