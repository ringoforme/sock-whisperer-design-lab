
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type OptimizedDesignSession = Database['public']['Views']['session_history_view']['Row'];
export type OptimizedDesignLibrary = Database['public']['Views']['user_design_library']['Row'];

export class OptimizedSessionService {
  // Get user sessions with message counts in a single query
  async getUserSessionsOptimized(limit: number = 50, offset: number = 0): Promise<OptimizedDesignSession[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    console.log('获取优化的用户会话列表');
    
    const { data, error } = await supabase
      .from('session_history_view')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取会话列表失败:', error);
      throw error;
    }

    return data || [];
  }

  // Get user design library with single optimized query
  async getUserDesignLibraryOptimized(limit: number = 100, offset: number = 0): Promise<{
    all: OptimizedDesignLibrary[];
    drafts: OptimizedDesignLibrary[];
    edited: OptimizedDesignLibrary[];
    vectorized: OptimizedDesignLibrary[];
    downloaded: OptimizedDesignLibrary[];
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    console.log('获取优化的用户设计库');
    
    const { data, error } = await supabase
      .from('user_design_library')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取设计库失败:', error);
      throw error;
    }

    const allDesigns = data || [];
    
    // Group designs by category
    const grouped = {
      all: allDesigns,
      drafts: allDesigns.filter(d => d.category === 'drafts'),
      edited: allDesigns.filter(d => d.category === 'edited'),
      vectorized: allDesigns.filter(d => d.category === 'vectorized'),
      downloaded: allDesigns.filter(d => d.category === 'downloaded')
    };

    console.log('设计库分组结果:', {
      total: grouped.all.length,
      drafts: grouped.drafts.length,
      edited: grouped.edited.length,
      vectorized: grouped.vectorized.length,
      downloaded: grouped.downloaded.length
    });

    return grouped;
  }

  // Get single design by ID quickly
  async getDesignById(designId: string): Promise<OptimizedDesignLibrary | null> {
    console.log('获取单个设计:', designId);
    
    const { data, error } = await supabase
      .from('user_design_library')
      .select('*')
      .eq('id', designId)
      .maybeSingle();

    if (error) {
      console.error('获取设计失败:', error);
      throw error;
    }

    return data;
  }

  // Update design status with optimistic updates
  async updateDesignStatus(designId: string, updates: {
    is_edited?: boolean;
    is_vectorized?: boolean;
    is_downloaded?: boolean;
  }): Promise<void> {
    console.log('更新设计状态:', designId, updates);
    
    const { error } = await supabase
      .from('generated_images')
      .update(updates)
      .eq('id', designId);

    if (error) {
      console.error('更新设计状态失败:', error);
      throw error;
    }
  }
}

export const optimizedSessionService = new OptimizedSessionService();
