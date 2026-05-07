/**
 * Reviews — server component that fetches approved reviews from Convex
 * and renders them on the landing page. Renders nothing if there are
 * no approved reviews yet (don't show empty social-proof scaffolding).
 */

import { fetchQuery } from 'convex/nextjs';
import { makeFunctionReference } from 'convex/server';
import type { FunctionReference } from 'convex/server';

const listApprovedRef = makeFunctionReference<'query'>('retardSkillReviews:listApproved') as FunctionReference<'query'>;

const styles = `
  .rs-reviews {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin: 32px auto 0;
    max-width: 920px;
    text-align: left;
  }
  @media (max-width: 700px) { .rs-reviews { grid-template-columns: 1fr; } }
  .rs-review-card {
    border: 1px solid var(--rule);
    padding: 24px;
    background: #fff;
  }
  .rs-review-quote {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 16px;
    line-height: 1.55;
    color: var(--ink);
    margin-bottom: 16px;
    border-left: 2px solid var(--accent);
    padding: 4px 14px;
  }
  .rs-review-attr {
    font-family: var(--font-sans);
    font-size: 12px;
    color: var(--ink-soft);
    font-weight: 500;
  }
  .rs-review-attr strong { color: var(--ink); font-weight: 700; }
  .rs-review-attr .skill {
    color: var(--accent);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 11px;
    margin-left: 6px;
  }
`;

type Review = {
  firstName: string;
  role: string;
  skill: string;
  quote: string;
  recommendScore?: number;
};

export default async function Reviews() {
  let reviews: Review[] = [];
  try {
    reviews = ((await fetchQuery(listApprovedRef, {})) as Review[] | null) ?? [];
  } catch {
    // Convex unavailable — render nothing.
    return null;
  }

  if (reviews.length === 0) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <section className="rs-section rs-section-wide" style={{ marginBottom: 56 }}>
        <p className="rs-section-eyebrow">From the people running it</p>
        <h2>What they <em>fixed</em>.</h2>
        <div className="rs-reviews">
          {reviews.slice(0, 4).map((r, i) => (
            <article key={i} className="rs-review-card">
              <p className="rs-review-quote">&ldquo;{r.quote}&rdquo;</p>
              <p className="rs-review-attr">
                <strong>{r.firstName}</strong>
                {r.role ? `, ${r.role}` : ''}
                <span className="skill">· {r.skill}</span>
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
