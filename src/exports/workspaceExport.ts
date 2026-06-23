export interface WorkspaceExportRow {
  workspaceId: string;
  project: string;
  ownerEmail: string;
  billingStatus: 'trial' | 'active' | 'past_due';
  notes?: string;
}

export interface ExportEnvelope {
  generatedAt: string;
  rowCount: number;
  csv: string;
}

const HEADERS = ['workspaceId', 'project', 'ownerEmail', 'billingStatus', 'notes'] as const;

function csvCell(value: string | undefined): string {
  const raw = value ?? '';
  if (raw.includes(',') || raw.includes('"') || raw.includes('
')) {
    return '"' + raw.replaceAll('"', '""') + '"';
  }
  return raw;
}

export function buildWorkspaceExport(rows: readonly WorkspaceExportRow[], generatedAt = new Date().toISOString()): ExportEnvelope {
  const lines = [HEADERS.join(',')];
  for (const row of rows) {
    lines.push([
      csvCell(row.workspaceId),
      csvCell(row.project),
      csvCell(row.ownerEmail),
      csvCell(row.billingStatus),
      csvCell(row.notes),
    ].join(','));
  }
  return { generatedAt, rowCount: rows.length, csv: lines.join('
') };
}

export function filterExportRows(rows: readonly WorkspaceExportRow[], query: string): WorkspaceExportRow[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [...rows];
  return rows.filter(row => (row.workspaceId + ' ' + row.project + ' ' + row.ownerEmail).toLowerCase().includes(normalized));
}

