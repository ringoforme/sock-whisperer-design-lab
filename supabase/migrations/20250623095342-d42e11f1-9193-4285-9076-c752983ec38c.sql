
-- 为 design_sessions 表添加会话标题字段
ALTER TABLE public.design_sessions 
ADD COLUMN IF NOT EXISTS session_title TEXT;

-- 为 generated_images 表添加缩略图字段和显示顺序
ALTER TABLE public.generated_images 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_design_sessions_user_id_created_at 
ON public.design_sessions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_images_session_id_order 
ON public.generated_images(session_id, display_order DESC);

-- 创建函数来自动生成会话标题
CREATE OR REPLACE FUNCTION generate_session_title(user_prompt TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    title TEXT;
BEGIN
    -- 提取前20个字符并清理
    title := TRIM(SUBSTRING(user_prompt FROM 1 FOR 20));
    
    -- 如果标题太短，使用默认值
    IF LENGTH(title) < 5 THEN
        title := '袜子设计';
    END IF;
    
    -- 移除末尾的标点符号
    title := REGEXP_REPLACE(title, '[。，！？；：""''（）【】\s]+$', '');
    
    -- 确保不为空
    IF LENGTH(TRIM(title)) = 0 THEN
        title := '袜子设计';
    END IF;
    
    RETURN title;
END;
$$;
