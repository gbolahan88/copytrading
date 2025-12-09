import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // If no token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // If token exists → allow access
  return NextResponse.next();
}

// Protect these routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
