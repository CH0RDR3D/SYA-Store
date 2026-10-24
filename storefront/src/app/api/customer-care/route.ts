import { NextRequest } from "next/server"

const getBackendUrl = () =>
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

const getPublishableApiKey = () =>
  process.env.MEDUSA_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  ""

export async function POST(request: NextRequest) {
  try {
    const configuredBackendUrl = getBackendUrl()
    const backendUrl = new URL(
      configuredBackendUrl.startsWith("http")
        ? configuredBackendUrl
        : `https://${configuredBackendUrl}`
    )
    backendUrl.pathname = "/store/customer-care"

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(getPublishableApiKey()
          ? { "x-publishable-api-key": getPublishableApiKey() }
          : {}),
      },
      body: await request.text(),
      cache: "no-store",
    })

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") || "application/json",
      },
    })
  } catch (error) {
    console.error("[CustomerCare] Failed to reach the Medusa backend:", error)
    return Response.json(
      {
        success: false,
        message: "We could not send your message right now. Please try again or contact us by phone or WhatsApp.",
      },
      { status: 502 }
    )
  }
}
