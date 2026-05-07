/**
 * POST /api/admin/reviews/[id]
 *
 * Approve / reject / un-review (set back to pending) a retardskill review.
 * Body: { status: 'approved' | 'rejected' | 'pending' }
 * Auth: admin session required.
 */

import { requireAdminRequest } from "@/lib/admin-request";
import { runConvexAdminMutation, runConvexAdminQuery } from "@/lib/convexAdmin";

const ALLOWED_STATUS = new Set(['approved', 'rejected', 'pending']);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const unauthorized = await requireAdminRequest();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  if (!id || typeof id !== 'string') {
    return Response.json({ error: 'Missing review id' }, { status: 400 });
  }

  let body: { status?: string };
  try {
    body = (await request.json()) as { status?: string };
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 });
  }

  const status = body.status;
  if (!status || !ALLOWED_STATUS.has(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 });
  }

  await runConvexAdminMutation('retardSkillReviews:setStatus', {
    id,
    status: status as 'approved' | 'rejected' | 'pending',
    reviewedBy: 'admin',
  });

  return Response.json({ ok: true });
}
