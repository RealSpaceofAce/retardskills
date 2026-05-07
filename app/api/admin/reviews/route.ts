/**
 * GET /api/admin/reviews
 *
 * List all retardskill reviews (pending + approved + rejected) for the admin UI.
 * Auth: admin session required (proxy.ts protects /api/admin/*).
 */

import { requireAdminRequest } from "@/lib/admin-request";
import { runConvexAdminMutation, runConvexAdminQuery } from "@/lib/convexAdmin";

export async function GET(): Promise<Response> {
  const unauthorized = await requireAdminRequest();
  if (unauthorized) return unauthorized;

  const reviews = await runConvexAdminQuery('retardSkillReviews:listAll', { limit: 200 });

  return Response.json({ reviews });
}
