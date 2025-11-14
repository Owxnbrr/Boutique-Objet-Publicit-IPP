import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createMiddlewareClient(
    { req, res },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = new URL(req.url);
  const isLogin = url.pathname === "/login";

  if (url.pathname.startsWith("/dashboard") && !session) {
    const redirect = new URL("/login", url.origin);
    redirect.searchParams.set("redirectedFrom", url.pathname + url.search);
    return NextResponse.redirect(redirect);
  }

  if (isLogin && session) {
    return NextResponse.redirect(new URL("/dashboard", url.origin));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
