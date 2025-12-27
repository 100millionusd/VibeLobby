-- Add Ghost Mode column to Users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_ghost_mode boolean DEFAULT false;

-- Add Digital Keys column (JSONB) just in case it's missing, as logic depends on it
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS digital_keys jsonb DEFAULT '[]'::jsonb;

SELECT 'Columns added successfully' as status;
