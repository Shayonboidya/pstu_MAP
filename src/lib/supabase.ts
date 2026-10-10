import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if Supabase is properly configured
const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file.\n' +
    'Some features requiring database access will not work.'
  )
}

// Create client even if not configured - errors will occur on operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to check if Supabase is configured before operations
export function isSupabaseAvailable(): boolean {
  return isSupabaseConfigured
}
