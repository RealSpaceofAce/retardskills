'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const formStyles = `
  .rs-form { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
  .rs-form input[type='email'] {
    flex: 1 1 280px;
    min-width: 200px;
    padding: 14px 18px;
    font-family: var(--font-serif), serif;
    font-size: 17px;
    color: var(--ink);
    background: var(--card);
    border: 1px solid var(--ink);
    border-radius: 0;
    outline: none;
    text-align: center;
  }
  .rs-form input[type='email']::placeholder { color: var(--ink-faint); }
  .rs-form input[type='email']:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(75, 107, 255, 0.18);
  }
  .rs-form button {
    padding: 14px 28px;
    font-family: var(--font-sans), sans-serif;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #FAFAF7;
    background: var(--accent);
    border: 1px solid var(--accent);
    cursor: pointer;
    transition: background 120ms, transform 120ms;
    flex-shrink: 0;
  }
  .rs-form button:hover { background: #5C79FF; border-color: #5C79FF; transform: translateY(-1px); }
  .rs-form button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .rs-status {
    font-family: var(--font-sans), sans-serif;
    font-size: 14px;
    margin-top: 16px;
    padding: 12px 16px;
    line-height: 1.5;
    text-align: center;
  }
  .rs-status.error   { background: var(--card); border-left: 3px solid #C8341B; color: #C8341B; }
  .rs-status.success { background: var(--card); border-left: 3px solid var(--ok); color: var(--ok); }
  :root[data-rs-theme='dark'] .rs-status.error   { color: #FF8A78; }
  :root[data-rs-theme='dark'] .rs-status.success { color: #88D199; }
  .rs-status a {
    color: inherit;
    text-decoration: underline;
    font-weight: 700;
  }
`;

export default function RetardSkillSignup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setStatus('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || 'Something went wrong. Try again.');
      }

      const data = (await response.json()) as { redirect?: string };
      setStatus('success');
      setMessage("You're in. Skill access is one click away.");

      // Brief delay so the success state is visible, then route to the skills page.
      setTimeout(() => {
        router.push(data.redirect ?? '/skills');
      }, 600);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: formStyles }} />
      <form className="rs-form" action="/api/signup" method="post" onSubmit={handleSubmit}>
        <input
          id="rs-email-input"
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@yourbusiness.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'submitting'}
          aria-label="Your email"
        />
        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending...' : 'Get the skill →'}
        </button>
      </form>
      {status === 'success' && (
        <p className="rs-status success">
          {message} Redirecting to your skills...
        </p>
      )}
      {status === 'error' && <p className="rs-status error">{message}</p>}
    </>
  );
}
