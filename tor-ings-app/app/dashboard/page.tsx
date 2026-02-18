import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export default async function Dashboard() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not logged in</div>
  }

  const { data: account } = await supabase
    .from("accounts")
    .select("tier")
    .eq("user_id", user.id)
    .single()

  return <div>Your tier: {account?.tier}</div>
}
