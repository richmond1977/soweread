/**
 * A GA4 measurement ID is interpolated into an inline script, so it is
 * validated rather than trusted: a malformed env var would otherwise break
 * every page, or worse, inject script content.
 */
const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;

export function parseMeasurementId(value: string | undefined | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return MEASUREMENT_ID_PATTERN.test(trimmed) ? trimmed : null;
}
