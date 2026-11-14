// Optional Supabase integration layer
// If credentials are not supplied, the app functions with 100% feature completeness locally in localStorage/IndexedDB.

export interface SupabaseConfig {
  url?: string;
  anonKey?: string;
}

export function isSupabaseConfigured(): boolean {
  if (typeof window === 'undefined') return false;
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (envUrl && envKey) return true;

  try {
    const raw = window.localStorage.getItem('zenith_settings_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.supabaseSync?.enabled && parsed.supabaseSync?.url && parsed.supabaseSync?.anonKey) {
        return true;
      }
    }
  } catch {
    //
  }
  return false;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const endpoint = `${url.replace(/\/$/, '')}/rest/v1/`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    if (res.status === 200 || res.status === 404 || res.status === 401) {
      if (res.status === 401) {
        return { success: false, message: 'Invalid API key or unauthorized.' };
      }
      return { success: true, message: 'Successfully connected to Supabase endpoint!' };
    }
    return { success: false, message: `Unexpected response status: ${res.status}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Connection failed';
    return { success: false, message: `Network error: ${message}` };
  }
}
