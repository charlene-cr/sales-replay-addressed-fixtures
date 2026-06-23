export interface RequestContext {
  requestId: string;
  workspaceId?: string;
  actorId?: string;
  ipAddress?: string;
}

export interface JsonResponse<T> {
  status: number;
  body: T;
}

export function json<T>(status: number, body: T): JsonResponse<T> {
  return { status, body };
}

