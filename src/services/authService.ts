
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

class AuthService {
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email
        }
      }
    });
    
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // 暂时直接返回基于用户数据的模拟资料，避免RLS递归问题
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.id !== userId) {
        return null;
      }

      // 创建一个基于用户元数据的资料对象
      const profile: UserProfile = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email || '',
        is_admin: false, // 默认为非管理员
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at
      };

      return profile;
    } catch (error) {
      console.error('获取用户资料失败:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    // 暂时禁用更新功能，避免RLS问题
    console.log('Profile update temporarily disabled due to RLS issues');
    return { data: null, error: new Error('Profile update temporarily disabled') };
  }
}

export const authService = new AuthService();
