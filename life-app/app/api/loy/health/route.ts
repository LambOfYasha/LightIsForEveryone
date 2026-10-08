import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { getLoyDualStoreHealth } from '@/lib/loy/dual-store';

export const runtime = 'nodejs';

const roleLookupQuery = `*[_type in ["user", "teacher"] && id == $id][0] { role }`;

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await client.fetch<{ role?: string } | null>(roleLookupQuery, { id: userId });

    if (!user || !['admin', 'dev'].includes(user.role ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const health = await getLoyDualStoreHealth();
    const enabled = health.mongo !== 'skipped' || health.postgres !== 'skipped';
    const healthy = !enabled || (health.mongo !== 'down' && health.postgres !== 'down');

    return NextResponse.json(
      {
        service: 'loy-dual-store',
        enabled,
        health,
      },
      { status: healthy ? 200 : 503 }
    );
  } catch (error) {
    console.error('Failed to read LOY dual-store health:', error);
    return NextResponse.json({ error: 'Health check unavailable' }, { status: 500 });
  }
}
