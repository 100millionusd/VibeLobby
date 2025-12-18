import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.warn("WARNING: Missing SUPABASE_SERVICE_ROLE_KEY. Backend writes will fail.");
}

// Create a Supabase client with the SERVICE_ROLE key.
// This client can bypass Row Level Security (RLS).
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
