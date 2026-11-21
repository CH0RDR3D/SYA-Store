/**
 * Unit tests for SKU Normalization Utility
 *
 * Run with: npx jest src/__tests__/sku-normalizer.spec.ts
 */

import {
  normalizeSku,
  skusAreEqual,
  findDuplicateSku,
  duplicateSkuMessage,
} from "../utils/sku-normalizer"

describe("normalizeSku", () => {
  it("converts to uppercase", () => {
    expect(normalizeSku("abc123")).toBe("ABC123")
  })

  it("trims leading and trailing spaces", () => {
    expect(normalizeSku("  ABC123  ")).toBe("ABC123")
  })

  it("collapses multiple internal spaces", () => {
    expect(normalizeSku("ABC  123")).toBe("ABC 123")
  })

  it("removes zero-width spaces", () => {
    expect(normalizeSku("ABC\u200B123")).toBe("ABC123")
  })

  it("removes non-breaking spaces", () => {
    expect(normalizeSku("ABC\u00A0123")).toBe("ABC 123".trim())
  })

  it("handles mixed case + padding", () => {
    expect(normalizeSku(" abc123 ")).toBe("ABC123")
  })

  it("returns empty string for null input", () => {
    expect(normalizeSku(null)).toBe("")
  })

  it("returns empty string for undefined input", () => {
    expect(normalizeSku(undefined)).toBe("")
  })

  it("returns empty string for whitespace-only input", () => {
    expect(normalizeSku("   ")).toBe("")
  })

  // The four examples from the requirements all normalize to "ABC123"
  const requirementExamples = ["ABC123", " ABC123 ", "ABC123  ", "abc123"]
  it.each(requirementExamples)(
    "normalizes requirement example '%s' to 'ABC123'",
    (input) => {
      expect(normalizeSku(input)).toBe("ABC123")
    }
  )
})

describe("skusAreEqual", () => {
  it("matches identical SKUs", () => {
    expect(skusAreEqual("ABC123", "ABC123")).toBe(true)
  })

  it("matches with different casing", () => {
    expect(skusAreEqual("abc123", "ABC123")).toBe(true)
  })

  it("matches with extra whitespace", () => {
    expect(skusAreEqual(" abc123 ", "ABC123  ")).toBe(true)
  })

  it("does not match different SKUs", () => {
    expect(skusAreEqual("ABC123", "XYZ789")).toBe(false)
  })

  it("handles null inputs", () => {
    expect(skusAreEqual(null, null)).toBe(true)
    expect(skusAreEqual(null, "ABC123")).toBe(false)
  })
})

describe("findDuplicateSku", () => {
  const existing = [
    { sku: "ABC123", variantId: "v1" },
    { sku: " xyz789 ", variantId: "v2" },
  ]

  it("finds a duplicate by normalized match", () => {
    expect(findDuplicateSku("abc123", existing)).toBe("ABC123")
  })

  it("finds duplicate with padded candidate", () => {
    expect(findDuplicateSku(" ABC123 ", existing)).toBe("ABC123")
  })

  it("returns null when no duplicate exists", () => {
    expect(findDuplicateSku("NEW001", existing)).toBeNull()
  })

  it("excludes the specified variantId (update flow)", () => {
    // Should not flag a duplicate when the matching variant is excluded
    expect(findDuplicateSku("ABC123", existing, "v1")).toBeNull()
  })

  it("returns null for empty candidate", () => {
    expect(findDuplicateSku("", existing)).toBeNull()
    expect(findDuplicateSku(null, existing)).toBeNull()
  })
})

describe("duplicateSkuMessage", () => {
  it("formats user-friendly error message with uppercase SKU", () => {
    expect(duplicateSkuMessage("abc123")).toBe(
      "Variant SKU 'ABC123' already exists."
    )
  })

  it("trims whitespace in the message", () => {
    expect(duplicateSkuMessage(" ABC123 ")).toBe(
      "Variant SKU 'ABC123' already exists."
    )
  })
})
