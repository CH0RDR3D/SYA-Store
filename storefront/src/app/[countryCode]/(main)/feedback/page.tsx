import type { Metadata } from "next"
import { notFound } from "next/navigation"
import FeedbackSurvey from "@modules/common/components/feedback-survey"

export const metadata: Metadata = {
  title: "Customer Feedback | SYA Online Trading",
  description:
    "Share your experience with SYA Online Trading and help us improve our products and service.",
}

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Minimal header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
        <div>
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold">
            SYA Online Trading
          </p>
          <h1 className="text-white font-semibold text-lg">Customer Feedback</h1>
        </div>
        <a
          href="/"
          className="text-zinc-400 hover:text-white text-sm border border-zinc-700 hover:border-amber-400/40 px-4 py-2 rounded-lg transition"
        >
          ← Back to Store
        </a>
      </div>

      {/* Survey fills the rest of the page */}
      <div className="flex-1 flex flex-col">
        <FeedbackSurvey
          onClose={() => {
            if (typeof window !== "undefined") {
              window.location.href = "/"
            }
          }}
        />
      </div>
    </div>
  )
}
