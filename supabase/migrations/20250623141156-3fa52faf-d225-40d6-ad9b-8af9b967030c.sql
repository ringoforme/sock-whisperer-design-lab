
-- 1. 删除所有触发器
DROP TRIGGER IF EXISTS trigger_update_session_title ON conversation_messages;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_design_sessions_updated_at ON design_sessions;
DROP TRIGGER IF EXISTS update_design_briefs_updated_at ON design_briefs;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- 2. 删除所有函数
DROP FUNCTION IF EXISTS generate_session_title(UUID);
DROP FUNCTION IF EXISTS generate_session_title(text);
DROP FUNCTION IF EXISTS update_session_title();
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 3. 删除所有表（按外键依赖顺序）
DROP TABLE IF EXISTS generated_images CASCADE;
DROP TABLE IF EXISTS expanded_prompts CASCADE;
DROP TABLE IF EXISTS design_briefs CASCADE;
DROP TABLE IF EXISTS conversation_messages CASCADE;
DROP TABLE IF EXISTS design_sessions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 4. 重新创建优化的表结构

-- 用户配置表
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 设计会话表
CREATE TABLE public.design_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '新设计会话',
  initial_prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 对话消息表
CREATE TABLE public.conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES design_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 设计需求表
CREATE TABLE public.design_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES design_sessions(id) ON DELETE CASCADE,
  sock_type TEXT,
  colors TEXT[],
  patterns TEXT[],
  style TEXT,
  occasion TEXT,
  size_range TEXT,
  material_preferences TEXT[],
  special_features TEXT[],
  target_audience TEXT,
  budget_range TEXT,
  additional_notes TEXT,
  is_finalized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 设计作品表
CREATE TABLE public.design_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES design_sessions(id) ON DELETE CASCADE,
  requirements_id UUID REFERENCES design_requirements(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  prompt_used TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  generation_provider TEXT DEFAULT 'openai',
  generation_model TEXT DEFAULT 'dall-e-3',
  generation_params JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generating', 'generated', 'failed', 'archived')),
  is_favorite BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  edit_history JSONB DEFAULT '[]',
  parent_work_id UUID REFERENCES design_works(id) ON DELETE SET NULL,
  version INTEGER DEFAULT 1,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 设计标签表
CREATE TABLE public.design_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 设计作品标签关联表
CREATE TABLE public.design_work_tags (
  design_work_id UUID NOT NULL REFERENCES design_works(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES design_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (design_work_id, tag_id)
);

-- 用户收藏表
CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  work_id UUID NOT NULL REFERENCES design_works(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, work_id)
);

-- 创建索引优化查询性能
CREATE INDEX idx_design_sessions_user_id ON design_sessions(user_id);
CREATE INDEX idx_design_sessions_status ON design_sessions(status);
CREATE INDEX idx_design_sessions_created_at ON design_sessions(created_at DESC);

CREATE INDEX idx_conversation_messages_session_id ON conversation_messages(session_id);
CREATE INDEX idx_conversation_messages_created_at ON conversation_messages(created_at);

CREATE INDEX idx_design_requirements_session_id ON design_requirements(session_id);
CREATE INDEX idx_design_requirements_finalized ON design_requirements(is_finalized);

CREATE INDEX idx_design_works_session_id ON design_works(session_id);
CREATE INDEX idx_design_works_status ON design_works(status);
CREATE INDEX idx_design_works_favorite ON design_works(is_favorite);
CREATE INDEX idx_design_works_created_at ON design_works(created_at DESC);
CREATE INDEX idx_design_works_parent ON design_works(parent_work_id);

CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_work_id ON user_favorites(work_id);

-- 创建自动更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建处理新用户的函数
CREATE OR REPLACE FUNCTION handle_new_user()
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

-- 创建自动生成会话标题的函数
CREATE OR REPLACE FUNCTION auto_generate_session_title()
RETURNS TRIGGER AS $$
DECLARE
    title_text TEXT;
BEGIN
    -- 当插入第一条用户消息时，自动生成标题
    IF NEW.role = 'user' THEN
        -- 检查是否已有标题
        SELECT ds.title INTO title_text 
        FROM design_sessions ds 
        WHERE ds.id = NEW.session_id AND ds.title != '新设计会话';
        
        -- 如果没有自定义标题，则生成一个
        IF title_text IS NULL OR title_text = '新设计会话' THEN
            -- 截取前15个字符作为标题
            title_text := TRIM(SUBSTRING(NEW.content FROM 1 FOR 15));
            IF LENGTH(title_text) = 15 THEN
                title_text := title_text || '...';
            END IF;
            
            -- 更新会话标题
            UPDATE design_sessions 
            SET title = title_text, updated_at = NOW()
            WHERE id = NEW.session_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trigger_update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_design_sessions_updated_at
    BEFORE UPDATE ON design_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_design_requirements_updated_at
    BEFORE UPDATE ON design_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_design_works_updated_at
    BEFORE UPDATE ON design_works
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_handle_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER trigger_auto_generate_session_title
    AFTER INSERT ON conversation_messages
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_session_title();

-- 启用行级安全性
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_work_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- Profiles策略
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Design sessions策略
CREATE POLICY "Users can manage their own sessions" ON design_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Conversation messages策略
CREATE POLICY "Users can manage their own messages" ON conversation_messages
    FOR ALL USING (auth.uid() = (SELECT user_id FROM design_sessions WHERE id = session_id));

-- Design requirements策略
CREATE POLICY "Users can manage their own requirements" ON design_requirements
    FOR ALL USING (auth.uid() = (SELECT user_id FROM design_sessions WHERE id = session_id));

-- Design works策略
CREATE POLICY "Users can manage their own works" ON design_works
    FOR ALL USING (auth.uid() = (SELECT user_id FROM design_sessions WHERE id = session_id));

-- Tags策略（所有用户可读，但只能通过应用程序创建）
CREATE POLICY "Anyone can view tags" ON design_tags
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only authenticated users can create tags" ON design_tags
    FOR INSERT TO authenticated WITH CHECK (true);

-- Work tags策略
CREATE POLICY "Users can manage tags for their works" ON design_work_tags
    FOR ALL USING (auth.uid() = (
        SELECT ds.user_id 
        FROM design_works dw 
        JOIN design_sessions ds ON dw.session_id = ds.id 
        WHERE dw.id = design_work_id
    ));

-- User favorites策略
CREATE POLICY "Users can manage their own favorites" ON user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- 插入一些默认标签
INSERT INTO design_tags (name, category, color) VALUES
('休闲', 'style', '#10b981'),
('商务', 'style', '#3b82f6'),
('运动', 'style', '#f59e0b'),
('时尚', 'style', '#ec4899'),
('简约', 'style', '#6b7280'),
('可爱', 'style', '#f472b6'),
('个性', 'style', '#8b5cf6'),
('条纹', 'pattern', '#ef4444'),
('几何', 'pattern', '#06b6d4'),
('动物', 'pattern', '#84cc16'),
('花卉', 'pattern', '#f97316'),
('抽象', 'pattern', '#a855f7'),
('船袜', 'type', '#14b8a6'),
('中筒袜', 'type', '#eab308'),
('长筒袜', 'type', '#dc2626'),
('过膝袜', 'type', '#9333ea');
