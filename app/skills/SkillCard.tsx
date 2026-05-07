'use client';

import { useState } from 'react';

type SkillCardProps = {
  id: string;
  name: string;
  status: 'live' | 'coming';
  description: string;
  filePath?: string;       // /retardskill/<file>.md (only for live skills)
  fileBytesUrl?: string;   // same as filePath, used for fetching the text
};

export default function SkillCard({ id, name, status, description, filePath, fileBytesUrl }: SkillCardProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'failed'>('idle');

  async function handleCopy() {
    if (!fileBytesUrl) return;
    setCopyState('copying');
    try {
      const response = await fetch(fileBytesUrl);
      if (!response.ok) throw new Error('Could not load skill file.');
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2400);
    } catch {
      setCopyState('failed');
      setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const buttonLabel = (() => {
    if (copyState === 'copying') return 'Copying...';
    if (copyState === 'copied') return '✓ Copied to clipboard';
    if (copyState === 'failed') return 'Failed — try download instead';
    return 'Copy skill →';
  })();

  return (
    <article id={id} className={`sk-card ${status === 'coming' ? 'sk-card-coming' : ''}`}>
      <div className="sk-card-head">
        <h3 className="sk-card-name">Retard Skill — {name}</h3>
        <span className={`sk-status ${status === 'live' ? 'sk-status-live' : 'sk-status-coming'}`}>
          {status === 'live' ? '✓ Live' : 'Soon'}
        </span>
      </div>
      <p className="sk-card-desc">{description}</p>

      {status === 'live' && filePath && (
        <>
          <div className="sk-actions">
            <button
              type="button"
              className="sk-btn sk-btn-primary"
              onClick={handleCopy}
              disabled={copyState === 'copying'}
            >
              {buttonLabel}
            </button>
            <a href={filePath} download className="sk-btn sk-btn-secondary">
              Download .md
            </a>
          </div>

          <details className="sk-howto">
            <summary>How to install</summary>
            <div className="sk-howto-body">
              <p><strong>Claude / Codex / Cursor:</strong> click <em>Copy skill</em> above, paste it as a system prompt or custom instruction, then ask &ldquo;run this on my homepage: yourwebsite.com.&rdquo;</p>
              <p><strong>Claude Code:</strong> save the file to <code>~/.claude/skills/retardskill-{id}/SKILL.md</code>, restart Claude Code, then run <code>retardmaxx [URL]</code>.</p>
              <p><strong>Anywhere else:</strong> read the file as a 20-point checklist and audit your copy manually.</p>
              <p style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed var(--rule)' }}><strong>Auto-updates.</strong> The file pulls the latest checks from <code>retardskills.com/skill/{id}/latest.md</code> on every run. Install once — new checks ship to you forever.</p>
            </div>
          </details>
        </>
      )}
    </article>
  );
}
