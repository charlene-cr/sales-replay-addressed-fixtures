export interface ReportColumn<T> {
  key: keyof T;
  label: string;
}

export interface ReportOptions<T> {
  columns: readonly ReportColumn<T>[];
  rows: readonly T[];
  includeGeneratedAt?: boolean;
}

function serializeCell(value: unknown): string {
  const raw = value == null ? '' : String(value);
  if (raw.includes(',') || raw.includes('"')) return '"' + raw.replaceAll('"', '""') + '"';
  return raw;
}

export function buildCsvReport<T extends Record<string, unknown>>(options: ReportOptions<T>): string {
  const lines = [options.columns.map(column => serializeCell(column.label)).join(',')];
  for (const row of options.rows) {
    lines.push(options.columns.map(column => serializeCell(row[column.key])).join(','));
  }
  if (options.includeGeneratedAt) {
    lines.push('Generated At,' + new Date().toISOString());
  }
  return lines.join('
');
}

