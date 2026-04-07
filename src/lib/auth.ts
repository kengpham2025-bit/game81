import { cookies } from 'next/headers';

export async function getAdminUser(): Promise<{ id: string; email: string; _id: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return null;
    const decoded =
      typeof Buffer !== 'undefined'
        ? Buffer.from(token, 'base64').toString('utf-8')
        : decodeURIComponent(escape(atob(token)));
    const payload = JSON.parse(decoded);
    let id = payload.id;
    if (id != null && typeof id === 'object' && '$oid' in id) {
      id = (id as { $oid: string }).$oid;
    }
    id = String(id ?? '');
    return { id, email: String(payload.email ?? ''), _id: id };
  } catch {
    return null;
  }
}
