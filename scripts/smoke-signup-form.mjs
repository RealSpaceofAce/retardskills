#!/usr/bin/env node
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';

const port = Number(process.env.TEST_PORT ?? 3210);
const origin = `http://127.0.0.1:${port}`;

function startServer() {
  const child = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['next', 'dev', '--hostname', '127.0.0.1', '--port', String(port)],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
    },
  );

  child.stdout.on('data', (chunk) => process.stdout.write(chunk));
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));
  return child;
}

async function waitForServer() {
  const deadline = Date.now() + 45_000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(origin, { redirect: 'manual' });
      if (response.status === 200) return;
      lastError = new Error(`Unexpected status ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await delay(500);
  }
  throw lastError ?? new Error('Timed out waiting for Next dev server');
}

const server = startServer();
let exitCode = 0;

try {
  await waitForServer();

  const pageResponse = await fetch(origin);
  assert.equal(pageResponse.status, 200, 'landing page should load');
  const html = await pageResponse.text();
  const formMarkup = html.match(/<form[^>]*class="rs-form"[\s\S]*?<\/form>/)?.[0] ?? '';
  const inputMarkup = formMarkup.match(/<input[^>]*id="rs-email-input"[^>]*>/)?.[0] ?? '';
  assert.match(formMarkup, /action="\/api\/signup"/, 'signup form should POST to /api/signup without JS');
  assert.match(formMarkup, /method="post"/, 'signup form should use POST without JS');
  assert.match(inputMarkup, /type="email"/, 'signup input should preserve browser email validation');
  assert.match(inputMarkup, /name="email"/, 'signup input should have a name so native form posts include the email');

  const jsonInvalid = await fetch(`${origin}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email: 'not-an-email' }),
  });
  assert.equal(jsonInvalid.status, 400, 'invalid JSON signup should be rejected');
  assert.match(jsonInvalid.headers.get('cache-control') ?? '', /no-store/, 'JSON errors should not be cached');
  assert.deepEqual(await jsonInvalid.json(), { error: 'Valid email required' });

  const htmlInvalid = await fetch(`${origin}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'text/html' },
    body: new URLSearchParams({ email: 'not-an-email' }),
  });
  assert.equal(htmlInvalid.status, 400, 'invalid native form signup should be rejected');
  assert.match(htmlInvalid.headers.get('content-type') ?? '', /text\/html/, 'native form errors should return HTML');
  assert.match(htmlInvalid.headers.get('cache-control') ?? '', /no-store/, 'native form errors should not be cached');
  assert.match(await htmlInvalid.text(), /Valid email required/);

  console.log('\n✓ signup form smoke tests passed');
} catch (error) {
  exitCode = 1;
  console.error('\n✗ signup form smoke tests failed');
  console.error(error);
} finally {
  server.kill('SIGTERM');
  await delay(500);
  process.exit(exitCode);
}
