/**
 * NextAuth route handler – server-only (no "use client").
 *
 * Strategy: Google OAuth → deterministic per-user HMAC bridge password →
 *   Medusa emailpass register/login → customer create/update → medusaToken
 *   stored in JWT and surfaced on session.user for the client hook.
 */
import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { createHmac } from "crypto"
import { sdk } from "@lib/config"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derives a per-user, server-only bridge password from the Google sub ID and
 * the NEXTAUTH_SECRET. This keeps passwords out of the codebase and out of
 * any client bundle while still being deterministic (same user → same token).
 */
function deriveBridgePassword(googleSub: string): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required")
  }
  return createHmac("sha256", secret).update(googleSub).digest("hex")
}

// ---------------------------------------------------------------------------
// Auth options
// ---------------------------------------------------------------------------

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    /**
     * Runs server-side after Google confirms the user.
     * Registers or updates the corresponding Medusa customer record and
     * attaches the Medusa JWT as `user.medusaToken`.
     */
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true

      const email = user.email?.toLowerCase().trim()
      const googleSub = account.providerAccountId // stable Google user ID

      if (!email) {
        console.error("[NextAuth] Google sign-in: email missing")
        return false
      }

      // Parse name parts from Google display name
      const nameParts = (user.name ?? "").trim().split(/\s+/)
      const first_name = nameParts[0] ?? ""
      const last_name = nameParts.slice(1).join(" ")

      const backendUrl =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const publishableKey =
        process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
      const bridgeSecret =
        process.env.AUTH_BRIDGE_SECRET ||
        process.env.NEXTAUTH_SECRET ||
        "c0a0f3f9fee091c3caea61c45fb8be2270d32811f54d0257aa13322f615b59b2"

      let medusaToken: string | null = null

      // Primary: Secure direct bridge to backend /store/auth/google
      // Handles both new users and existing password/admin users seamlessly
      try {
        const bridgeRes = await fetch(`${backendUrl}/store/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": publishableKey,
            "x-auth-bridge-secret": bridgeSecret,
          },
          body: JSON.stringify({
            email,
            google_id: googleSub,
            first_name,
            last_name,
            name: user.name,
            avatar: user.image,
          }),
        })

        if (bridgeRes.ok) {
          const bridgeData = await bridgeRes.json()
          medusaToken = bridgeData.token
        } else {
          console.warn(
            `[NextAuth] Direct Google bridge returned ${bridgeRes.status}, falling back to legacy emailpass bridge`
          )
        }
      } catch (bridgeErr) {
        console.warn("[NextAuth] Direct Google bridge request error, falling back:", bridgeErr)
      }

      // Fallback: Legacy emailpass bridge if custom endpoint was not reached
      if (!medusaToken) {
        const password = deriveBridgePassword(googleSub)

        let registerToken: string | null = null
        try {
          const registerResult = await sdk.auth.register("customer", "emailpass", {
            email,
            password,
          })
          if (typeof registerResult === "string") {
            registerToken = registerResult
          } else if (typeof registerResult === "object" && (registerResult as any)?.token) {
            registerToken = (registerResult as any).token
          }
        } catch {
          // Identity already exists – proceed to login
        }

        if (registerToken) {
          try {
            await sdk.auth.verification.confirm({ code: registerToken })
          } catch (verErr) {
            console.warn("[NextAuth] Register verification confirm attempt:", verErr)
          }
        }

        try {
          const authResult = await sdk.auth.login("customer", "emailpass", {
            email,
            password,
          })

          if (typeof authResult === "string") {
            medusaToken = authResult
          } else if (
            typeof authResult === "object" &&
            (authResult as any)?.verification_required
          ) {
            const verToken = (authResult as any).token as string | undefined
            if (verToken) {
              try {
                await sdk.auth.verification.confirm({ code: verToken })
              } catch {
                // Ignore
              }
              const retryResult = await sdk.auth.login("customer", "emailpass", {
                email,
                password,
              })
              medusaToken =
                typeof retryResult === "string"
                  ? retryResult
                  : (retryResult as any)?.token ?? null
            }
          } else {
            medusaToken = (authResult as any)?.token ?? null
          }
        } catch (err) {
          console.error("[NextAuth] Medusa login failed:", err)
          return false
        }

        if (!medusaToken) {
          console.error("[NextAuth] Medusa token is null after login")
          return false
        }

        // Upsert customer profile in fallback mode
        const authHeader = { authorization: `Bearer ${medusaToken}` }
        try {
          const exists = await sdk.store.customer
            .retrieve({}, authHeader)
            .then(() => true)
            .catch(() => false)

          if (!exists) {
            await sdk.store.customer.create(
              { email, first_name, last_name },
              {},
              authHeader
            )
            const refreshed = await sdk.auth.login("customer", "emailpass", {
              email,
              password,
            })
            medusaToken =
              typeof refreshed === "string"
                ? refreshed
                : (refreshed as any)?.token ?? medusaToken
          } else {
            await sdk.store.customer
              .update({ first_name, last_name }, {}, authHeader)
              .catch(() => {})
          }
        } catch (err) {
          console.error("[NextAuth] Customer upsert failed:", err)
          return false
        }
      }

      // Attach for the jwt callback
      ;(user as any).medusaToken = medusaToken
      return true
    },

    /**
     * Persists the Medusa token inside the encrypted JWT cookie.
     */
    async jwt({ token, user }) {
      if (user && (user as any).medusaToken) {
        token.medusaToken = (user as any).medusaToken
      }
      return token
    },

    /**
     * Exposes the Medusa token on the session object so client components can
     * read it via `useSession()`.
     */
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.sub
        ;(session.user as any).medusaToken = token.medusaToken
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
