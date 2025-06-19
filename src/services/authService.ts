
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
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('获取用户资料失败:', error);
      return null;
    }
    
    return data;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  }

  // 创建测试管理员账号的辅助方法
  async createTestAdmin() {
    try {
      const { data, error } = await this.signUp(
        'admin@soxlab.com', 
        'admin123456',
        '测试管理员'
      );
      
      if (error) {
        console.error('创建测试管理员失败:', error);
        return { success: false, error };
      }

      console.log('测试管理员账号创建成功，请查看邮箱确认');
      return { success: true, data };
    } catch (error) {
      console.error('创建测试管理员异常:', error);
      return { success: false, error };
    }
  }
}

export const authService = new AuthService();
