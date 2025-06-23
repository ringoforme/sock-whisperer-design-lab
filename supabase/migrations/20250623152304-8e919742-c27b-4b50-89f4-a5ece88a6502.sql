
-- 删除现有的 CSV 格式表
DROP TABLE IF EXISTS public."conversation_messages.csv";
DROP TABLE IF EXISTS public."design_briefs.csv";
DROP TABLE IF EXISTS public."design_sessions.csv";
DROP TABLE IF EXISTS public."expanded_prompts.csv";
DROP TABLE IF EXISTS public."generated_images.csv";
DROP TABLE IF EXISTS public."profiles.csv";

-- 创建 profiles 表（如果不存在）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建设计会话表
CREATE TABLE public.design_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  initial_idea TEXT NOT NULL,
  session_title TEXT DEFAULT '新设计会话',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建对话消息表
CREATE TABLE public.conversation_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.design_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建设计简报表
CREATE TABLE public.design_briefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.design_sessions(id) ON DELETE CASCADE,
  sock_type TEXT,
  colors JSONB DEFAULT NULL,
  pattern TEXT,
  occasion TEXT,
  style TEXT,
  additional_notes TEXT,
  completion_status TEXT DEFAULT 'incomplete' CHECK (completion_status IN ('incomplete', 'complete')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建扩展提示词表
CREATE TABLE public.expanded_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.design_sessions(id) ON DELETE CASCADE,
  brief_id UUID NOT NULL REFERENCES public.design_briefs(id) ON DELETE CASCADE,
  original_brief TEXT NOT NULL,
  expanded_prompt TEXT NOT NULL,
  prompt_version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建生成图片表
CREATE TABLE public.generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.design_sessions(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES public.expanded_prompts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  design_name TEXT NOT NULL,
  generation_status TEXT DEFAULT 'pending' CHECK (generation_status IN ('pending', 'success', 'failed')),
  error_message TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引提升性能
CREATE INDEX IF NOT EXISTS idx_design_sessions_user_id ON public.design_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_design_sessions_status ON public.design_sessions(status);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_session_id ON public.conversation_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON public.conversation_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_design_briefs_session_id ON public.design_briefs(session_id);
CREATE INDEX IF NOT EXISTS idx_expanded_prompts_session_id ON public.expanded_prompts(session_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_session_id ON public.generated_images(session_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_display_order ON public.generated_images(display_order);

-- 启用行级安全
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expanded_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- 创建 profiles 表的 RLS 策略
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- 创建 design_sessions 表的 RLS 策略
CREATE POLICY "Users can view their own sessions" 
  ON public.design_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
  ON public.design_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
  ON public.design_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
  ON public.design_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 创建 conversation_messages 表的 RLS 策略
CREATE POLICY "Users can view messages from their sessions" 
  ON public.conversation_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their sessions" 
  ON public.conversation_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- 创建 design_briefs 表的 RLS 策略
CREATE POLICY "Users can view briefs from their sessions" 
  ON public.design_briefs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create briefs in their sessions" 
  ON public.design_briefs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update briefs from their sessions" 
  ON public.design_briefs 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- 创建 expanded_prompts 表的 RLS 策略
CREATE POLICY "Users can view prompts from their sessions" 
  ON public.expanded_prompts 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create prompts in their sessions" 
  ON public.expanded_prompts 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- 创建 generated_images 表的 RLS 策略
CREATE POLICY "Users can view images from their sessions" 
  ON public.generated_images 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create images in their sessions" 
  ON public.generated_images 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update images from their sessions" 
  ON public.generated_images 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- 创建自动处理新用户的触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器（如果不存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 创建更新 updated_at 的触发器函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要 updated_at 的表添加触发器
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_design_sessions_updated_at ON public.design_sessions;
CREATE TRIGGER update_design_sessions_updated_at 
  BEFORE UPDATE ON public.design_sessions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_design_briefs_updated_at ON public.design_briefs;
CREATE TRIGGER update_design_briefs_updated_at 
  BEFORE UPDATE ON public.design_briefs 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 创建自动生成会话标题的触发器函数
CREATE OR REPLACE FUNCTION public.auto_generate_session_title()
RETURNS TRIGGER AS $$
DECLARE
    title_text TEXT;
BEGIN
    -- 当插入第一条用户消息时，自动生成标题
    IF NEW.role = 'user' THEN
        -- 检查是否已有标题
        SELECT ds.session_title INTO title_text 
        FROM design_sessions ds 
        WHERE ds.id = NEW.session_id AND ds.session_title != '新设计会话';
        
        -- 如果没有自定义标题，则生成一个
        IF title_text IS NULL OR title_text = '新设计会话' THEN
            -- 截取前15个字符作为标题
            title_text := TRIM(SUBSTRING(NEW.content FROM 1 FOR 15));
            IF LENGTH(title_text) = 15 THEN
                title_text := title_text || '...';
            END IF;
            
            -- 更新会话标题
            UPDATE design_sessions 
            SET session_title = title_text, updated_at = NOW()
            WHERE id = NEW.session_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 conversation_messages 表添加自动生成标题的触发器
DROP TRIGGER IF EXISTS auto_generate_session_title_trigger ON public.conversation_messages;
CREATE TRIGGER auto_generate_session_title_trigger
  AFTER INSERT ON public.conversation_messages
  FOR EACH ROW EXECUTE FUNCTION public.auto_generate_session_title();
