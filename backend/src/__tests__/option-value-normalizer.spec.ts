/**
 * Unit tests for Product Option Value Normalization Utility
 *
 * Run with: npx jest src/__tests__/option-value-normalizer.spec.ts
 */

import {
  normalizeOptionValue,
  optionValuesAreEqual,
  findDuplicateOptionValue,
  duplicateOptionValueMessage,
} from "../utils/option-value-normalizer"

describe("normalizeOptionValue", () => {
  it("title-cases a lowercase value", () => {
    expect(normalizeOptionValue("red")).toBe("Red")
  })

  it("title-cases an uppercase value", () => {
    expect(normalizeOptionValue("RED")).toBe("Red")
  })

  it("trims leading and trailing whitespace", () => {
    expect(normalizeOptionValue(" Red ")).toBe("Red")
  })

  it("collapses multiple internal spaces", () => {
    expect(normalizeOptionValue("extra  large")).toBe("Extra Large")
  })

  it("removes zero-width characters", () => {
    expect(normalizeOptionValue("Red\u200B")).toBe("Red")
  })

  it("handles multi-word values", () => {
    expect(normalizeOptionValue("DARK NAVY BLUE")).toBe("Dark Navy Blue")
  })

  it("returns empty string for null", () => {
    expect(normalizeOptionValue(null)).toBe("")
  })

  it("returns empty string for undefined", () => {
    expect(normalizeOptionValue(undefined)).toBe("")
  })

  it("returns empty string for whitespace-only input", () => {
    expect(normalizeOptionValue("   ")).toBe("")
  })

  // The five examples from the requirements all normalize to "Red"
  const requirementExamples = ["Red", "Red", " Red", "RED", "Red "]
  it.each(requirementExamples)(
    "normalizes requirement example '%s' to 'Red'",
    (input) => {
      expect(normalizeOptionValue(input)).toBe("Red")
    }
  )
})

describe("optionValuesAreEqual", () => {
  it("matches identical values", () => {
    expect(optionValuesAreEqual("Red", "Red")).toBe(true)
  })

  it("matches with different casing", () => {
    expect(optionValuesAreEqual("RED", "red")).toBe(true)
  })

  it("matches with extra whitespace", () => {
    expect(optionValuesAreEqual(" Red ", "Red")).toBe(true)
  })

  it("does not match different values", () => {
    expect(optionValuesAreEqual("Red", "Blue")).toBe(false)
  })
})

describe("findDuplicateOptionValue", () => {
  const existing = [
    { value: "Red", id: "ov1" },
    { value: "Dark Blue", id: "ov2" },
  ]

  it("finds a duplicate by normalized match", () => {
    expect(findDuplicateOptionValue("red", existing)).toBe("Red")
  })

  it("finds duplicate with padded candidate", () => {
    expect(findDuplicateOptionValue(" RED ", existing)).toBe("Red")
  })

  it("returns null when no duplicate exists", () => {
    expect(findDuplicateOptionValue("Green", existing)).toBeNull()
  })

  it("excludes the specified ID (update flow)", () => {
    expect(findDuplicateOptionValue("Red", existing, "ov1")).toBeNull()
  })

  it("returns null for empty candidate", () => {
    expect(findDuplicateOptionValue("", existing)).toBeNull()
  })
})

describe("duplicateOptionValueMessage", () => {
  it("formats user-friendly message with option name", () => {
    expect(duplicateOptionValueMessage("red", "Color")).toBe(
      "Option value 'Red' already exists under 'Color'."
    )
  })

  it("formats message without option name", () => {
    expect(duplicateOptionValueMessage("RED")).toBe(
      "Option value 'Red' already exists."
    )
  })
})
