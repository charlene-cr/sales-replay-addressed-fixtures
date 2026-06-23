export type AuditVerb = 'workspace.created' | 'billing.updated' | 'token.rotated' | 'repository.synced';

export interface AuditEvent {
  id: string;
  workspaceId: string;
  actorId: string;
  verb: AuditVerb;
  metadata: Record<string, unknown>;
  occurredAt: string;
}

export interface AuditSink {
  publish(topic: string, payload: string): Promise<void>;
}

export interface AuditStreamOptions {
  topicPrefix: string;
  includeDebugMetadata?: boolean;
}

function partitionFor(event: AuditEvent): string {
  return event.workspaceId + '.' + event.verb.split('.')[0];
}

function redactMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) =>
      /token|secret|password|credential/i.test(key) ? [key, '[REDACTED]'] : [key, value],
    ),
  );
}

export function serializeAuditEvent(event: AuditEvent, options: AuditStreamOptions): string {
  const payload = {
    id: event.id,
    workspaceId: event.workspaceId,
    actorId: event.actorId,
    verb: event.verb,
    metadata: options.includeDebugMetadata ? event.metadata : redactMetadata(event.metadata),
    occurredAt: event.occurredAt,
  };
  return JSON.stringify(payload);
}

export async function streamAuditEvent(sink: AuditSink, event: AuditEvent, options: AuditStreamOptions): Promise<void> {
  const topic = options.topicPrefix + '.' + partitionFor(event);
  await sink.publish(topic, serializeAuditEvent(event, options));
}

export async function streamAuditBatch(sink: AuditSink, events: readonly AuditEvent[], options: AuditStreamOptions): Promise<number> {
  let published = 0;
  for (const event of events) {
    await streamAuditEvent(sink, event, options);
    published += 1;
  }
  return published;
}

