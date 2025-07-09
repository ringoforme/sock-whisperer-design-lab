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
    console.log('获取会话详情:', sessionId);
    const { data, error } = await supabase
      .from('design_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    if (error) {
      console.error('获取会话失败:', error);
      throw error;
    }
    console.log('会话详情:', data);
    return data;
  }

  // 更新会话状态
  async updateSessionStatus(sessionId: string, status: 'active' | 'completed' | 'abandoned'): Promise<void> {
    console.log('更新会话状态:', sessionId, status);
    const { error } = await supabase
      .from('design_sessions')
      .update({ status })
      .eq('id', sessionId);

    if (error) {
      console.error('更新会话状态失败:', error);
      throw error;
    }
    console.log('会话状态更新成功');
  }

  // 删除会话
  async deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('design_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
  }

  // 检查会话是否有用户消息
  async hasUserMessages(sessionId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('conversation_messages')
      .select('id')
      .eq('session_id', sessionId)
      .eq('role', 'user')
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  }

  // 删除空会话（没有用户消息的会话）
  async deleteEmptySession(sessionId: string): Promise<boolean> {
    const hasMessages = await this.hasUserMessages(sessionId);
    if (!hasMessages) {
      await this.deleteSession(sessionId);
      return true;
    }
    return false;
  }

  // 添加对话消息 - Updated to return the message ID for image association
  async addMessage(sessionId: string, role: 'user' | 'assistant', content: string, metadata?: any): Promise<ConversationMessage> {
    console.log('添加消息到会话:', sessionId, role, content.substring(0, 50) + '...');
    
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

    if (error) {
      console.error('添加消息失败:', error);
      throw error;
    }

    console.log('消息添加成功:', data.id);

    // Generate intelligent title for first user message
    if (role === 'user') {
      const messages = await this.getSessionMessages(sessionId);
      const userMessages = messages.filter(msg => msg.role === 'user');
      
      if (userMessages.length === 1) { // This is the first user message
        const intelligentTitle = await this.generateSessionTitle(sessionId, content);
        await this.updateSessionTitle(sessionId, intelligentTitle);
      }
    }

    return data;
  }

  // 获取会话的所有消息
  async getSessionMessages(sessionId: string): Promise<ConversationMessage[]> {
    console.log('获取会话消息:', sessionId);
    const { data, error } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('session_id', sessionId)
      .is('metadata',null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('获取会话消息失败:', error);
      throw error;
    }
    console.log('获取到', data?.length || 0, '条消息');
    return data || [];
  }

  // 创建或更新设计简报
  async upsertDesignBrief(sessionId: string, brief: Partial<Omit<DesignBrief, 'id' | 'session_id' | 'created_at' | 'updated_at'>>): Promise<DesignBrief> {
    console.log('创建或更新设计简报，会话ID:', sessionId);
    console.log('简报内容:', brief);
    
    // 先查找是否已存在
    const { data: existing } = await supabase
      .from('design_briefs')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (existing) {
      // 更新现有简报
      console.log('更新现有设计简报:', existing.id);
      const { data, error } = await supabase
        .from('design_briefs')
        .update(brief)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('更新设计简报失败:', error);
        throw error;
      }
      console.log('设计简报更新成功:', data);
      return data;
    } else {
      // 创建新简报
      console.log('创建新设计简报');
      const { data, error } = await supabase
        .from('design_briefs')
        .insert({
          session_id: sessionId,
          ...brief
        })
        .select()
        .single();

      if (error) {
        console.error('创建设计简报失败:', error);
        throw error;
      }
      console.log('设计简报创建成功:', data);
      return data;
    }
  }

  // 记录扩展提示词
  async addExpandedPrompt(sessionId: string, briefId: string, originalBrief: string, expandedPrompt: string): Promise<ExpandedPrompt> {
    console.log('记录扩展提示词，会话ID:', sessionId, '简报ID:', briefId);
    console.log('原始简报:', originalBrief.substring(0, 100) + '...');
    console.log('扩展提示词:', expandedPrompt.substring(0, 100) + '...');
    
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

    if (error) {
      console.error('记录扩展提示词失败:', error);
      throw error;
    }
    console.log('扩展提示词记录成功:', data.id);
    return data;
  }

  // 记录生成的图片 - Updated to include message_id
  async addGeneratedImage(sessionId: string, promptId: string, imageUrl: string, designName: string, messageId?: string, status: 'success' | 'failed' | 'pending' = 'success', errorMessage?: string): Promise<GeneratedImage> {
    console.log('记录生成图片，会话ID:', sessionId, '提示词ID:', promptId);
    console.log('图片URL:', imageUrl);
    console.log('设计名称:', designName);
    console.log('状态:', status);
    console.log('消息ID:', messageId);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('用户未登录，无法记录生成图片');
    }
    
    const { data, error } = await supabase
      .from('generated_images')
      .insert({
        session_id: sessionId,
        prompt_id: promptId,
        image_url: imageUrl,
        design_name: designName,
        generation_status: status,
        error_message: errorMessage,
        user_id: user.id,
        message_id: messageId
      })
      .select()
      .single();

    if (error) {
      console.error('记录生成图片失败:', error);
      throw error;
    }
    console.log('生成图片记录成功:', data.id);
    return data;
  }

  // 更新图片的编辑状态
  async updateImageEditedStatus(imageId: string, isEdited: boolean = true): Promise<void> {
    console.log('更新图片编辑状态:', imageId, isEdited);
    const { error } = await supabase
      .from('generated_images')
      .update({ is_edited: isEdited })
      .eq('id', imageId);

    if (error) {
      console.error('更新图片编辑状态失败:', error);
      throw error;
    }
    console.log('图片编辑状态更新成功');
  }

  // 更新图片的矢量化状态
  async updateImageVectorizedStatus(imageId: string, isVectorized: boolean = true): Promise<void> {
    console.log('更新图片矢量化状态:', imageId, isVectorized);
    const { error } = await supabase
      .from('generated_images')
      .update({ is_vectorized: isVectorized })
      .eq('id', imageId);

    if (error) {
      console.error('更新图片矢量化状态失败:', error);
      throw error;
    }
    console.log('图片矢量化状态更新成功');
  }

  // 更新图片的下载状态
  async updateImageDownloadedStatus(imageId: string, isDownloaded: boolean = true): Promise<void> {
    console.log('更新图片下载状态:', imageId, isDownloaded);
    const { error } = await supabase
      .from('generated_images')
      .update({ is_downloaded: isDownloaded })
      .eq('id', imageId);

    if (error) {
      console.error('更新图片下载状态失败:', error);
      throw error;
    }
    console.log('图片下载状态更新成功');
  }

  // 获取用户的所有设计图片（草稿库）
  async getUserDesigns(): Promise<GeneratedImage[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('user_id', user.id)
      .eq('generation_status', 'success')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // 获取用户的编辑库设计
  async getUserEditedDesigns(): Promise<GeneratedImage[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_edited', true)
      .eq('generation_status', 'success')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // 获取用户的矢量库设计
  async getUserVectorizedDesigns(): Promise<GeneratedImage[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_vectorized', true)
      .eq('generation_status', 'success')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // 获取用户的下载库设计
  async getUserDownloadedDesigns(): Promise<GeneratedImage[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_downloaded', true)
      .eq('generation_status', 'success')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // New function to get session info by image ID for navigation
  async getSessionByImageId(imageId: string): Promise<{session_id: string, session_title: string, message_id?: string} | null> {
    console.log('获取图片对应的会话信息:', imageId);
    const { data, error } = await supabase.rpc('get_session_by_image_id', { image_id: imageId });

    if (error) {
      console.error('获取会话信息失败:', error);
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  // Generate intelligent session title based on conversation content
  async generateSessionTitle(sessionId: string, userMessage: string): Promise<string> {
    try {
      console.log('生成会话标题，用户消息:', userMessage);
      
      // First check if we already have a custom title
      const session = await this.getSession(sessionId);
      if (session && session.session_title !== '新设计会话' && session.session_title !== userMessage.substring(0, 15)) {
        return session.session_title;
      }

      // Improved title generation logic
      let title = this.extractDesignTheme(userMessage);
      console.log('提取的主题标题:', title);
      
      return title;
    } catch (error) {
      console.error('生成会话标题失败:', error);
      return userMessage.substring(0, 15) + (userMessage.length > 15 ? '...' : '');
    }
  }

  // Extract design theme from user message
  private extractDesignTheme(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    // Define design patterns and themes
    const themes = {
      // Sock types
      '长筒袜': '长筒袜设计',
      '短袜': '短袜设计', 
      '中筒袜': '中筒袜设计',
      '船袜': '船袜设计',
      '运动袜': '运动袜设计',
      
      // Styles and patterns
      '复古': '复古风袜子',
      '可爱': '可爱袜子设计',
      '商务': '商务袜子',
      '休闲': '休闲袜子',
      '卡通': '卡通袜子设计',
      '花纹': '花纹袜子设计',
      '条纹': '条纹袜子设计',
      '波点': '波点袜子设计',
      '几何': '几何图案袜子',
      '动物': '动物图案袜子',
      '植物': '植物图案袜子',
      '星空': '星空主题袜子',
      '彩虹': '彩虹袜子设计',
      '渐变': '渐变色袜子',
      
      // Colors
      '红色': '红色袜子设计',
      '蓝色': '蓝色袜子设计',
      '绿色': '绿色袜子设计',
      '黄色': '黄色袜子设计',
      '紫色': '紫色袜子设计',
      '粉色': '粉色袜子设计',
      '黑色': '黑色袜子设计',
      '白色': '白色袜子设计',
      
      // Occasions
      '上班': '商务袜子设计',
      '运动': '运动袜子设计',
      '日常': '日常袜子设计',
      '约会': '约会袜子设计',
      '聚会': '聚会袜子设计'
    };
    
    // Look for matches in the message
    for (const [keyword, theme] of Object.entries(themes)) {
      if (message.includes(keyword)) {
        return theme;
      }
    }
    
    // If no specific theme found, try to extract key descriptive words
    const words = userMessage.split(/[，。！？、\s]+/).filter(word => 
      word.length > 0 && 
      !['请', '帮我', '设计', '一双', '一款', '想要', '袜子'].includes(word)
    );
    
    if (words.length > 0) {
      const mainWord = words[0];
      if (mainWord.length > 1) {
        return mainWord + '袜子设计';
      }
    }
    
    // Fallback to generic title
    return '袜子设计';
  }

  // Update session title
  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    console.log('更新会话标题:', sessionId, title);
    const { error } = await supabase
      .from('design_sessions')
      .update({ 
        session_title: title,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) {
      console.error('更新会话标题失败:', error);
      throw error;
    }
    console.log('会话标题更新成功:', title);
  }

  // 获取会话的完整历史记录 - Updated to handle message-image associations properly
  async getSessionHistory(sessionId: string) {
    console.log('获取会话历史记录:', sessionId);
    
    const [session, messages, briefs, prompts, images] = await Promise.all([
      this.getSession(sessionId),
      this.getSessionMessages(sessionId),
      this.getDesignBriefs(sessionId),
      this.getExpandedPrompts(sessionId),
      this.getGeneratedImages(sessionId)
    ]);

    console.log('会话历史记录获取完成:');
    console.log('- 会话信息:', session);
    console.log('- 消息数量:', messages.length);
    console.log('- 设计简报数量:', briefs.length);
    console.log('- 扩展提示词数量:', prompts.length);
    console.log('- 生成图片数量:', images.length);

    // Find the latest successful image
    const successfulImages = images.filter(img => img.generation_status === 'success');
    console.log('成功生成的图片数量:', successfulImages.length);
    
    const latestImage = successfulImages
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    console.log('最新图片:', latestImage);

    return {
      session,
      messages,
      briefs,
      prompts,
      images,
      latestImage
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
