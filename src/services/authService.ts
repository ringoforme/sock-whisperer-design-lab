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
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName || email
          }
        }
      });
      
      if (error) {
        console.error('注册错误:', error);
        
        // 提供更友好的错误消息
        if (error.message.includes('User already registered')) {
          return { data, error: { ...error, message: '该邮箱已注册，请直接登录' } };
        } else if (error.message.includes('Password')) {
          return { data, error: { ...error, message: '密码格式不符合要求，请使用至少6个字符' } };
        } else if (error.message.includes('Email')) {
          return { data, error: { ...error, message: '邮箱格式不正确' } };
        }
      }
      
      return { data, error };
    } catch (err) {
      console.error('注册过程中发生未知错误:', err);
      return { 
        data: null, 
        error: { 
          message: '注册失败，请稍后重试', 
          details: err 
        } 
      };
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('登录错误:', error);
        
        // 提供更友好的错误消息
        if (error.message.includes('Invalid login credentials')) {
          return { data, error: { ...error, message: '邮箱或密码错误，请检查后重试' } };
        } else if (error.message.includes('Email not confirmed')) {
          return { data, error: { ...error, message: '请先确认邮箱后再登录' } };
        }
      }
      
      return { data, error };
    } catch (err) {
      console.error('登录过程中发生未知错误:', err);
      return { 
        data: null, 
        error: { 
          message: '登录失败，请稍后重试', 
          details: err 
        } 
      };
    }
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
