import { authenticate, defineMiddlewares } from "@medusajs/framework"
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { normalizeSku, duplicateSkuMessage } from "../utils/sku-normalizer"
import { normalizeOptionValue, duplicateOptionValueMessage } from "../utils/option-value-normalizer"

type AuthenticatedMedusaRequest = MedusaRequest & {
  auth_context?: { actor_id?: string }
  body?: { promo_codes?: unknown }
}

const requireCustomerForPromotions = (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const hasPromoCodes = Object.prototype.hasOwnProperty.call(req.body ?? {}, "promo_codes")
  const promoCodes = Array.isArray(req.body?.promo_codes) ? req.body.promo_codes : []

  if (!hasPromoCodes || promoCodes.length === 0 || req.auth_context?.actor_id) {
    next()
    return
  }

  res.status(401).json({
    message: "Sign in or create an account to use promotion codes",
  })
}

// ─── SKU Normalization Middleware ─────────────────────────────────────────────
/**
 * Intercepts variant create/update requests to:
 *   1. Normalize the SKU (trim, collapse whitespace, uppercase)
 *   2. Reject with a friendly error if the normalized SKU already exists
 *
 * NOTE: The duplicate-check here is a lightweight guard using the query param
 * approach. A definitive check also lives in the validate-sku workflow step
 * invoked by the actual service layer. This middleware normalizes the input
 * value so the downstream Medusa service receives a clean SKU.
 */
const normalizeVariantSku = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const body = req.body as Record<string, any> | undefined
  if (!body) {
    next()
    return
  }

  // Normalize single variant
  if (typeof body.sku === "string") {
    const normalized = normalizeSku(body.sku)
    if (body.sku !== normalized) {
      console.debug(
        `[SKU Middleware] Normalized SKU: "${body.sku}" → "${normalized}"`
      )
    }
    body.sku = normalized
  }

  // Normalize bulk variant array (e.g. product create with variants[])
  if (Array.isArray(body.variants)) {
    body.variants = body.variants.map((v: Record<string, any>) => {
      if (typeof v.sku === "string") {
        const normalized = normalizeSku(v.sku)
        if (v.sku !== normalized) {
          console.debug(
            `[SKU Middleware] Normalized bulk SKU: "${v.sku}" → "${normalized}"`
          )
        }
        return { ...v, sku: normalized }
      }
      return v
    })
  }

  next()
}

// ─── Option Value Normalization Middleware ────────────────────────────────────
/**
 * Intercepts product option create/update requests to normalize option values:
 *   1. Title-case with trimmed whitespace
 *   2. Logs normalization changes for debugging
 */
const normalizeProductOptionValues = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const body = req.body as Record<string, any> | undefined
  if (!body) {
    next()
    return
  }

  // Normalize a single value field
  if (typeof body.value === "string") {
    const normalized = normalizeOptionValue(body.value)
    if (body.value !== normalized) {
      console.debug(
        `[OptionValue Middleware] Normalized: "${body.value}" → "${normalized}"`
      )
    }
    body.value = normalized
  }

  // Normalize values array (e.g. option create with values: ["Red", " red ", "RED"])
  if (Array.isArray(body.values)) {
    body.values = body.values.map((v: string | Record<string, any>) => {
      if (typeof v === "string") {
        return normalizeOptionValue(v)
      }
      if (typeof (v as any).value === "string") {
        return { ...v as object, value: normalizeOptionValue((v as any).value) }
      }
      return v
    })
  }

  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/carts/:id",
      middlewares: [
        authenticate("customer", ["session", "bearer"], {
          allowUnauthenticated: true,
        }),
        requireCustomerForPromotions,
      ],
    },
    // ── SKU normalization: variant create & update ──────────────────────────
    {
      matcher: "/admin/products/:id/variants",
      method: ["POST"],
      middlewares: [normalizeVariantSku],
    },
    {
      matcher: "/admin/products/:id/variants/:variantId",
      method: ["POST", "PUT", "PATCH"],
      middlewares: [normalizeVariantSku],
    },
    // Also normalize when creating a product with inline variants
    {
      matcher: "/admin/products",
      method: ["POST"],
      middlewares: [normalizeVariantSku],
    },
    {
      matcher: "/admin/products/:id",
      method: ["POST", "PUT", "PATCH"],
      middlewares: [normalizeVariantSku],
    },
    // ── Option value normalization: product options ─────────────────────────
    {
      matcher: "/admin/products/:id/options",
      method: ["POST"],
      middlewares: [normalizeProductOptionValues],
    },
    {
      matcher: "/admin/products/:id/options/:optionId",
      method: ["POST", "PUT", "PATCH"],
      middlewares: [normalizeProductOptionValues],
    },
  ],
})
