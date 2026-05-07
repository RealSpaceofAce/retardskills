/**
 * Minimal Convex admin client for retardskills.com.
 *
 * Talks to the same Convex deployment as bossmode/clawpreneur via
 * NEXT_PUBLIC_CONVEX_URL + CONVEX_ADMIN_TOKEN. This repo doesn't deploy
 * Convex functions of its own; it consumes the existing functions.
 *
 * Functions are referenced by string ("file:function") to avoid having to
 * vendor the full clawpreneur convex/_generated tree.
 */
import { ConvexHttpClient } from 'convex/browser';
import { makeFunctionReference } from 'convex/server';
import type {
  FunctionReference,
  FunctionArgs,
  FunctionReturnType,
} from 'convex/server';

import { requireEnv } from './env';

type ConvexAdminClient = ConvexHttpClient & {
  setAdminAuth(token: string): void;
};

export function getConvexAdminClient(): ConvexAdminClient {
  const client = new ConvexHttpClient(requireEnv('NEXT_PUBLIC_CONVEX_URL')) as ConvexAdminClient;
  client.setAdminAuth(requireEnv('CONVEX_ADMIN_TOKEN'));
  return client;
}

/**
 * Run a Convex query. Accepts a string name like "retardSkillReviews:listAll"
 * or "retardSkillReviews:listApproved". Visibility ('public' | 'internal') is
 * inferred from the deployed Convex backend.
 */
export async function runConvexAdminQuery<TArgs = Record<string, unknown>, TResult = unknown>(
  name: string,
  args: TArgs,
): Promise<TResult> {
  const client = getConvexAdminClient();
  const fn = makeFunctionReference<'query'>(name) as FunctionReference<'query'>;
  return client.query(fn, args as FunctionArgs<typeof fn>) as Promise<FunctionReturnType<typeof fn>> as Promise<TResult>;
}

export async function runConvexAdminMutation<TArgs = Record<string, unknown>, TResult = unknown>(
  name: string,
  args: TArgs,
): Promise<TResult> {
  const client = getConvexAdminClient();
  const fn = makeFunctionReference<'mutation'>(name) as FunctionReference<'mutation'>;
  return client.mutation(fn, args as FunctionArgs<typeof fn>) as Promise<FunctionReturnType<typeof fn>> as Promise<TResult>;
}
