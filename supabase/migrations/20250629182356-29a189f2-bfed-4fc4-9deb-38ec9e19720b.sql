
-- Add soft delete field to generated_images table
ALTER TABLE public.generated_images 
ADD COLUMN is_hidden_from_user BOOLEAN DEFAULT false;

-- Add index for better query performance
CREATE INDEX idx_generated_images_hidden_from_user 
ON public.generated_images(is_hidden_from_user) 
WHERE is_hidden_from_user = false;

-- Add composite index for user queries with hidden filter
CREATE INDEX idx_generated_images_user_visible 
ON public.generated_images(user_id, is_hidden_from_user, created_at DESC) 
WHERE is_hidden_from_user = false;
