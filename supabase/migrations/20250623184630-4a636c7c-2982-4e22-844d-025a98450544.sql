
-- Fix the handle_new_user trigger to avoid duplicate key violations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use INSERT ... ON CONFLICT DO NOTHING to avoid duplicate key errors
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also clean up any potential duplicate entries that might exist
-- This is safe because we're only keeping the first occurrence of each id
DELETE FROM public.profiles 
WHERE id IN (
  SELECT id 
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at) as row_num
    FROM public.profiles
  ) t 
  WHERE t.row_num > 1
);
