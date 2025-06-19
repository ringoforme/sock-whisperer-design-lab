
-- 临时禁用所有相关表的RLS策略进行测试
ALTER TABLE public.design_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_briefs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expanded_prompts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images DISABLE ROW LEVEL SECURITY;
