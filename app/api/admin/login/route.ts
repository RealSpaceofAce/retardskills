/**
 * POST /api/admin/login
 * Form-encoded body: { password, next? }
 * On valid password: set admin session cookie + 302 to next path.
 * On invalid: 302 to /admin/login?error=invalid.
 */
import { NextResponse } from 'next/server';

import {
  ADMIN_SESSION_COOKIE_NAME,
  adminSessionCookieOptions,
  createAdminSessionToken,
  isValidAdminPassword,
} from '@/lib/admin-session';

export async function POST(request: Request): Promise<Response> {
  const url = new URL(request.url);
  let password = '';
  let next = '/admin/reviews';

  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const body = await request.formData();
    password = String(body.get('password') ?? '');
    const nextField = body.get('next');
    if (typeof nextField === 'string' && nextField.startsWith('/')) next = nextField;
  } else {
    const body = (await request.json().catch(() => ({}))) as { password?: string; next?: string };
    password = body.password ?? '';
    if (body.next && body.next.startsWith('/')) next = body.next;
  }

  if (!password || !isValidAdminPassword(password)) {
    const failed = new URL('/admin/login', url);
    failed.searchParams.set('error', 'invalid');
    failed.searchParams.set('next', next);
    return NextResponse.redirect(failed, 303);
  }

  const token = createAdminSessionToken();
  const target = new URL(next, url);
  const response = NextResponse.redirect(target, 303);
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, token, adminSessionCookieOptions);
  return response;
}
