import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // Add this console log
  console.log("🔒 MIDDLEWARE RUNNING for path:", request.nextUrl.pathname);
  
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Log all cookies
  console.log("🍪 Cookies:", request.cookies.getAll().map(c => c.name));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  
  console.log("👤 Session exists:", !!session);

  if (!session) {
    console.log("🚫 No session, redirecting to login");
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  console.log("✅ Session found, allowing access");
  return response;
}

export const config = { 
  matcher: ["/dashboard/:path*"] 
};