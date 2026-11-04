import { NextRequest } from "next/server"

// Zapier webhook URL — override via FEEDBACK_WEBHOOK_URL env var in production
const WEBHOOK_URL =
  process.env.FEEDBACK_WEBHOOK_URL ||
  "https://hooks.zapier.com/hooks/catch/29337031/49g27jx/"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Flatten arrays to comma-separated strings for Sheets compatibility
    const payload = {
      submitted_at: body.submitted_at || new Date().toISOString(),
      product_types: Array.isArray(body.product_types)
        ? body.product_types.join(", ")
        : body.product_types,
      product_types_other: body.product_types_other || "",
      hard_to_find_products: body.hard_to_find_products || "",
      navigation_ease: body.navigation_ease || "",
      website_improvements: Array.isArray(body.website_improvements)
        ? body.website_improvements.join(", ")
        : body.website_improvements,
      website_improvements_other: body.website_improvements_other || "",
      purchase_likelihood: body.purchase_likelihood ?? "",
      what_you_like: body.what_you_like || "",
      suggested_improvements: body.suggested_improvements || "",
      wants_contact: body.wants_contact || "no",
      contact_name: body.contact_name || "",
      contact_phone: body.contact_phone || "",
      contact_email: body.contact_email || "",
    }

    if (WEBHOOK_URL) {
      console.log("[Feedback] Sending to webhook:", WEBHOOK_URL)
      const webhookResponse = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const webhookStatus = webhookResponse.status
      const webhookBody = await webhookResponse.text()
      console.log(
        "[Feedback] Webhook response:",
        webhookStatus,
        webhookBody
      )
      if (!webhookResponse.ok) {
        console.error("[Feedback] Webhook error:", webhookStatus, webhookBody)
        return Response.json(
          {
            success: false,
            message: "Could not record your feedback. Please try again.",
          },
          { status: 502 }
        )
      }
    } else {
      // Log for development when no webhook is configured
      console.log(
        "[Feedback] Survey submission (no webhook configured):",
        payload
      )
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("[Feedback] Error processing submission:", error)
    return Response.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}
