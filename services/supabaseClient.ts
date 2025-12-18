import { createClient } from '@supabase/supabase-js';
import { getEnv } from '../utils/env';

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase URL or Anon Key");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
