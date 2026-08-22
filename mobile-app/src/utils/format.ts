export const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MVR' });

export function money(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return currency.format(0);
  return currency.format(Number(value));
}
