import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Resend } from "resend"

const supportTopics = [
  "General Inquiry",
  "Order & Delivery Status",
  "Payment & Lenco",
  "Returns & Warranty",
  "Products & Shopping",
  "Solar & Hardware",
] as const

type ContactRequest = {
  name: string
  email: string
  phone: string
  topic: (typeof supportTopics)[number]
  orderNumber: string
  message: string
  website: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const isString = (value: unknown): value is string => typeof value === "string"

const isSupportTopic = (value: string): value is ContactRequest["topic"] =>
  supportTopics.some((topic) => topic === value)

const parseContactRequest = (body: unknown): ContactRequest | null => {
  if (!isRecord(body)) {
    return null
  }

  const { name, email, phone, topic, orderNumber, message, website } = body
  if (
    !isString(name) ||
    !isString(email) ||
    !isString(topic) ||
    !isSupportTopic(topic) ||
    !isString(message) ||
    (phone !== undefined && !isString(phone)) ||
    (orderNumber !== undefined && !isString(orderNumber)) ||
    (website !== undefined && !isString(website))
  ) {
    return null
  }

  const contact = {
    name: name.trim(),
    email: email.trim(),
    phone: typeof phone === "string" ? phone.trim() : "",
    topic,
    orderNumber: typeof orderNumber === "string" ? orderNumber.trim() : "",
    message: message.trim(),
    website: typeof website === "string" ? website.trim() : "",
  }

  if (
    !contact.name ||
    contact.name.length > 120 ||
    contact.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) ||
    contact.phone.length > 40 ||
    (contact.phone && !/^[+()\d\s.-]{7,40}$/.test(contact.phone)) ||
    contact.orderNumber.length > 100 ||
    contact.message.length < 10 ||
    contact.message.length > 5000
  ) {
    return null
  }

  return contact
}

const sendEmail = async (
  resend: Resend,
  message: Parameters<Resend["emails"]["send"]>[0]
): Promise<string | null> => {
  try {
    const { error } = await resend.emails.send(message)
    return error?.message ?? null
  } catch (error) {
    return error instanceof Error ? error.message : "Network error"
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const contact = parseContactRequest(req.body)

  if (!contact) {
    res.status(400).json({
      success: false,
      message: "Please check the form details and try again.",
    })
    return
  }

  if (contact.website) {
    res.status(200).json({ success: true, confirmationSent: true })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  const configuredFrom =
    process.env.RESEND_FROM_EMAIL?.trim() || process.env.RESEND_FROM?.trim()

  if (!apiKey || !configuredFrom) {
    res.status(503).json({
      success: false,
      message: "Customer Care email is temporarily unavailable. Please contact us by phone or WhatsApp.",
    })
    return
  }

  const from = configuredFrom.includes("<")
    ? configuredFrom
    : `SYA Store Customer Care <${configuredFrom}>`
  const resend = new Resend(apiKey)

  const internalEmailError = await sendEmail(resend, {
    from,
    to: "info@syastore.com",
    bcc: ["syageneraldealers@outlook.com", "s.y.a.generalers@gmail.com"],
    replyTo: contact.email,
    subject: `Customer Care: ${contact.topic}`,
    text: [
      "New customer care inquiry",
      "",
      `Name: ${contact.name}`,
      `Email: ${contact.email}`,
      `Phone: ${contact.phone || "Not provided"}`,
      `Topic: ${contact.topic}`,
      `Order number: ${contact.orderNumber || "Not provided"}`,
      "",
      "Message:",
      contact.message,
    ].join("\n"),
  })

  if (internalEmailError) {
    console.error("[CustomerCare] Failed to deliver support inquiry:", internalEmailError)
    res.status(502).json({
      success: false,
      message: "We could not send your message right now. Please try again or contact us by phone or WhatsApp.",
    })
    return
  }

  const confirmationEmailError = await sendEmail(resend, {
    from,
    to: contact.email,
    subject: "We received your message | SYA Store Customer Care",
    text: [
      `Hello ${contact.name},`,
      "",
      "Thank you for contacting SYA Store Customer Care. We have received your inquiry and our team will respond as soon as possible.",
      "",
      `Topic: ${contact.topic}`,
      contact.orderNumber ? `Order number: ${contact.orderNumber}` : "",
      "",
      "If you need urgent assistance, call or WhatsApp us on 0976666611.",
      "",
      "SYA Store Customer Care",
    ]
      .filter(Boolean)
      .join("\n"),
  })

  if (confirmationEmailError) {
    console.error(
      "[CustomerCare] Support inquiry was delivered, but the customer confirmation failed:",
      confirmationEmailError
    )
  }

  res.status(200).json({
    success: true,
    confirmationSent: !confirmationEmailError,
  })
}
