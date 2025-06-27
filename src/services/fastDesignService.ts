
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type FastDesignItem = {
  id: string;
  image_url: string;
  design_name: string;
  created_at: string;
  is_edited: boolean;
  is_vectorized: boolean;
  is_downloaded: boolean;
  session_id: string;
  category: 'drafts' | 'edited' | 'vectorized' | 'downloaded';
};

export type FastDesignLibrary = {
  all: FastDesignItem[];
  drafts: FastDesignItem[];
  edited: FastDesignItem[];
  vectorized: FastDesignItem[];
  downloaded: FastDesignItem[];
};

class FastDesignService {
  // Get design library with minimal data and fast queries
  async getFastDesignLibrary(): Promise<FastDesignLibrary> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    console.time('Fast Design Library Query');
    
    // Single optimized query with only essential fields
    const { data, error } = await supabase
      .from('generated_images')
      .select(`
        id,
        image_url,
        design_name,
        created_at,
        is_edited,
        is_vectorized,
        is_downloaded,
        session_id
      `)
      .eq('user_id', user.id)
      .eq('generation_status', 'success')
      .order('created_at', { ascending: false })
      .limit(100); // Limit to prevent overwhelming queries

    console.timeEnd('Fast Design Library Query');

    if (error) {
      console.error('获取设计库失败:', error);
      throw error;
    }

    const designs = (data || []).map(item => ({
      ...item,
      category: this.determineCategory(item) as 'drafts' | 'edited' | 'vectorized' | 'downloaded'
    }));

    // Group designs efficiently
    const result = {
      all: designs,
      drafts: designs.filter(d => d.category === 'drafts'),
      edited: designs.filter(d => d.category === 'edited'),
      vectorized: designs.filter(d => d.category === 'vectorized'),
      downloaded: designs.filter(d => d.category === 'downloaded')
    };

    console.log('Fast design library loaded:', {
      total: result.all.length,
      drafts: result.drafts.length,
      edited: result.edited.length,
      vectorized: result.vectorized.length,
      downloaded: result.downloaded.length
    });

    return result;
  }

  // Determine category based on flags
  private determineCategory(item: any): string {
    if (item.is_downloaded) return 'downloaded';
    if (item.is_vectorized) return 'vectorized';
    if (item.is_edited) return 'edited';
    return 'drafts';
  }

  // Fast update design status
  async updateDesignStatus(designId: string, updates: {
    is_edited?: boolean;
    is_vectorized?: boolean;
    is_downloaded?: boolean;
  }): Promise<void> {
    console.log('Fast update design status:', designId, updates);
    
    const { error } = await supabase
      .from('generated_images')
      .update(updates)
      .eq('id', designId);

    if (error) {
      console.error('更新设计状态失败:', error);
      throw error;
    }
  }

  // Get single design quickly
  async getDesignById(designId: string): Promise<FastDesignItem | null> {
    const { data, error } = await supabase
      .from('generated_images')
      .select(`
        id,
        image_url,
        design_name,
        created_at,
        is_edited,
        is_vectorized,
        is_downloaded,
        session_id
      `)
      .eq('id', designId)
      .eq('generation_status', 'success')
      .maybeSingle();

    if (error) {
      console.error('获取设计失败:', error);
      throw error;
    }

    if (!data) return null;

    return {
      ...data,
      category: this.determineCategory(data) as 'drafts' | 'edited' | 'vectorized' | 'downloaded'
    };
  }
}

export const fastDesignService = new FastDesignService();
