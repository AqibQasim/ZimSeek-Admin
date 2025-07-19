import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  console.log("Middleware - Token:", token, "Path:", request.nextUrl.pathname);
  const protectedPaths = ["/","/sellers", "/buyers", "/products", "/orders"];
  if (protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path)) && !token) {
    console.log("Redirecting to /login due to missing token");
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/","/sellers/:path*", "/buyers/:path*", "/products/:path*", "/orders/:path*"],
};