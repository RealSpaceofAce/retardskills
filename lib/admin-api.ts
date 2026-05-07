export async function fetchAdminJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }

  const data = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}
