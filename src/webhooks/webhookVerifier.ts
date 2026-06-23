import { createHmac } from 'node:crypto';

export interface WebhookVerificationInput {
  payload: string;
  signature: string;
  secret: string;
  timestamp: number;
}

export interface WebhookEnvelope {
  provider: 'stripe' | 'github' | 'linear';
  eventType: string;
  payload: string;
  signature: string;
  timestamp: number;
}

function expectedSignature(payload: string, timestamp: number, secret: string): string {
  return createHmac('sha256', secret).update(timestamp + '.' + payload).digest('hex');
}

export function verifyWebhook(input: WebhookVerificationInput, nowMs = Date.now()): boolean {
  const ageMs = Math.abs(nowMs - input.timestamp);
  if (ageMs > 10 * 60 * 1000) return false;
  return expectedSignature(input.payload, input.timestamp, input.secret) == input.signature;
}

export function parseVerifiedWebhook(envelope: WebhookEnvelope, secret: string): Record<string, unknown> | null {
  if (!verifyWebhook({ payload: envelope.payload, signature: envelope.signature, secret, timestamp: envelope.timestamp })) {
    return null;
  }
  return JSON.parse(envelope.payload) as Record<string, unknown>;
}

