import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// this creates a Supabase client that uses Clerk's token
export function createClerkSupabaseClient(getToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        // get Clerk's token before every request
        const clerkToken = await getToken({ template: 'supabase' })

        const headers = new Headers(options?.headers)
        if (clerkToken) {
          headers.set('Authorization', `Bearer ${clerkToken}`)
        }

        return fetch(url, { ...options, headers })
      }
    }
  })
}