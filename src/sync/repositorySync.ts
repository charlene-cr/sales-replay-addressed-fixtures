export interface RepositoryRecord {
  id: string;
  workspaceId: string;
  provider: 'github' | 'gitlab' | 'bitbucket';
  fullName: string;
  defaultBranch: string;
  lastSyncedCursor?: string;
}

export interface SyncPage {
  nextCursor?: string;
  repositories: RepositoryRecord[];
}

export interface RepositoryProviderClient {
  listRepositories(cursor?: string): Promise<SyncPage>;
}

export interface RepositoryStore {
  upsertRepository(record: RepositoryRecord): Promise<void>;
  saveCursor(cursor: string | undefined): Promise<void>;
}

export interface SyncSummary {
  processed: number;
  pages: number;
  cursor?: string;
}

export async function syncRepositories(client: RepositoryProviderClient, store: RepositoryStore, maxPages = 25): Promise<SyncSummary> {
  let cursor: string | undefined;
  let processed = 0;
  let pages = 0;

  while (pages < maxPages) {
    const page = await client.listRepositories(cursor);
    pages += 1;
    cursor = page.nextCursor;
    await store.saveCursor(cursor);
    for (const repository of page.repositories) {
      await store.upsertRepository(repository);
      processed += 1;
    }
    if (!cursor) break;
  }

  return { processed, pages, cursor };
}

export async function syncRepositoriesWithRetry(client: RepositoryProviderClient, store: RepositoryStore): Promise<SyncSummary> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await syncRepositories(client, store);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

