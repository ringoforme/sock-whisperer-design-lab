
-- Add composite indexes for generated_images table to optimize user design queries
CREATE INDEX IF NOT EXISTS idx_generated_images_user_status_edited 
ON public.generated_images (user_id, generation_status, is_edited);

CREATE INDEX IF NOT EXISTS idx_generated_images_user_status_vectorized 
ON public.generated_images (user_id, generation_status, is_vectorized);

CREATE INDEX IF NOT EXISTS idx_generated_images_user_status_downloaded 
ON public.generated_images (user_id, generation_status, is_downloaded);

-- Add index for design_sessions to optimize user session queries
CREATE INDEX IF NOT EXISTS idx_design_sessions_user_status 
ON public.design_sessions (user_id, status);

-- Add index for conversation_messages to optimize session message queries
CREATE INDEX IF NOT EXISTS idx_conversation_messages_session_role 
ON public.conversation_messages (session_id, role);

-- Create optimized view for design library data
CREATE OR REPLACE VIEW public.user_design_library AS
SELECT 
  gi.id,
  gi.user_id,
  gi.image_url,
  gi.design_name,
  gi.created_at,
  gi.is_edited,
  gi.is_vectorized,
  gi.is_downloaded,
  gi.generation_status,
  gi.session_id,
  CASE 
    WHEN gi.is_edited = true THEN 'edited'
    WHEN gi.is_vectorized = true THEN 'vectorized'
    WHEN gi.is_downloaded = true THEN 'downloaded'
    ELSE 'drafts'
  END as category
FROM public.generated_images gi
WHERE gi.generation_status = 'success';

-- Create optimized view for session history with message counts
CREATE OR REPLACE VIEW public.session_history_view AS
SELECT 
  ds.id,
  ds.user_id,
  ds.initial_idea,
  ds.session_title,
  ds.status,
  ds.created_at,
  ds.updated_at,
  COALESCE(msg_count.user_message_count, 0) as user_message_count
FROM public.design_sessions ds
LEFT JOIN (
  SELECT 
    session_id,
    COUNT(*) as user_message_count
  FROM public.conversation_messages 
  WHERE role = 'user'
  GROUP BY session_id
) msg_count ON ds.id = msg_count.session_id;
