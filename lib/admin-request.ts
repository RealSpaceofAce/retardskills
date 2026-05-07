import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from './admin-session';

export async function isAdminAuthenticated() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

export async function requireAdminRequest() {
  if (await isAdminAuthenticated()) {
    return null;
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
