'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchAdminJson } from "@/lib/admin-api";

type Review = {
  _id: string;
  email: string;
  firstName?: string;
  role?: string;
  skill: string;
  audited?: string;
  fixed?: string;
  quote?: string;
  recommendScore?: number;
  permissionToShare: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
};

const styles = `
  .ar-root {
    background: #FAFAF7;
    color: #1A1A1A;
    font-family: var(--font-source-serif-4), 'Iowan Old Style', Charter, Georgia, serif;
    font-size: 16px;
    line-height: 1.55;
    min-height: 100vh;
    padding: 56px 24px 96px;
  }
  .ar-page { max-width: 880px; margin: 0 auto; }
  .ar-eyebrow {
    font-family: var(--font-inter), sans-serif;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #4B6BFF;
    font-weight: 700;
    margin-bottom: 16px;
  }
  .ar-title {
    font-family: var(--font-source-serif-4), serif;
    font-weight: 700;
    font-size: 44px;
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
  }
  .ar-tagline {
    font-style: italic;
    color: #4A4A48;
    margin-bottom: 40px;
    font-size: 18px;
  }
  .ar-tabs {
    display: flex;
    gap: 4px;
    border-bottom: 1px solid #E5E3DC;
    margin-bottom: 32px;
  }
  .ar-tab {
    font-family: var(--font-inter), sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 10px 16px;
    background: transparent;
    border: 0;
    border-bottom: 2px solid transparent;
    color: #4A4A48;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .ar-tab.active { color: #1A1A1A; border-bottom-color: #4B6BFF; }
  .ar-tab .count { color: #8A8A86; margin-left: 6px; font-size: 11px; }

  .ar-empty {
    padding: 48px 0;
    text-align: center;
    color: #8A8A86;
    font-style: italic;
  }

  .ar-card {
    border: 1px solid #E5E3DC;
    background: #fff;
    padding: 24px;
    margin-bottom: 16px;
  }
  .ar-card.pending { border-color: #4B6BFF; }
  .ar-card.approved { border-color: #2F5D3A; background: #F6FBF8; }
  .ar-card.rejected { opacity: 0.55; }

  .ar-card-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .ar-name {
    font-family: var(--font-source-serif-4), serif;
    font-weight: 700;
    font-size: 22px;
    color: #1A1A1A;
  }
  .ar-name .email { color: #8A8A86; font-weight: 400; font-size: 14px; margin-left: 8px; }
  .ar-meta {
    font-family: var(--font-inter), sans-serif;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #4A4A48;
    font-weight: 600;
  }
  .ar-meta .skill {
    color: #4B6BFF;
    background: #E1E7FF;
    padding: 3px 8px;
    margin-right: 6px;
  }
  .ar-meta .status {
    padding: 3px 8px;
    border: 1px solid #E5E3DC;
  }
  .ar-meta .status.pending { color: #4B6BFF; border-color: #4B6BFF; }
  .ar-meta .status.approved { color: #2F5D3A; border-color: #2F5D3A; }
  .ar-meta .status.rejected { color: #8A8A86; }

  .ar-field { margin-bottom: 12px; }
  .ar-field-label {
    font-family: var(--font-inter), sans-serif;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 700;
    color: #8A8A86;
    margin-bottom: 4px;
    display: block;
  }
  .ar-field-value {
    font-family: var(--font-source-serif-4), serif;
    font-size: 15px;
    line-height: 1.5;
    color: #1A1A1A;
  }
  .ar-field-value.quote {
    font-style: italic;
    border-left: 2px solid #4B6BFF;
    padding: 4px 14px;
  }
  .ar-field-value.empty { color: #B5B5B0; font-style: italic; }

  .ar-actions {
    display: flex;
    gap: 8px;
    margin-top: 20px;
    flex-wrap: wrap;
  }
  .ar-btn {
    padding: 10px 20px;
    font-family: var(--font-inter), sans-serif;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    border: 1px solid #1A1A1A;
    cursor: pointer;
    background: transparent;
    color: #1A1A1A;
    transition: background 120ms;
  }
  .ar-btn:hover { background: #1A1A1A; color: #FAFAF7; }
  .ar-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .ar-btn-approve { background: #2F5D3A; border-color: #2F5D3A; color: #FAFAF7; }
  .ar-btn-approve:hover { background: #3D7A4A; border-color: #3D7A4A; color: #FAFAF7; }
  .ar-btn-reject { background: transparent; border-color: #C8341B; color: #C8341B; }
  .ar-btn-reject:hover { background: #C8341B; color: #FAFAF7; }
  .ar-btn-undo { font-size: 11px; padding: 6px 12px; }

  .ar-permission {
    font-family: var(--font-inter), sans-serif;
    font-size: 11px;
    color: #8A8A86;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 4px;
  }
  .ar-permission.yes { color: #2F5D3A; }
  .ar-permission.no { color: #C8341B; }

  .ar-loading, .ar-error {
    padding: 32px;
    text-align: center;
    font-style: italic;
    color: #8A8A86;
  }
  .ar-error { color: #C8341B; }

  .ar-footer {
    margin-top: 64px;
    padding-top: 24px;
    border-top: 1px solid #E5E3DC;
    font-family: var(--font-inter), sans-serif;
    font-size: 12px;
    color: #8A8A86;
  }
  .ar-footer a { color: #1A1A1A; border-bottom: 1px solid #E5E3DC; text-decoration: none; }
`;

type Filter = 'pending' | 'approved' | 'rejected' | 'all';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<Filter>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminJson<{ reviews: Review[] }>('/api/admin/reviews');
      setReviews(data.reviews ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchAdminJson<{ reviews: Review[] }>('/api/admin/reviews');
        if (!cancelled) setReviews(data.reviews ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, all: reviews.length };
    for (const r of reviews) c[r.status] += 1;
    return c;
  }, [reviews]);

  const visible = useMemo(() => {
    if (filter === 'all') return reviews;
    return reviews.filter((r) => r.status === filter);
  }, [reviews, filter]);

  async function setStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
    setActingOn(id);
    try {
      await fetchAdminJson(`/api/admin/reviews/${id}`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setActingOn(null);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <main className="ar-root">
        <div className="ar-page">
          <p className="ar-eyebrow">Admin · Retard Skills reviews</p>
          <h1 className="ar-title">Review the reviews.</h1>
          <p className="ar-tagline">Approve to publish on the landing. Reject to hide. Pending stays invisible until you decide.</p>

          <div className="ar-tabs">
            <button
              type="button"
              className={`ar-tab ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending <span className="count">({counts.pending})</span>
            </button>
            <button
              type="button"
              className={`ar-tab ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              Approved <span className="count">({counts.approved})</span>
            </button>
            <button
              type="button"
              className={`ar-tab ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              Rejected <span className="count">({counts.rejected})</span>
            </button>
            <button
              type="button"
              className={`ar-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All <span className="count">({counts.all})</span>
            </button>
          </div>

          {loading && <p className="ar-loading">Loading…</p>}
          {error && <p className="ar-error">Error: {error}</p>}

          {!loading && !error && visible.length === 0 && (
            <p className="ar-empty">No reviews in this view.</p>
          )}

          {!loading && !error && visible.map((r) => (
            <article key={r._id} className={`ar-card ${r.status}`}>
              <div className="ar-card-head">
                <p className="ar-name">
                  {r.firstName ?? 'Anonymous'}
                  <span className="email">· {r.email}</span>
                </p>
                <p className="ar-meta">
                  <span className="skill">{r.skill}</span>
                  <span className={`status ${r.status}`}>{r.status}</span>
                </p>
              </div>

              {r.role && (
                <div className="ar-field">
                  <span className="ar-field-label">Role</span>
                  <p className="ar-field-value">{r.role}</p>
                </div>
              )}

              {r.audited && (
                <div className="ar-field">
                  <span className="ar-field-label">What they audited</span>
                  <p className="ar-field-value">{r.audited}</p>
                </div>
              )}

              {r.fixed && (
                <div className="ar-field">
                  <span className="ar-field-label">What they fixed</span>
                  <p className="ar-field-value">{r.fixed}</p>
                </div>
              )}

              <div className="ar-field">
                <span className="ar-field-label">Public quote</span>
                {r.quote ? (
                  <p className="ar-field-value quote">&ldquo;{r.quote}&rdquo;</p>
                ) : (
                  <p className="ar-field-value empty">No public quote provided.</p>
                )}
              </div>

              <div className="ar-field">
                <span className="ar-field-label">Score</span>
                <p className="ar-field-value">{r.recommendScore ? `${r.recommendScore} / 10` : '—'}</p>
              </div>

              <p className={`ar-permission ${r.permissionToShare ? 'yes' : 'no'}`}>
                {r.permissionToShare ? '✓ Permission to share publicly' : '✗ Will not display on landing — no permission'}
              </p>

              <p className="ar-permission">
                Submitted {formatDate(r.submittedAt)}
                {r.reviewedAt ? ` · Reviewed ${formatDate(r.reviewedAt)}` : ''}
              </p>

              <div className="ar-actions">
                {r.status !== 'approved' && (
                  <button
                    type="button"
                    className="ar-btn ar-btn-approve"
                    onClick={() => setStatus(r._id, 'approved')}
                    disabled={actingOn === r._id}
                  >
                    {actingOn === r._id ? 'Saving…' : '✓ Approve'}
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button
                    type="button"
                    className="ar-btn ar-btn-reject"
                    onClick={() => setStatus(r._id, 'rejected')}
                    disabled={actingOn === r._id}
                  >
                    Reject
                  </button>
                )}
                {r.status !== 'pending' && (
                  <button
                    type="button"
                    className="ar-btn ar-btn-undo"
                    onClick={() => setStatus(r._id, 'pending')}
                    disabled={actingOn === r._id}
                  >
                    ↺ Back to pending
                  </button>
                )}
              </div>
            </article>
          ))}

          <div className="ar-footer">
            <p>
              <Link href="/">View landing</Link> · approved reviews appear publicly within seconds.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
