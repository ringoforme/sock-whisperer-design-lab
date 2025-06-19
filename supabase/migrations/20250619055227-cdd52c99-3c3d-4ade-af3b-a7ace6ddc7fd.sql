
-- 创建设计会话表
CREATE TABLE public.design_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  initial_idea TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建对话消息表
CREATE TABLE public.conversation_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.design_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建设计简报表
CREATE TABLE public.design_briefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.design_sessions(id) ON DELETE CASCADE NOT NULL,
  sock_type TEXT,
  colors JSONB,
  pattern TEXT,
  occasion TEXT,
  style TEXT,
  additional_notes TEXT,
  completion_status TEXT NOT NULL DEFAULT 'in_progress' CHECK (completion_status IN ('in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建扩展提示词表
CREATE TABLE public.expanded_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.design_sessions(id) ON DELETE CASCADE NOT NULL,
  brief_id UUID REFERENCES public.design_briefs(id) ON DELETE CASCADE NOT NULL,
  original_brief TEXT NOT NULL,
  expanded_prompt TEXT NOT NULL,
  prompt_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建生成图片表
CREATE TABLE public.generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.design_sessions(id) ON DELETE CASCADE NOT NULL,
  prompt_id UUID REFERENCES public.expanded_prompts(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  design_name TEXT NOT NULL,
  generation_status TEXT NOT NULL DEFAULT 'success' CHECK (generation_status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 添加索引优化查询性能
CREATE INDEX idx_design_sessions_user_id ON public.design_sessions(user_id);
CREATE INDEX idx_design_sessions_status ON public.design_sessions(status);
CREATE INDEX idx_conversation_messages_session_id ON public.conversation_messages(session_id);
CREATE INDEX idx_conversation_messages_created_at ON public.conversation_messages(created_at);
CREATE INDEX idx_design_briefs_session_id ON public.design_briefs(session_id);
CREATE INDEX idx_expanded_prompts_session_id ON public.expanded_prompts(session_id);
CREATE INDEX idx_generated_images_session_id ON public.generated_images(session_id);

-- 启用行级安全性
ALTER TABLE public.design_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expanded_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略 - 用户只能访问自己的数据
CREATE POLICY "Users can manage their own design sessions" 
  ON public.design_sessions 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own conversation messages" 
  ON public.conversation_messages 
  FOR ALL 
  USING (auth.uid() = (SELECT user_id FROM public.design_sessions WHERE id = session_id));

CREATE POLICY "Users can manage their own design briefs" 
  ON public.design_briefs 
  FOR ALL 
  USING (auth.uid() = (SELECT user_id FROM public.design_sessions WHERE id = session_id));

CREATE POLICY "Users can manage their own expanded prompts" 
  ON public.expanded_prompts 
  FOR ALL 
  USING (auth.uid() = (SELECT user_id FROM public.design_sessions WHERE id = session_id));

CREATE POLICY "Users can manage their own generated images" 
  ON public.generated_images 
  FOR ALL 
  USING (auth.uid() = (SELECT user_id FROM public.design_sessions WHERE id = session_id));

-- 创建触发器自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_design_sessions_updated_at 
  BEFORE UPDATE ON public.design_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_briefs_updated_at 
  BEFORE UPDATE ON public.design_briefs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
