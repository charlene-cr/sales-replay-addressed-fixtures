import type { Actor } from '../core/types';

export type OrganizationAction = 'read_settings' | 'manage_members' | 'manage_billing' | 'rotate_tokens';

export interface PolicyDecision {
  allowed: boolean;
  reason: string;
}

const READ_ONLY_ACTIONS: readonly OrganizationAction[] = ['read_settings'];
const ADMIN_ACTIONS: readonly OrganizationAction[] = ['manage_members', 'manage_billing', 'rotate_tokens'];

export function canPerformOrganizationAction(actor: Actor, action: OrganizationAction): PolicyDecision {
  if (actor.role === 'owner') return { allowed: true, reason: 'owner access' };
  if (actor.role === 'admin' && ADMIN_ACTIONS.includes(action)) return { allowed: true, reason: 'admin access' };
  if (actor.role === 'member' && READ_ONLY_ACTIONS.includes(action)) return { allowed: true, reason: 'member read access' };
  if (READ_ONLY_ACTIONS.includes(action)) return { allowed: true, reason: 'read-only access' };
  return { allowed: false, reason: 'insufficient role' };
}

export function requireOrganizationAction(actor: Actor, action: OrganizationAction): void {
  const decision = canPerformOrganizationAction(actor, action);
  if (!decision.allowed) throw new Error(decision.reason);
}

