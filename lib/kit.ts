import 'server-only';

/**
 * Kit (formerly ConvertKit) v4 API client — newsletter + sequence backend
 * for Retard Skills. The transactional welcome stays on Resend; Kit owns
 * the marketing list (newsletter, sequences, broadcasts).
 *
 * Auth: V4 API Key in the `X-Kit-Api-Key` header.
 * Docs: developers.kit.com
 *
 * All calls are gated behind KIT_API_KEY presence — if the env var isn't
 * set (e.g., preview deploys, local dev without secrets), the helpers
 * return null and the caller continues without erroring.
 */

const KIT_API_BASE = 'https://api.kit.com/v4';

function authHeaders() {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) return null;
  return {
    'X-Kit-Api-Key': apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

/**
 * Subscribe an email to the Retard Skills list and apply the signup tag.
 * Idempotent — Kit handles existing subscribers gracefully (returns the
 * existing record).
 *
 * Returns the subscriber id on success, null on failure (or when KIT_API_KEY
 * is unset — see comment above).
 */
export async function kitSubscribeAndTag(
  email: string,
  options: { tagId?: number; firstName?: string; fields?: Record<string, string> } = {},
): Promise<{ subscriberId: number } | null> {
  const headers = authHeaders();
  if (!headers) return null;

  const tagId = options.tagId ?? Number(process.env.KIT_SIGNUP_TAG_ID);
  if (!tagId || Number.isNaN(tagId)) return null;

  try {
    // Step 1: create or update the subscriber.
    const createRes = await fetch(`${KIT_API_BASE}/subscribers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email_address: email,
        ...(options.firstName ? { first_name: options.firstName } : {}),
        ...(options.fields ? { fields: options.fields } : {}),
        state: 'active',
      }),
    });

    if (!createRes.ok) {
      // Kit returns 422 when the subscriber already exists — try the GET path.
      if (createRes.status !== 422) {
        console.warn('[kit] subscribe create failed', createRes.status);
        return null;
      }
    }

    const createBody = (await createRes.json().catch(() => null)) as
      | { subscriber?: { id: number } }
      | null;
    let subscriberId = createBody?.subscriber?.id;
    const wasExistingSubscriber = !subscriberId;

    // If we hit the duplicate path, fetch the subscriber by email to get the id.
    if (!subscriberId) {
      const lookup = await fetch(
        `${KIT_API_BASE}/subscribers?email_address=${encodeURIComponent(email)}`,
        { headers },
      );
      const lookupBody = (await lookup.json().catch(() => null)) as
        | { subscribers?: Array<{ id: number }> }
        | null;
      subscriberId = lookupBody?.subscribers?.[0]?.id;
    }

    if (!subscriberId) {
      console.warn('[kit] could not resolve subscriber id after create');
      return null;
    }

    // If this was an existing subscriber AND we're passing fields, refresh
    // them via PUT — important when welcome_link rotates per signup attempt
    // (cross-device flow: user re-signs up to get a new access token, we
    // need Kit's stored field updated so the next welcome-sequence email
    // uses the fresh link).
    if (wasExistingSubscriber && options.fields) {
      const updateRes = await fetch(`${KIT_API_BASE}/subscribers/${subscriberId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ fields: options.fields }),
      });
      if (!updateRes.ok && updateRes.status !== 422) {
        console.warn('[kit] subscriber field update failed', updateRes.status);
      }
    }

    // Step 2: apply the signup tag.
    const tagRes = await fetch(`${KIT_API_BASE}/tags/${tagId}/subscribers/${subscriberId}`, {
      method: 'POST',
      headers,
    });

    if (!tagRes.ok && tagRes.status !== 422) {
      // 422 = already tagged, fine. Other failures we just log.
      console.warn('[kit] tag apply failed', tagRes.status);
    }

    // Step 3: add to the Welcome Sequence so Kit fires the welcome email.
    // (Kit's v4 API doesn't expose tag-triggered Visual Automations, so we
    // subscribe to the sequence directly here. New signups go Convex →
    // Kit subscriber + tag + custom field + Welcome Sequence in one call.)
    const sequenceId = Number(process.env.KIT_WELCOME_SEQUENCE_ID);
    if (sequenceId && !Number.isNaN(sequenceId)) {
      const seqRes = await fetch(
        `${KIT_API_BASE}/sequences/${sequenceId}/subscribers/${subscriberId}`,
        { method: 'POST', headers },
      );
      if (!seqRes.ok && seqRes.status !== 422) {
        // 422 = already in sequence, fine.
        console.warn('[kit] sequence add failed', seqRes.status);
      }
    }

    return { subscriberId };
  } catch (err) {
    console.warn('[kit] subscribe error', err instanceof Error ? err.name : 'unknown');
    return null;
  }
}

/**
 * Mark a subscriber as unsubscribed in Kit. Used by the inverse webhook —
 * if a user unsubscribes via Kit's hosted page, we sync to Convex.
 *
 * Most paths use this for outbound (Convex → Kit). For Kit → Convex sync,
 * see app/api/kit-webhook/route.ts.
 */
export async function kitUnsubscribe(email: string): Promise<boolean> {
  const headers = authHeaders();
  if (!headers) return false;

  try {
    // Look up the subscriber.
    const lookup = await fetch(
      `${KIT_API_BASE}/subscribers?email_address=${encodeURIComponent(email)}`,
      { headers },
    );
    const lookupBody = (await lookup.json().catch(() => null)) as
      | { subscribers?: Array<{ id: number }> }
      | null;
    const subscriberId = lookupBody?.subscribers?.[0]?.id;
    if (!subscriberId) return false;

    const res = await fetch(`${KIT_API_BASE}/subscribers/${subscriberId}/unsubscribe`, {
      method: 'POST',
      headers,
    });
    return res.ok;
  } catch {
    return false;
  }
}
