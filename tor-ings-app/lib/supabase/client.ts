import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("Client.ts - URL:", supabaseUrl ? "present" : "missing")
console.log("Client.ts - Key:", supabaseKey ? "present" : "missing")

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const createClient = () => {
  console.log("Creating Supabase client with URL:", supabaseUrl.substring(0, 20) + "...")
  return createBrowserClient(supabaseUrl, supabaseKey)
}