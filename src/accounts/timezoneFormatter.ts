export interface AccountDatePreference {
  locale: string;
  timezone: string;
}

export function formatBillingDate(dateIso: string, preference: AccountDatePreference): string {
  return new Date(dateIso).toLocaleDateString(preference.locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function formatBillingWindow(startIso: string, endIso: string, preference: AccountDatePreference): string {
  return formatBillingDate(startIso, preference) + ' - ' + formatBillingDate(endIso, preference);
}

