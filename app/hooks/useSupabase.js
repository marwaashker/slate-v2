import { useAuth } from '@clerk/nextjs'
import { useMemo } from 'react'
import { createClerkSupabaseClient } from '../lib/supabase'

export function useSupabase() {
  const { getToken } = useAuth()

  const supabase = useMemo(
    () => createClerkSupabaseClient(getToken),
    []
  )

  return supabase
}