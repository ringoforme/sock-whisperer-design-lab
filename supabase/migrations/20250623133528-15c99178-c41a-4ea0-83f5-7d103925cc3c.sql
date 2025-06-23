
-- 为 design_sessions 表添加 RLS 策略
ALTER TABLE public.design_sessions ENABLE ROW LEVEL SECURITY;

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

-- 为 conversation_messages 表添加 RLS 策略
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their sessions" 
  ON public.conversation_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = conversation_messages.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their sessions" 
  ON public.conversation_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = conversation_messages.session_id 
      AND user_id = auth.uid()
    )
  );

-- 为 generated_images 表添加 RLS 策略
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view images from their sessions" 
  ON public.generated_images 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = generated_images.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create images in their sessions" 
  ON public.generated_images 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = generated_images.session_id 
      AND user_id = auth.uid()
    )
  );

-- 为 design_briefs 表添加 RLS 策略
ALTER TABLE public.design_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view briefs from their sessions" 
  ON public.design_briefs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = design_briefs.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create briefs in their sessions" 
  ON public.design_briefs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = design_briefs.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update briefs in their sessions" 
  ON public.design_briefs 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = design_briefs.session_id 
      AND user_id = auth.uid()
    )
  );

-- 为 expanded_prompts 表添加 RLS 策略
ALTER TABLE public.expanded_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view prompts from their sessions" 
  ON public.expanded_prompts 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = expanded_prompts.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create prompts in their sessions" 
  ON public.expanded_prompts 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.design_sessions 
      WHERE id = expanded_prompts.session_id 
      AND user_id = auth.uid()
    )
  );
