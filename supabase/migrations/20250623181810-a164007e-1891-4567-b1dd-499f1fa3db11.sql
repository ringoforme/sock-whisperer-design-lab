
-- First, let's check and fix the RLS policies for all tables

-- Ensure RLS is enabled on all tables
ALTER TABLE public.design_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expanded_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.design_sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON public.design_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.design_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.design_sessions;

DROP POLICY IF EXISTS "Users can view messages from their sessions" ON public.conversation_messages;
DROP POLICY IF EXISTS "Users can create messages in their sessions" ON public.conversation_messages;

DROP POLICY IF EXISTS "Users can view briefs from their sessions" ON public.design_briefs;
DROP POLICY IF EXISTS "Users can create briefs in their sessions" ON public.design_briefs;
DROP POLICY IF EXISTS "Users can update briefs from their sessions" ON public.design_briefs;

DROP POLICY IF EXISTS "Users can view prompts from their sessions" ON public.expanded_prompts;
DROP POLICY IF EXISTS "Users can create prompts in their sessions" ON public.expanded_prompts;

DROP POLICY IF EXISTS "Users can view images from their sessions" ON public.generated_images;
DROP POLICY IF EXISTS "Users can create images in their sessions" ON public.generated_images;
DROP POLICY IF EXISTS "Users can update images from their sessions" ON public.generated_images;

-- Create comprehensive RLS policies for design_sessions
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

-- Create comprehensive RLS policies for conversation_messages
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

-- Create comprehensive RLS policies for design_briefs
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

-- Create comprehensive RLS policies for expanded_prompts
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

-- Create comprehensive RLS policies for generated_images
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
