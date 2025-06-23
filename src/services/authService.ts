
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
    console.log('尝试注册用户:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email
        },
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    
    if (error) {
      console.error('注册失败:', error);
      return { data, error };
    }

    // 如果注册成功，尝试创建或更新用户资料
    if (data.user) {
      console.log('注册成功，创建用户资料:', data.user.id);
      try {
        await this.ensureUserProfile(data.user);
      } catch (profileError) {
        console.error('创建用户资料失败:', profileError);
        // 不影响注册流程，只记录错误
      }
    }
    
    return { data, error };
  }

  async signIn(email: string, password: string) {
    console.log('尝试登录用户:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('登录失败:', error);
      return { data, error };
    }

    // 如果登录成功，确保用户资料存在
    if (data.user) {
      console.log('登录成功，检查用户资料:', data.user.id);
      try {
        await this.ensureUserProfile(data.user);
      } catch (profileError) {
        console.error('检查用户资料失败:', profileError);
        // 不影响登录流程，只记录错误
      }
    }
    
    return { data, error };
  }

  async signOut() {
    console.log('用户登出');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('登出失败:', error);
    }
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

  // 确保用户资料存在
  private async ensureUserProfile(user: User): Promise<void> {
    try {
      console.log('检查用户资料是否存在:', user.id);
      
      // 先检查是否已存在
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (selectError) {
        console.error('检查用户资料时出错:', selectError);
        throw selectError;
      }

      if (!existingProfile) {
        console.log('用户资料不存在，创建新资料');
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email || '',
            is_admin: false
          });

        if (insertError) {
          console.error('创建用户资料失败:', insertError);
          throw insertError;
        }

        console.log('用户资料创建成功');
      } else {
        console.log('用户资料已存在');
      }
    } catch (error) {
      console.error('确保用户资料存在时出错:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('获取用户资料:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('获取用户资料失败:', error);
        throw error;
      }

      console.log('用户资料获取成功:', data);
      return data;
    } catch (error) {
      console.error('获取用户资料时出错:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      console.log('更新用户资料:', userId, updates);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('更新用户资料失败:', error);
        throw error;
      }

      console.log('用户资料更新成功:', data);
      return { data, error: null };
    } catch (error) {
      console.error('更新用户资料时出错:', error);
      return { data: null, error };
    }
  }
}

export const authService = new AuthService();
