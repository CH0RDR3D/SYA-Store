/**
 * Unit tests for Checkout Address Prefill Utility
 *
 * Run with: npx jest src/__tests__/prefill-address.spec.ts
 * (from storefront directory, adjust jest config path accordingly)
 */

import { resolvePrefillAddress } from "../lib/util/prefill-address"
import type { HttpTypes } from "@medusajs/types"

const baseCart = {
  region: {
    countries: [{ iso_2: "zm" }],
  },
  shipping_address: null,
  email: null,
} as unknown as HttpTypes.StoreCart

const makeCustomer = (
  overrides: Partial<HttpTypes.StoreCustomer> = {}
): HttpTypes.StoreCustomer =>
  ({
    id: "cust_1",
    email: "test@example.com",
    first_name: "John",
    last_name: "Doe",
    phone: "+260971000000",
    addresses: [],
    ...overrides,
  } as unknown as HttpTypes.StoreCustomer)

describe("resolvePrefillAddress", () => {
  it("returns empty strings for guest with empty cart", () => {
    const result = resolvePrefillAddress(null, baseCart)
    expect(result.first_name).toBe("")
    expect(result.email).toBe("")
    expect(result.address_1).toBe("")
  })

  it("uses profile fields for customer with no addresses", () => {
    const customer = makeCustomer()
    const result = resolvePrefillAddress(customer, baseCart)
    expect(result.first_name).toBe("John")
    expect(result.last_name).toBe("Doe")
    expect(result.email).toBe("test@example.com")
    expect(result.phone).toBe("+260971000000")
    expect(result.address_1).toBe("")
  })

  it("prefers default shipping address over other addresses", () => {
    const customer = makeCustomer({
      addresses: [
        {
          id: "addr_1",
          first_name: "John",
          last_name: "Doe",
          address_1: "123 Main St",
          city: "Lusaka",
          country_code: "zm",
          is_default_shipping: true,
        } as any,
        {
          id: "addr_2",
          first_name: "John",
          last_name: "Doe",
          address_1: "456 Other St",
          city: "Kitwe",
          country_code: "zm",
          is_default_shipping: false,
        } as any,
      ],
    })
    const result = resolvePrefillAddress(customer, baseCart)
    expect(result.address_1).toBe("123 Main St")
    expect(result.city).toBe("Lusaka")
  })

  it("falls back to region-matching address when no default", () => {
    const customer = makeCustomer({
      addresses: [
        {
          id: "addr_1",
          address_1: "789 Region St",
          city: "Ndola",
          country_code: "zm",
          is_default_shipping: false,
        } as any,
      ],
    })
    const result = resolvePrefillAddress(customer, baseCart)
    expect(result.address_1).toBe("789 Region St")
  })

  it("falls back to latest order address when no saved addresses", () => {
    const customerWithOrders = makeCustomer({
      addresses: [],
      orders: [
        {
          shipping_address: {
            address_1: "Order Address Lane",
            city: "Livingstone",
            country_code: "zm",
            first_name: "John",
            last_name: "Doe",
          },
          created_at: "2026-01-01T00:00:00Z",
        },
      ],
    } as any)
    const result = resolvePrefillAddress(customerWithOrders, baseCart)
    expect(result.address_1).toBe("Order Address Lane")
    expect(result.city).toBe("Livingstone")
  })

  it("uses session name and email for guest with NextAuth session", () => {
    const result = resolvePrefillAddress(
      null,
      baseCart,
      "session@example.com",
      "Jane Smith"
    )
    expect(result.email).toBe("session@example.com")
    expect(result.first_name).toBe("Jane")
    expect(result.last_name).toBe("Smith")
  })

  it("customer email takes priority over session email", () => {
    const customer = makeCustomer({ email: "customer@example.com" })
    const result = resolvePrefillAddress(
      customer,
      baseCart,
      "session@example.com",
      "Session User"
    )
    expect(result.email).toBe("customer@example.com")
  })

  it("uppercases country code in result", () => {
    const customer = makeCustomer({
      addresses: [
        {
          id: "addr_1",
          address_1: "1 Test St",
          country_code: "zm",
          is_default_shipping: true,
        } as any,
      ],
    })
    const result = resolvePrefillAddress(customer, baseCart)
    expect(result.country_code).toBe("ZM")
  })
})
