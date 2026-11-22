import { clearOwnerSession } from '@/lib/cloud-auth';

export const runtime = 'nodejs';

export async function POST() {
  await clearOwnerSession();
  return Response.json({ authenticated: false });
}
