// app/api/check-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Log all cookies for debugging
    const allCookies = cookieStore.getAll();
    console.log("All cookies in check-session:", allCookies.map(c => c.name));
    
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
      email: session?.user?.email,
      cookieNames: allCookies.map(c => c.name)
    });
  } catch (err) {
    console.error("Check session error:", err);
    return NextResponse.json({ 
      hasSession: false, 
      error: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}