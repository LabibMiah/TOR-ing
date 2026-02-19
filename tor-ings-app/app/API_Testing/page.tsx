"use client"

import { createClient } from "@supabase/supabase-js";
import { Database } from '@/lib/supabase/database.types'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {
  const { data, error } = await supabase.from('Equipment').select('*')

  if (error) {
    console.error('error', error)
  }

  return (
    <div>
      <h1>API Testing</h1>

      {data && (
        <ul>
          {data.map((Equipment) => (
            <li key={Equipment.Equipment_ID}>{Equipment.Name}</li>
          ))}
        </ul>
        
      )}
    </div>
  )
}