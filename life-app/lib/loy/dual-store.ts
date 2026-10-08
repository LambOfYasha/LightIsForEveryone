import type { DualStore, StoreHealth } from '@lambofyasha/loy-dual-store';

// This module is intentionally server-only. Never import it from middleware or an Edge route.
let dualStorePromise: Promise<DualStore> | undefined;

export function isLoyDualStoreConfigured() {
  return Boolean(process.env.MONGO_URL);
}

export async function getLoyDualStore(): Promise<DualStore> {
  if (!isLoyDualStoreConfigured()) {
    throw new Error('LOY dual store is not configured: set MONGO_URL before opening MongoDB.');
  }

  if (!dualStorePromise) {
    const { createDualStore } = await import('@lambofyasha/loy-dual-store');
    dualStorePromise = createDualStore();
  }

  try {
    return await dualStorePromise;
  } catch (error) {
    // Do not cache a failed connection forever in a long-lived server process.
    dualStorePromise = undefined;
    throw error;
  }
}

export async function getLoyDualStoreHealth(): Promise<StoreHealth> {
  if (!isLoyDualStoreConfigured()) {
    return {
      mongo: 'skipped',
      postgres: 'skipped',
      checkedAt: new Date().toISOString(),
    };
  }

  try {
    const store = await getLoyDualStore();
    const { checkStoreHealth } = await import('@lambofyasha/loy-dual-store');
    return checkStoreHealth({ mongo: store.mongo, postgres: store.postgres });
  } catch {
    return {
      mongo: 'down',
      postgres: process.env.POSTGRES_URL ? 'down' : 'skipped',
      checkedAt: new Date().toISOString(),
    };
  }
}
