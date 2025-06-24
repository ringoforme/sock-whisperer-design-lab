
-- Add status tracking fields to generated_images table
ALTER TABLE public.generated_images 
ADD COLUMN is_edited BOOLEAN DEFAULT false,
ADD COLUMN is_vectorized BOOLEAN DEFAULT false,
ADD COLUMN is_downloaded BOOLEAN DEFAULT false;

-- Add user_id to generated_images for user data isolation
ALTER TABLE public.generated_images 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update existing records to link them to users via sessions
UPDATE public.generated_images 
SET user_id = ds.user_id 
FROM public.design_sessions ds 
WHERE generated_images.session_id = ds.id;

-- Make user_id not null after updating existing records
ALTER TABLE public.generated_images 
ALTER COLUMN user_id SET NOT NULL;

-- Enable RLS on generated_images
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for generated_images
CREATE POLICY "Users can view their own images" 
  ON public.generated_images 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own images" 
  ON public.generated_images 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own images" 
  ON public.generated_images 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images" 
  ON public.generated_images 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_generated_images_user_id ON public.generated_images(user_id);
CREATE INDEX idx_generated_images_is_edited ON public.generated_images(is_edited) WHERE is_edited = true;
CREATE INDEX idx_generated_images_is_vectorized ON public.generated_images(is_vectorized) WHERE is_vectorized = true;
CREATE INDEX idx_generated_images_is_downloaded ON public.generated_images(is_downloaded) WHERE is_downloaded = true;
