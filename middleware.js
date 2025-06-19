export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
