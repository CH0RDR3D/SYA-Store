import { HttpTypes } from "@medusajs/types"

/**
 * Prefill Address Utility
 *
 * Resolves the best address for checkout prefill in priority order:
 *   1. Customer's explicitly marked default shipping address
 *   2. The first address in the customer's saved list that matches the cart region
 *   3. The shipping address from the customer's most recent order (if available)
 *   4. Empty strings (graceful fallback for guest / new customers)
 *
 * Changes are only applied to the checkout form's local state — they are
 * never automatically persisted back to the customer's profile unless the
 * customer explicitly opts in.
 */

export type PrefillAddressResult = {
  first_name: string
  last_name: string
  email: string
  phone: string
  company: string
  address_1: string
  address_2: string
  city: string
  province: string
  postal_code: string
  country_code: string
}

/**
 * Resolves the best address to prefill checkout fields.
 *
 * @param customer           The authenticated customer (or null for guests).
 * @param cart               The current cart (used for region country matching).
 * @param sessionEmail       Email from NextAuth session (fallback).
 * @param sessionName        Full name from NextAuth session (fallback).
 */
export function resolvePrefillAddress(
  customer: HttpTypes.StoreCustomer | null | undefined,
  cart: HttpTypes.StoreCart | null | undefined,
  sessionEmail?: string | null,
  sessionName?: string | null
): PrefillAddressResult {
  const empty: PrefillAddressResult = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    address_1: "",
    address_2: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: "",
  }

  // Resolve name from session as a fallback
  const sessionFirstName = sessionName ? sessionName.split(" ")[0] : ""
  const sessionLastName = sessionName
    ? sessionName.split(" ").slice(1).join(" ")
    : ""

  // Profile-level fields (not address-specific)
  const profileFields = {
    first_name:
      customer?.first_name || sessionFirstName || "",
    last_name:
      customer?.last_name || sessionLastName || "",
    email:
      customer?.email ||
      sessionEmail ||
      (cart?.email && !cart.email.includes("@example.com")
        ? cart.email
        : "") ||
      "",
    phone: customer?.phone || "",
  }

  // Country codes covered by the cart region (for address matching)
  const regionCountryCodes =
    cart?.region?.countries?.map((c) => c.iso_2?.toLowerCase()).filter(Boolean) ?? []

  // ── Priority 1: Default shipping address ───────────────────────────────────
  const addresses = Array.isArray(customer?.addresses) ? customer!.addresses : []

  const defaultShipping = addresses.find((a) => a.is_default_shipping)
  if (defaultShipping) {
    return {
      ...empty,
      ...profileFields,
      phone:
        defaultShipping.phone || profileFields.phone,
      company: defaultShipping.company || "",
      address_1: defaultShipping.address_1 || "",
      address_2: defaultShipping.address_2 || "",
      city: defaultShipping.city || "",
      province: defaultShipping.province || "",
      postal_code: defaultShipping.postal_code || "",
      country_code:
        (defaultShipping.country_code || regionCountryCodes[0] || "").toUpperCase(),
    }
  }

  // ── Priority 2: First address matching the cart region ────────────────────
  const regionAddress = regionCountryCodes.length
    ? addresses.find(
        (a) =>
          a.country_code &&
          regionCountryCodes.includes(a.country_code.toLowerCase())
      )
    : undefined

  if (regionAddress) {
    return {
      ...empty,
      ...profileFields,
      phone: regionAddress.phone || profileFields.phone,
      company: regionAddress.company || "",
      address_1: regionAddress.address_1 || "",
      address_2: regionAddress.address_2 || "",
      city: regionAddress.city || "",
      province: regionAddress.province || "",
      postal_code: regionAddress.postal_code || "",
      country_code:
        (regionAddress.country_code || regionCountryCodes[0] || "").toUpperCase(),
    }
  }

  // ── Priority 3: Latest order's shipping address ───────────────────────────
  // Requires customer to be fetched with `*orders.shipping_address`
  const orders = (customer as any)?.orders as
    | Array<{ shipping_address?: HttpTypes.StoreCartAddress; created_at?: string }>
    | undefined

  if (Array.isArray(orders) && orders.length > 0) {
    // Sort descending by creation date and pick the most recent with an address
    const sorted = [...orders].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0
      return tb - ta
    })

    const latestWithAddress = sorted.find((o) => o.shipping_address?.address_1)

    if (latestWithAddress?.shipping_address) {
      const addr = latestWithAddress.shipping_address
      return {
        ...empty,
        ...profileFields,
        phone: addr.phone || profileFields.phone,
        company: (addr as any).company || "",
        address_1: addr.address_1 || "",
        address_2: addr.address_2 || "",
        city: addr.city || "",
        province: addr.province || "",
        postal_code: addr.postal_code || "",
        country_code:
          (addr.country_code || regionCountryCodes[0] || "").toUpperCase(),
      }
    }
  }

  // ── Priority 4: Graceful empty fallback ───────────────────────────────────
  return {
    ...empty,
    ...profileFields,
    country_code:
      (cart?.shipping_address?.country_code ||
        regionCountryCodes[0] ||
        ""
      ).toUpperCase(),
  }
}
