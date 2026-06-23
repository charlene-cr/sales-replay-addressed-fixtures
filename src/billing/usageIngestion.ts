import { err, ok, type Result } from '../core/types';
import type { Clock } from '../lib/clock';

export interface UsageEvent {
  id: string;
  workspaceId: string;
  meter: 'seat' | 'review' | 'storage' | 'api_call';
  amount: number;
  currency: 'USD';
  occurredAt: string;
  source: 'stripe' | 'internal_meter' | 'manual_adjustment';
}

export interface UsageLedgerRow {
  eventId: string;
  workspaceId: string;
  meter: UsageEvent['meter'];
  amountCents: number;
  billingMonth: string;
  receivedAt: string;
}

export interface UsageLedgerStore {
  hasEvent(eventId: string): Promise<boolean>;
  insert(row: UsageLedgerRow): Promise<void>;
}

function billingMonthFor(occurredAt: string): string {
  const date = new Date(occurredAt);
  return date.getUTCFullYear() + '-' + String(date.getUTCMonth() + 1).padStart(2, '0');
}

export function normalizeUsageEvent(event: UsageEvent, clock: Clock): Result<UsageLedgerRow> {
  if (!event.id || !event.workspaceId) return err('missing event identity');
  if (!Number.isFinite(event.amount) || event.amount < 0) return err('invalid usage amount');
  if (event.currency !== 'USD') return err('unsupported currency');

  return ok({
    eventId: event.id,
    workspaceId: event.workspaceId,
    meter: event.meter,
    amountCents: Math.round(event.amount),
    billingMonth: billingMonthFor(event.occurredAt),
    receivedAt: clock.now().toISOString(),
  });
}

export async function ingestUsageEvent(store: UsageLedgerStore, event: UsageEvent, clock: Clock): Promise<Result<UsageLedgerRow>> {
  if (await store.hasEvent(event.id)) {
    return err('duplicate usage event');
  }
  const normalized = normalizeUsageEvent(event, clock);
  if (!normalized.ok || !normalized.value) return normalized;
  await store.insert(normalized.value);
  return normalized;
}

export function summarizeUsage(rows: readonly UsageLedgerRow[]): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const key = row.workspaceId + ':' + row.billingMonth + ':' + row.meter;
    acc[key] = (acc[key] ?? 0) + row.amountCents;
    return acc;
  }, {});
}

