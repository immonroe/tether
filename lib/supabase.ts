import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Debug logging (can be removed in production)
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase environment check:')
  console.log('- URL:', supabaseUrl ? 'Set' : 'Missing')
  console.log('- Anon Key:', supabaseAnonKey ? 'Set' : 'Missing')
  console.log('- Service Key:', supabaseServiceKey ? 'Set' : 'Missing')
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file:\n' +
    '- NEXT_PUBLIC_SUPABASE_URL\n' +
    '- NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey, // Fallback to anon key if service key missing
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
