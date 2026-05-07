'use client';

import { useState } from 'react';

const formStyles = `
  .rv-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
    text-align: left;
  }
  .rv-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 600px) { .rv-row { grid-template-columns: 1fr; } }
  .rv-field { display: flex; flex-direction: column; gap: 6px; }
  .rv-label {
    font-family: var(--font-sans);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 700;
    color: var(--ink-soft);
  }
  .rv-label .req { color: var(--accent); margin-left: 4px; }
  .rv-input, .rv-select, .rv-textarea {
    padding: 12px 14px;
    font-family: var(--font-serif);
    font-size: 16px;
    color: var(--ink);
    background: #fff;
    border: 1px solid var(--ink);
    border-radius: 0;
    outline: none;
    width: 100%;
  }
  .rv-input:focus, .rv-select:focus, .rv-textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(75, 107, 255, 0.18);
  }
  .rv-textarea { resize: vertical; min-height: 96px; line-height: 1.5; }
  .rv-checkbox {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-family: var(--font-serif);
    font-size: 15px;
    line-height: 1.5;
    color: var(--ink);
    cursor: pointer;
  }
  .rv-checkbox input { margin-top: 4px; flex-shrink: 0; cursor: pointer; }
  .rv-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .rv-submit {
    padding: 14px 28px;
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #FAFAF7;
    background: var(--accent);
    border: 1px solid var(--accent);
    cursor: pointer;
    transition: background 120ms, transform 120ms;
  }
  .rv-submit:hover { background: #5C79FF; transform: translateY(-1px); }
  .rv-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .rv-status {
    font-family: var(--font-sans);
    font-size: 14px;
    padding: 12px 16px;
    line-height: 1.5;
  }
  .rv-status.success { background: #f0fef4; border-left: 3px solid var(--ok); color: var(--ok); }
  .rv-status.error   { background: #fef0f0; border-left: 3px solid #C8341B; color: #C8341B; }
`;

const SKILLS = [
  { id: 'marketing', label: 'Marketing' },
  { id: 'goals', label: 'Goals' },
  { id: 'pitch', label: 'Pitch' },
  { id: 'bio', label: 'Bio' },
  { id: 'resume', label: 'Resume' },
  { id: 'idea', label: 'Idea' },
];

export default function ReviewForm() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [role, setRole] = useState('');
  const [skill, setSkill] = useState('marketing');
  const [audited, setAudited] = useState('');
  const [fixed, setFixed] = useState('');
  const [quote, setQuote] = useState('');
  const [recommendScore, setRecommendScore] = useState<number | ''>('');
  const [permissionToShare, setPermissionToShare] = useState(true);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setStatus('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/review/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          firstName: firstName.trim() || undefined,
          role: role.trim() || undefined,
          skill,
          audited: audited.trim() || undefined,
          fixed: fixed.trim() || undefined,
          quote: quote.trim() || undefined,
          recommendScore: typeof recommendScore === 'number' ? recommendScore : undefined,
          permissionToShare,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || 'Something went wrong. Try again.');
      }

      const data = (await response.json()) as { message?: string };
      setStatus('success');
      setMessage(data.message ?? 'Thanks for the review. Reviewed within 48 hours before going public.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    }
  }

  if (status === 'success') {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: formStyles }} />
        <p className="rv-status success">{message}</p>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: formStyles }} />
      <form className="rv-form" onSubmit={handleSubmit}>
        <div className="rv-row">
          <div className="rv-field">
            <label className="rv-label" htmlFor="rv-email">Email <span className="req">*</span></label>
            <input
              id="rv-email"
              type="email"
              required
              className="rv-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'submitting'}
            />
          </div>
          <div className="rv-field">
            <label className="rv-label" htmlFor="rv-skill">Which skill <span className="req">*</span></label>
            <select
              id="rv-skill"
              className="rv-select"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              disabled={status === 'submitting'}
            >
              {SKILLS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rv-row">
          <div className="rv-field">
            <label className="rv-label" htmlFor="rv-firstname">First name</label>
            <input
              id="rv-firstname"
              type="text"
              className="rv-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={status === 'submitting'}
              placeholder="Sarah"
            />
          </div>
          <div className="rv-field">
            <label className="rv-label" htmlFor="rv-role">Role / business</label>
            <input
              id="rv-role"
              type="text"
              className="rv-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={status === 'submitting'}
              placeholder="Founder, agency owner, coach…"
            />
          </div>
        </div>

        <div className="rv-field">
          <label className="rv-label" htmlFor="rv-audited">What you audited</label>
          <input
            id="rv-audited"
            type="text"
            className="rv-input"
            value={audited}
            onChange={(e) => setAudited(e.target.value)}
            disabled={status === 'submitting'}
            placeholder="My homepage, my pricing page, my pitch deck…"
          />
        </div>

        <div className="rv-field">
          <label className="rv-label" htmlFor="rv-fixed">What you fixed after running it</label>
          <textarea
            id="rv-fixed"
            className="rv-textarea"
            value={fixed}
            onChange={(e) => setFixed(e.target.value)}
            disabled={status === 'submitting'}
            placeholder="Killed three pieces of jargon, rewrote the hero, dropped the second CTA…"
            rows={3}
          />
        </div>

        <div className="rv-field">
          <label className="rv-label" htmlFor="rv-quote">A quote we can share (optional)</label>
          <textarea
            id="rv-quote"
            className="rv-textarea"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            disabled={status === 'submitting'}
            placeholder="One line we can put on the landing if approved."
            rows={2}
          />
        </div>

        <div className="rv-field">
          <label className="rv-label" htmlFor="rv-score">Would you recommend it? (1–10)</label>
          <input
            id="rv-score"
            type="number"
            min={1}
            max={10}
            className="rv-input"
            value={recommendScore}
            onChange={(e) => setRecommendScore(e.target.value ? Number(e.target.value) : '')}
            disabled={status === 'submitting'}
            style={{ maxWidth: 120 }}
          />
        </div>

        <label className="rv-checkbox">
          <input
            type="checkbox"
            checked={permissionToShare}
            onChange={(e) => setPermissionToShare(e.target.checked)}
            disabled={status === 'submitting'}
          />
          <span>You can share my quote, first name, and role on the landing page. (Email never shown.)</span>
        </label>

        <div className="rv-actions">
          <button type="submit" className="rv-submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Sending...' : 'Submit review →'}
          </button>
        </div>

        {status === 'error' && <p className="rv-status error">{message}</p>}
      </form>
    </>
  );
}
