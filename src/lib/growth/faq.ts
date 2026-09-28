/**
 * Parse an article's `faqJson` column into FAQ entries.
 *
 * Fails closed: invalid JSON, a non-array, or entries missing a non-empty
 * `question`/`answer` string all drop out rather than surfacing malformed
 * FAQPage markup on the page.
 *
 * Kept in its own module (no `server-only` import) so it stays plainly
 * unit-testable outside of a server/React context.
 */
export function parseFaq(value: string): { question: string; answer: string }[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is { question: string; answer: string } =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as { question?: unknown }).question === "string" &&
        (item as { question: string }).question.trim().length > 0 &&
        typeof (item as { answer?: unknown }).answer === "string" &&
        (item as { answer: string }).answer.trim().length > 0
    );
  } catch {
    return [];
  }
}
