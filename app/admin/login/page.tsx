import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-session';
import { getSafeRedirectPath } from '@/lib/security';

export const metadata = {
  title: 'Admin login — Retard Skills',
  robots: { index: false, follow: false },
};

const styles = `
  body { background: #FAFAF7; }
  .al-page { max-width: 360px; margin: 96px auto; padding: 24px; font-family: var(--font-source-serif-4), serif; }
  .al-eyebrow { font-family: var(--font-inter), sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em; color: #4B6BFF; font-weight: 700; margin-bottom: 14px; }
  h1 { font-family: var(--font-big-shoulders), sans-serif; font-weight: 900; text-transform: uppercase; font-size: 56px; line-height: 0.9; letter-spacing: -0.025em; margin: 0 0 24px; }
  form { display: flex; flex-direction: column; gap: 12px; }
  input[type='password'] { padding: 12px 16px; font-size: 17px; font-family: var(--font-source-serif-4), serif; border: 1px solid #1A1A1A; background: #fff; }
  button { padding: 12px 16px; font-family: var(--font-inter), sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #FAFAF7; background: #4B6BFF; border: 1px solid #4B6BFF; cursor: pointer; }
  .al-error { color: #C8341B; font-size: 13px; }
`;

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const nextPath = getSafeRedirectPath(params.next, '/admin/reviews');
  const error = typeof params.error === 'string' ? params.error : null;

  const cookieStore = await cookies();
  const existing = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (verifyAdminSessionToken(existing)) {
    redirect(nextPath);
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <main className="al-page">
        <p className="al-eyebrow">Retard Skills · admin</p>
        <h1>Sign in.</h1>
        {error === 'invalid' && <p className="al-error">Invalid password.</p>}
        <form action="/api/admin/login" method="post">
          <input type="hidden" name="next" value={nextPath} />
          <input type="password" name="password" placeholder="Admin password" autoFocus required />
          <button type="submit">Sign in →</button>
        </form>
      </main>
    </>
  );
}
