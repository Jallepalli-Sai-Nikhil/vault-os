import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dummy.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'dummy_publishable_key';
const supabaseSecretKey = import.meta.env.VITE_SUPABASE_SECRET_KEY || '';

// Standard client for most operations
export const supabase = createClient(supabaseUrl, supabasePublishableKey);

// Admin client (ONLY for use in Admin dashboard for prototyping user creation)
// WARNING: Do not use this in production. Use Edge Functions instead.
export const supabaseAdmin = supabaseSecretKey 
  ? createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }) 
  : null;
