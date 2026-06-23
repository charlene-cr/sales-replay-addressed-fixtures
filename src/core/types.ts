export type UUID = string;

export interface Workspace {
  id: UUID;
  slug: string;
  plan: 'free' | 'team' | 'enterprise';
}

export interface Actor {
  id: UUID;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

export interface Result<T> {
  ok: boolean;
  value?: T;
  error?: string;
}

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<T = never>(error: string): Result<T> {
  return { ok: false, error };
}

