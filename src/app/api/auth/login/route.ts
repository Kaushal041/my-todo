import { createOwnerSession, isCloudConfigured, verifyOwnerPassword } from '@/lib/cloud-auth';

export const runtime = 'nodejs';

const loginFailures = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  if (!isCloudConfigured()) {
    return Response.json({ error: 'Cloud sync is not configured on the server.' }, { status: 503 });
  }

  const now = Date.now();
  for (const [key, attempt] of loginFailures) {
    if (attempt.resetAt <= now) loginFailures.delete(key);
  }
  const clientKey = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const attempts = loginFailures.get(clientKey);
  if (attempts && attempts.count >= MAX_ATTEMPTS && attempts.resetAt > now) {
    return Response.json({ error: 'Too many sign-in attempts. Try again in 15 minutes.' }, { status: 429 });
  }

  let password: unknown;
  try {
    const body = await request.json();
    password = body?.password;
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (typeof password !== 'string' || password.length > 256 || !verifyOwnerPassword(password)) {
    const previous = loginFailures.get(clientKey);
    loginFailures.set(clientKey, {
      count: previous && previous.resetAt > now ? previous.count + 1 : 1,
      resetAt: previous && previous.resetAt > now ? previous.resetAt : now + WINDOW_MS,
    });
    return Response.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  loginFailures.delete(clientKey);
  await createOwnerSession();
  return Response.json({ authenticated: true }, { headers: { 'Cache-Control': 'no-store' } });
}
