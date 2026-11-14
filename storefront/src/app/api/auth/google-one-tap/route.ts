import { NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"
import { revalidateTag } from "next/cache"
import { sdk } from "@lib/config"
import { getCacheTag, setAuthToken } from "@lib/data/cookies"
import { transferCart } from "@lib/data/customer"

/**
 * Derives a per-user, server-only bridge password from Google sub ID.
 * Matches NextAuth derivation in src/app/api/auth/[...nextauth]/route.ts
 * so customer records remain unified across login flows.
 */
function deriveBridgePassword(googleSub: string): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required for auth bridge")
  }
  return createHmac("sha256", secret).update(googleSub).digest("hex")
}

interface GoogleTokenInfo {
  iss: string
  sub: string
  aud: string
  email: string
  email_verified: string | boolean
  name?: string
  picture?: string
  given_name?: string
  family_name?: string
  exp: string | number
  error_description?: string
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("_medusa_jwt")?.value
    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    // Verify token validity with a lightweight call to /store/customers/me
    const customer = await sdk.store.customer
      .retrieve({}, { authorization: `Bearer ${token}` })
      .then((res) => res.customer)
      .catch(() => null)

    if (!customer) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
      },
    })
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const credential = body?.credential

    if (!credential || typeof credential !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid Google credential token" },
        { status: 400 }
      )
    }

    const expectedClientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID ||
      ""

    if (!expectedClientId) {
      console.error("[Google One Tap] Neither NEXT_PUBLIC_GOOGLE_CLIENT_ID nor GOOGLE_CLIENT_ID is configured")
      return NextResponse.json(
        { error: "Server authentication is not properly configured" },
        { status: 500 }
      )
    }

    // Secure server-side validation against Google's tokeninfo endpoint
    const tokenInfoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
      { method: "GET" }
    )

    if (!tokenInfoRes.ok) {
      const errText = await tokenInfoRes.text()
      console.error("[Google One Tap] Token verification failed:", errText)
      return NextResponse.json(
        { error: "Google token verification failed" },
        { status: 401 }
      )
    }

    const tokenInfo: GoogleTokenInfo = await tokenInfoRes.json()

    // 1. Validate audience (aud must match our client ID)
    if (tokenInfo.aud !== expectedClientId) {
      console.error(
        `[Google One Tap] Audience mismatch. Expected: ${expectedClientId}, got: ${tokenInfo.aud}`
      )
      return NextResponse.json(
        { error: "Invalid token audience" },
        { status: 401 }
      )
    }

    // 2. Validate issuer
    if (
      tokenInfo.iss !== "accounts.google.com" &&
      tokenInfo.iss !== "https://accounts.google.com"
    ) {
      console.error(`[Google One Tap] Issuer mismatch: ${tokenInfo.iss}`)
      return NextResponse.json(
        { error: "Invalid token issuer" },
        { status: 401 }
      )
    }

    // 3. Validate expiration
    const expTime = Number(tokenInfo.exp) * 1000
    if (Date.now() >= expTime) {
      return NextResponse.json(
        { error: "Google token has expired" },
        { status: 401 }
      )
    }

    // 4. Validate email verification
    const isEmailVerified =
      tokenInfo.email_verified === true || tokenInfo.email_verified === "true"
    if (!isEmailVerified || !tokenInfo.email) {
      return NextResponse.json(
        { error: "Unverified Google email is not permitted" },
        { status: 403 }
      )
    }

    const email = tokenInfo.email.toLowerCase().trim()
    const googleSub = tokenInfo.sub
    const firstName =
      tokenInfo.given_name || tokenInfo.name?.trim().split(/\s+/)[0] || "Customer"
    const lastName =
      tokenInfo.family_name ||
      tokenInfo.name?.trim().split(/\s+/).slice(1).join(" ") ||
      ""

    const password = deriveBridgePassword(googleSub)

    // 1. Register auth identity if not already present
    try {
      await sdk.auth.register("customer", "emailpass", { email, password })
    } catch {
      // Identity already registered; proceed directly to login
    }

    // 2. Exchange credentials for Medusa JWT
    let medusaToken: string | null = null
    try {
      const authResult = await sdk.auth.login("customer", "emailpass", {
        email,
        password,
      })
      medusaToken =
        typeof authResult === "string"
          ? authResult
          : (authResult as any)?.token ?? null
    } catch (loginErr) {
      console.error("[Google One Tap] Medusa login failed:", loginErr)
      return NextResponse.json(
        { error: "Failed to authenticate with store backend" },
        { status: 500 }
      )
    }

    if (!medusaToken) {
      return NextResponse.json(
        { error: "Authentication succeeded but no session token was issued" },
        { status: 500 }
      )
    }

    // 3. Upsert customer profile in Medusa
    const authHeader = { authorization: `Bearer ${medusaToken}` }
    try {
      const customerExists = await sdk.store.customer
        .retrieve({}, authHeader)
        .then(() => true)
        .catch(() => false)

      if (!customerExists) {
        await sdk.store.customer.create(
          {
            email,
            first_name: firstName,
            last_name: lastName,
          },
          {},
          authHeader
        )

        // Refresh token to bind the customer actor
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
          .update(
            {
              first_name: firstName,
              last_name: lastName,
            },
            {},
            authHeader
          )
          .catch(() => {})
      }
    } catch (upsertErr) {
      console.warn("[Google One Tap] Customer profile upsert warning:", upsertErr)
      // Non-fatal if session token was already obtained
    }

    // 4. Set Medusa authenticated cookie
    if (!medusaToken) {
      return NextResponse.json(
        { error: "Authentication failed to produce a valid session token" },
        { status: 500 }
      )
    }

    await setAuthToken(medusaToken)

    // 5. Revalidate customer cache
    const customerCacheTag = await getCacheTag("customers")
    if (customerCacheTag) {
      revalidateTag(customerCacheTag)
    }

    // 6. Transfer any guest cart to the authenticated user
    try {
      await transferCart()
    } catch (cartErr) {
      console.warn("[Google One Tap] Cart transfer notice:", cartErr)
    }

    return NextResponse.json({
      success: true,
      user: {
        email,
        first_name: firstName,
        last_name: lastName,
        picture: tokenInfo.picture,
      },
    })
  } catch (err: any) {
    console.error("[Google One Tap] Unexpected server error:", err)
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
