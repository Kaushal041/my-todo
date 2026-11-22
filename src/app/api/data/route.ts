import { isCloudConfigured, isOwnerAuthenticated } from '@/lib/cloud-auth';
import { getMongoDb } from '@/lib/mongodb';
import type { Document } from 'mongodb';

export const runtime = 'nodejs';

type StoredSnapshot = Record<string, unknown>;
interface OwnerDataDocument extends Document {
  _id: string;
  data: StoredSnapshot;
  updatedAt: Date;
}

function isSnapshot(value: unknown): value is StoredSnapshot {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const snapshot = value as Record<string, unknown>;
  return ['tasks', 'habits', 'focusSessions', 'journal', 'settings', 'categories', 'platforms', 'activityLogs']
    .every((key) => key in snapshot);
}

function unavailable() {
  return Response.json({ error: 'Cloud sync is not configured on the server.' }, { status: 503 });
}

async function authorize() {
  if (!isCloudConfigured()) return unavailable();
  if (!(await isOwnerAuthenticated())) {
    return Response.json({ error: 'Sign in to sync your data.' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await authorize();
  if (denied) return denied;

  try {
    const db = await getMongoDb();
    const document = await db.collection<OwnerDataDocument>('owner_data').findOne({ _id: 'owner' });
    return Response.json({
      data: document?.data ?? null,
      updatedAt: document?.updatedAt?.toISOString() ?? null,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('MongoDB read failed:', error);
    return Response.json({ error: 'Could not read cloud data.' }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const denied = await authorize();
  if (denied) return denied;

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 5_000_000) {
    return Response.json({ error: 'Backup is larger than the 5 MB limit.' }, { status: 413 });
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > 5_000_000) {
      return Response.json({ error: 'Backup is larger than the 5 MB limit.' }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const data = (body as { data?: unknown } | null)?.data;
  if (!isSnapshot(data)) {
    return Response.json({ error: 'Invalid application data snapshot.' }, { status: 400 });
  }

  try {
    const db = await getMongoDb();
    const updatedAt = new Date();
    await db.collection<OwnerDataDocument>('owner_data').updateOne(
      { _id: 'owner' },
      { $set: { data, updatedAt } },
      { upsert: true },
    );
    return Response.json({ updatedAt: updatedAt.toISOString() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('MongoDB write failed:', error);
    return Response.json({ error: 'Could not save cloud data.' }, { status: 503 });
  }
}
