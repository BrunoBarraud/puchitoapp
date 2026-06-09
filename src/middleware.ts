import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/transactions", "/categories", "/budgets", "/reports", "/settings"];
const authPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const session = request.cookies.get("puchito_app_session")?.value;
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPath && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/categories/:path*", "/budgets/:path*", "/reports/:path*", "/settings/:path*", "/login", "/register"]
};
