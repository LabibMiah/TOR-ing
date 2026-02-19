import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() { 
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    const { data: { session } } = await supabase.auth.getSession();
    
    return NextResponse.json({ 
      hasSession: !!session,
      email: session?.user?.email 
    });
  } catch (err) {
    return NextResponse.json({ hasSession: false, error: String(err) });
  }
}