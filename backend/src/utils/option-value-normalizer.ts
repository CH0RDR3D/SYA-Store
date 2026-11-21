/**
 * Product Option Value Normalization Utility
 *
 * Prevents duplicate option values (e.g. "Red", " Red", "RED", "Red ")
 * within the same option group by applying consistent normalization.
 *
 * Rules applied (in order):
 *  1. Remove invisible/zero-width Unicode characters
 *  2. Trim leading and trailing whitespace
 *  3. Collapse multiple consecutive spaces into a single space
 *  4. Title-case the result for user-friendly display (Red, Blue, Extra Large)
 */

/** Regex matching invisible/zero-width Unicode characters */
const INVISIBLE_CHARS_REGEX =
  /[\u200B\u200C\u200D\u200E\u200F\u00AD\uFEFF]/g

/**
 * Applies title-case to a string.
 * Each word's first letter is uppercased; the rest are lowercased.
 *
 * @example
 * toTitleCase("extra large") // "Extra Large"
 * toTitleCase("RED")         // "Red"
 */
function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase())
}

/**
 * Normalizes a product option value string.
 * Returns an empty string for empty / null-like inputs.
 *
 * @example
 * normalizeOptionValue("  red  ")  // "Red"
 * normalizeOptionValue("RED")      // "Red"
 * normalizeOptionValue(" Red ")    // "Red"
 * normalizeOptionValue("extra  large") // "Extra Large"
 */
export function normalizeOptionValue(
  raw: string | null | undefined
): string {
  if (!raw) return ""
  return toTitleCase(
    raw
      .replace(INVISIBLE_CHARS_REGEX, "")
      .trim()
      .replace(/\s+/g, " ")
  )
}

/**
 * Returns true when two option values are considered equal after normalization.
 *
 * @example
 * optionValuesAreEqual("red", " Red ") // true
 * optionValuesAreEqual("Red", "Blue")  // false
 */
export function optionValuesAreEqual(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  return normalizeOptionValue(a) === normalizeOptionValue(b)
}

/**
 * Finds a duplicate option value within an existing list (same option group).
 * Returns the conflicting value if found, or null if the value is unique.
 *
 * @param candidate      The raw value to validate.
 * @param existingValues Array of existing raw values for the same option group.
 * @param excludeId      Optionally exclude a value ID (for update flows).
 */
export function findDuplicateOptionValue(
  candidate: string | null | undefined,
  existingValues: Array<{ value: string; id?: string }>,
  excludeId?: string
): string | null {
  const normalized = normalizeOptionValue(candidate)
  if (!normalized) return null

  for (const entry of existingValues) {
    if (excludeId && entry.id === excludeId) continue
    if (normalizeOptionValue(entry.value) === normalized) {
      return entry.value ?? normalized
    }
  }
  return null
}

/**
 * Builds a user-friendly validation error for duplicate option values.
 *
 * @example
 * duplicateOptionValueMessage("Red", "Color")
 * // "Option value 'Red' already exists under 'Color'."
 */
export function duplicateOptionValueMessage(
  value: string,
  optionName?: string
): string {
  const normalized = normalizeOptionValue(value)
  return optionName
    ? `Option value '${normalized}' already exists under '${optionName}'.`
    : `Option value '${normalized}' already exists.`
}
