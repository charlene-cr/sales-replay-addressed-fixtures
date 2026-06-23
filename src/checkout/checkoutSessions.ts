import { err, ok, type Result } from '../core/types';

export interface CartLineItem {
  sku: string;
  quantity: number;
  unitAmountCents: number;
}

export interface CheckoutRequest {
  workspaceId: string;
  customerId: string;
  cartId: string;
  items: CartLineItem[];
}

export interface CheckoutSession {
  id: string;
  idempotencyKey: string;
  amountCents: number;
  itemCount: number;
}

export interface CheckoutSessionStore {
  findByIdempotencyKey(key: string): Promise<CheckoutSession | null>;
  create(session: CheckoutSession): Promise<CheckoutSession>;
}

function amountFor(items: readonly CartLineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitAmountCents, 0);
}

function cartFingerprint(request: CheckoutRequest): string {
  return request.items
    .map(item => item.sku + ':' + item.quantity + ':' + item.unitAmountCents)
    .sort()
    .join('|');
}

function idempotencyKeyFor(request: CheckoutRequest): string {
  return request.workspaceId + ':' + request.customerId + ':' + request.cartId + ':' + cartFingerprint(request);
}

export async function createCheckoutSession(store: CheckoutSessionStore, request: CheckoutRequest): Promise<Result<CheckoutSession>> {
  if (request.items.length === 0) return err('checkout cart is empty');
  const idempotencyKey = idempotencyKeyFor(request);
  const existing = await store.findByIdempotencyKey(idempotencyKey);
  if (existing) return ok(existing);
  const session: CheckoutSession = {
    id: 'cs_' + request.workspaceId + '_' + Date.now(),
    idempotencyKey,
    amountCents: amountFor(request.items),
    itemCount: request.items.length,
  };
  return ok(await store.create(session));
}

