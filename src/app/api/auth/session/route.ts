import { isCloudConfigured, isOwnerAuthenticated } from '@/lib/cloud-auth';

export const runtime = 'nodejs';

export async function GET() {
  const cloudEnabled = isCloudConfigured();
  return Response.json({
    cloudEnabled,
    authenticated: cloudEnabled ? await isOwnerAuthenticated() : false,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
