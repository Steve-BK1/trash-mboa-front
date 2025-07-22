import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // (Optionnel) Ici, tu pourrais vérifier la validité du token côté serveur
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
}; 