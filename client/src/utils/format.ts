/**
 * Formatting utilities per PRD §13 (Normalisasi Data Tampilan):
 * - Persentase maksimal 2 desimal
 * - Angka dibulatkan konsisten
 */

/**
 * Round a number to 2 decimal places.
 */
export function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Format a number as percentage with up to 2 decimal places.
 * Strips trailing zeros (e.g. 49.50 → "49.5", 100.00 → "100").
 */
export function formatPercent(value: number): string {
  return roundTo2(value).toFixed(2).replace(/\.?0+$/, '');
}

/**
 * Format estimated votes with up to 2 decimal places.
 */
export function formatVotes(value: number): string {
  return roundTo2(value).toFixed(2).replace(/\.?0+$/, '');
}
