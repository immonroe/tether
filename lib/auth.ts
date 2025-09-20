/**
 * @fileoverview Authentication utilities and user management
 * 
 * This file is part of the Tether AI learning platform.
 * authentication utilities and user management for the application.
 */

import { createBrowserClient, createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { User } from '@supabase/supabase-js'

export const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const createServerClient = () => createSupabaseServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        return cookies().get(name)?.value
      },
    },
  }
)

export interface AuthUser {
  id: string
  email?: string
  name?: string
  isGuest: boolean
}

export const mapSupabaseUser = (user: User | null): AuthUser | null => {
  if (!user) return null
  
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.email?.split('@')[0],
    isGuest: false
  }
}
