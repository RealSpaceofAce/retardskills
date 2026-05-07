/**
 * GET /api/access?t=<signed_token>
 *
 * Validates a signed retardskill session token (produced by /api/signup
 * and embedded in welcome emails), sets the access cookie, then redirects to
 * /retardskill/skills. Cross-device flow — user signs up on phone, opens email
 * on laptop, this handler sets the cookie on the laptop.
 *
 * Invalid / missing / expired token → 302 to /retardskill?gate=token_invalid
 * Valid token → 302 to /retardskill/skills, with cookie set.
 */

import { NextResponse } from 'next/server';

import {
  RETARDSKILL_SESSION_COOKIE_NAME,
  retardSkillSessionCookieOptions,
  verifyRetardSkillSessionToken,
} from "@/lib/session";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get('t');

  if (!token || !verifyRetardSkillSessionToken(token)) {
    const denied = new URL("/", url);
    denied.searchParams.set('gate', 'token_invalid');
    return NextResponse.redirect(denied, 302);
  }

  const destination = new URL('/skills', url);
  const response = NextResponse.redirect(destination, 302);
  response.cookies.set(RETARDSKILL_SESSION_COOKIE_NAME, token, retardSkillSessionCookieOptions);
  return response;
}
