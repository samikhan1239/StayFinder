export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  console.log("Middleware: Path:", req.nextUrl.pathname);
  console.log("Middleware: Proceeding to next");
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
