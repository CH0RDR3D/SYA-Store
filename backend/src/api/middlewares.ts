import { authenticate, defineMiddlewares } from "@medusajs/framework"
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

type AuthenticatedMedusaRequest = MedusaRequest & {
  auth_context?: { actor_id?: string }
}

const requireCustomerForPromotions = (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const hasPromoCodes = Object.prototype.hasOwnProperty.call(req.body ?? {}, "promo_codes")

  if (!hasPromoCodes || req.auth_context?.actor_id) {
    next()
    return
  }

  res.status(401).json({
    message: "Sign in or create an account to use promotion codes",
  })
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
  ],
})
