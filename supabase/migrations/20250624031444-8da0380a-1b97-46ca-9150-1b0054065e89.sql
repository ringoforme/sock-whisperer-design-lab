
-- Add message_id to generated_images table to create precise image-message association
ALTER TABLE public.generated_images 
ADD COLUMN message_id UUID REFERENCES public.conversation_messages(id);

-- Add index for better performance
CREATE INDEX idx_generated_images_message_id ON public.generated_images(message_id);

-- Add a helper function to get session info by image ID for design library navigation
CREATE OR REPLACE FUNCTION public.get_session_by_image_id(image_id UUID)
RETURNS TABLE (
  session_id UUID,
  session_title TEXT,
  message_id UUID
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    gi.session_id,
    ds.session_title,
    gi.message_id
  FROM public.generated_images gi
  JOIN public.design_sessions ds ON gi.session_id = ds.id
  WHERE gi.id = image_id;
$$;
