/**
 * SKU Normalization Utility
 *
 * Centralizes all SKU sanitization logic to prevent duplicate variant creation
 * caused by inconsistent whitespace, casing, or invisible characters.
 *
 * Rules applied (in order):
 *  1. Remove zero-width / invisible Unicode characters
 *  2. Trim leading and trailing whitespace
 *  3. Collapse multiple consecutive spaces into a single space
 *  4. Convert to UPPERCASE for consistent de-duplication
 */

/** Regex matching invisible/zero-width Unicode characters */
const INVISIBLE_CHARS_REGEX =
  /[\u200B\u200C\u200D\u200E\u200F\u00AD\uFEFF]/g

/**
 * Normalizes a raw SKU string.
 * Returns an empty string when given an empty / null-like input.
 *
 * @example
 * normalizeSku("  abc123  ")  // "ABC123"
 * normalizeSku("ABC  123")    // "ABC 123"
 * normalizeSku("abc123")      // "ABC123"
 * normalizeSku("  ")          // ""
 */
export function normalizeSku(raw: string | null | undefined): string {
  if (!raw) return ""
  return raw
    .replace(INVISIBLE_CHARS_REGEX, "")
    .replace(/\u00A0/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase()
}

/**
 * Returns true when two SKUs are considered equal after normalization.
 *
 * @example
 * skusAreEqual("abc123", " ABC123 ") // true
 * skusAreEqual("ABC123", "XYZ")      // false
 */
export function skusAreEqual(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  return normalizeSku(a) === normalizeSku(b)
}

/**
 * Validates a normalized SKU against a list of existing normalized SKUs.
 * Returns the conflicting SKU if a duplicate is found, or null if the SKU is unique.
 *
 * @param candidate     The raw SKU to validate.
 * @param existingSkus  Array of raw (or already-normalized) SKUs currently in the DB.
 * @param excludeId     Optionally exclude a variant ID from the check (for update flows).
 */
export function findDuplicateSku(
  candidate: string | null | undefined,
  existingSkus: Array<{ sku: string | null; variantId?: string }>,
  excludeVariantId?: string
): string | null {
  const normalized = normalizeSku(candidate)
  if (!normalized) return null

  for (const entry of existingSkus) {
    if (excludeVariantId && entry.variantId === excludeVariantId) continue
    if (normalizeSku(entry.sku) === normalized) {
      return entry.sku ?? normalized
    }
  }
  return null
}

/**
 * Builds a user-friendly validation error message for duplicate SKUs.
 *
 * @example
 * duplicateSkuMessage("ABC123") // "Variant SKU 'ABC123' already exists."
 */
export function duplicateSkuMessage(sku: string): string {
  return `Variant SKU '${normalizeSku(sku)}' already exists.`
}
