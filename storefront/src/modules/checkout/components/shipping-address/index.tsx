import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Input from "@modules/common/components/input"
import { useMedusaAuth } from "@lib/hooks/use-medusa-auth"
import { resolvePrefillAddress } from "@lib/util/prefill-address"
import { mapKeys } from "lodash"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import AddressSelect from "../address-select"

const ShippingAddress = ({
  customer,
  cart,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
}) => {
  const { session } = useMedusaAuth()

  // Detect account email and profile from Medusa customer or NextAuth session
  const activeAccountEmail = customer?.email || session?.user?.email || ""
  const activeAccountFirstName =
    customer?.first_name ||
    (session?.user?.name ? session.user.name.split(" ")[0] : "") ||
    ""
  const activeAccountLastName =
    customer?.last_name ||
    (session?.user?.name ? session.user.name.split(" ").slice(1).join(" ") : "") ||
    ""
  const activeAccountPhone = customer?.phone || ""

  const [formData, setFormData] = useState<Record<string, any>>(() => {
    // Use the centralized prefill resolver for the initial state
    const prefill = resolvePrefillAddress(
      customer,
      cart,
      session?.user?.email,
      session?.user?.name
    )

    // Cart-saved values always win over profile defaults (user may have already typed something)
    return {
      "shipping_address.first_name":
        cart?.shipping_address?.first_name || prefill.first_name,
      "shipping_address.last_name":
        cart?.shipping_address?.last_name || prefill.last_name,
      "shipping_address.address_1":
        cart?.shipping_address?.address_1 || prefill.address_1,
      "shipping_address.address_2":
        (cart?.shipping_address as any)?.address_2 || prefill.address_2,
      "shipping_address.company":
        (cart?.shipping_address as any)?.company || prefill.company,
      "shipping_address.postal_code":
        cart?.shipping_address?.postal_code || prefill.postal_code,
      "shipping_address.city":
        cart?.shipping_address?.city || prefill.city,
      "shipping_address.country_code":
        cart?.shipping_address?.country_code?.toUpperCase() ||
        prefill.country_code ||
        cart?.region?.countries?.[0]?.iso_2?.toUpperCase() ||
        "",
      "shipping_address.province":
        cart?.shipping_address?.province || prefill.province,
      "shipping_address.phone":
        cart?.shipping_address?.phone || prefill.phone,
      "location.lat": "",
      "location.lng": "",
      email: prefill.email,
    }
  })

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // check if customer has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      Array.isArray(customer?.addresses)
        ? customer.addresses.filter(
            (a) => a.country_code && countriesInRegion?.includes(a.country_code)
          )
        : [],
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = useCallback(
    (address?: HttpTypes.StoreCartAddress, email?: string) => {
      const activeEmail =
        customer?.email ||
        session?.user?.email ||
        (email && !email.includes("@example.com") ? email : "") ||
        email ||
        ""

      if (address) {
        setFormData((prevState: Record<string, any>) => ({
          ...prevState,
          "shipping_address.first_name":
            address?.first_name ||
            customer?.first_name ||
            prevState["shipping_address.first_name"] ||
            "",
          "shipping_address.last_name":
            address?.last_name ||
            customer?.last_name ||
            prevState["shipping_address.last_name"] ||
            "",
          "shipping_address.address_1": address?.address_1 || "",
          "shipping_address.address_2": (address as any)?.address_2 || "",
          "shipping_address.company": (address as any)?.company || "",
          "shipping_address.postal_code": address?.postal_code || "",
          "shipping_address.city": address?.city || "",
          "shipping_address.country_code":
            address?.country_code?.toUpperCase() ||
            cart?.region?.countries?.[0]?.iso_2?.toUpperCase() ||
            "",
          "shipping_address.province": address?.province || "",
          "shipping_address.phone":
            address?.phone ||
            customer?.phone ||
            prevState["shipping_address.phone"] ||
            "",
          "location.lat": prevState["location.lat"] || "",
          "location.lng": prevState["location.lng"] || "",
        }))
      }

      if (activeEmail) {
        setFormData((prevState: Record<string, any>) => ({
          ...prevState,
          email: activeEmail,
        }))
      }
    },
    [cart?.region?.countries, customer, session]
  )

  useEffect(() => {
    const defaultCountry =
      cart?.region?.countries?.[0]?.iso_2?.toUpperCase() || ""

    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    setFormData((prevState) => {
      const currentEmail = prevState.email
      const isPlaceholder =
        currentEmail && currentEmail.includes("@example.com")
      const resolvedEmail =
        activeAccountEmail ||
        (!isPlaceholder && currentEmail ? currentEmail : "") ||
        (cart?.email && !cart.email.includes("@example.com") ? cart.email : "") ||
        currentEmail ||
        ""

      return {
        ...prevState,
        "shipping_address.first_name":
          prevState["shipping_address.first_name"] ||
          activeAccountFirstName ||
          "",
        "shipping_address.last_name":
          prevState["shipping_address.last_name"] ||
          activeAccountLastName ||
          "",
        "shipping_address.phone":
          prevState["shipping_address.phone"] ||
          activeAccountPhone ||
          "",
        "shipping_address.country_code":
          prevState["shipping_address.country_code"] ||
          cart?.shipping_address?.country_code?.toUpperCase() ||
          defaultCountry,
        email: resolvedEmail,
      }
    })
  }, [
    cart,
    customer,
    session,
    activeAccountEmail,
    activeAccountFirstName,
    activeAccountLastName,
    activeAccountPhone,
    setFormAddress,
  ])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}
          </p>
          <AddressSelect
            addresses={Array.isArray(customer.addresses) ? customer.addresses : []}
            addressInput={mapKeys(formData, (_, key) =>
              key.replace("shipping_address.", "")
            ) as HttpTypes.StoreCartAddress}
            onSelect={setFormAddress}
          />
        </Container>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          name="shipping_address.first_name"
          autoComplete="given-name"
          value={formData["shipping_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-first-name-input"
        />
        <Input
          label="Last name"
          name="shipping_address.last_name"
          autoComplete="family-name"
          value={formData["shipping_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-last-name-input"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Input
          label="Phone"
          name="shipping_address.phone"
          autoComplete="tel"
          value={formData["shipping_address.phone"]}
          onChange={handleChange}
          required
          data-testid="shipping-phone-input"
        />
        <div className="flex flex-col">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
            data-testid="shipping-email-input"
          />
          {activeAccountEmail && formData.email === activeAccountEmail && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1 flex items-center gap-1">
              ✓ Using your account email
            </span>
          )}
        </div>
      </div>

      {/* Company — shown only when the customer has a company value saved */}
      {formData["shipping_address.company"] && (
        <div className="mt-4">
          <Input
            label="Company (optional)"
            name="shipping_address.company"
            autoComplete="organization"
            value={formData["shipping_address.company"]}
            onChange={handleChange}
            data-testid="shipping-company-input"
          />
        </div>
      )}

      {/* Address Line 2 — shown only when the customer has an address_2 value saved */}
      {formData["shipping_address.address_2"] && (
        <div className="mt-4">
          <Input
            label="Apartment, suite, etc. (optional)"
            name="shipping_address.address_2"
            autoComplete="address-line2"
            value={formData["shipping_address.address_2"]}
            onChange={handleChange}
            data-testid="shipping-address-2-input"
          />
        </div>
      )}

      <input
        type="hidden"
        name="shipping_address.address_1"
        value={formData["shipping_address.address_1"] || ""}
      />
      <input
        type="hidden"
        name="shipping_address.city"
        value={formData["shipping_address.city"] || ""}
      />
      <input
        type="hidden"
        name="shipping_address.postal_code"
        value={formData["shipping_address.postal_code"] || ""}
      />
      <input
        type="hidden"
        name="shipping_address.country_code"
        value={(formData["shipping_address.country_code"] || "").toLowerCase()}
      />
      <input
        type="hidden"
        name="shipping_address.province"
        value={formData["shipping_address.province"] || ""}
      />
      <input type="hidden" name="location.lat" value={formData["location.lat"] || ""} />
      <input type="hidden" name="location.lng" value={formData["location.lng"] || ""} />
      <input type="hidden" name="is_pickup" value="false" />

      <input type="hidden" name="same_as_billing" value="on" data-testid="billing-address-checkbox" />
    </>
  )
}

export default ShippingAddress
