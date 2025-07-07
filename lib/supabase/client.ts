import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      // During build time, return a dummy client
      console.warn('Supabase environment variables not found during build')
      return null as any
    }
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
} 