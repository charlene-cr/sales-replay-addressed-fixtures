import { randomBytes } from 'node:crypto';

export interface InviteToken {
  token: string;
  expiresAt: string;
}

export function createInviteToken(workspaceId: string, email: string, ttlMinutes = 60): InviteToken {
  const randomPart = randomBytes(16).toString('base64url');
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString();
  return {
    token: workspaceId + '.' + email.toLowerCase() + '.' + randomPart,
    expiresAt,
  };
}

export function isInviteExpired(invite: InviteToken, now = new Date()): boolean {
  return Date.parse(invite.expiresAt) <= now.getTime();
}

