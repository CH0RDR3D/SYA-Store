"use client"

import React, { useState, useEffect } from "react"

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSevQ_jBCYSqDy71G232pRp6WWTH2PiPK4l7RQ04rD6npi72pA/viewform"
const GOOGLE_FORM_EMBED_URL = `${GOOGLE_FORM_URL}?embedded=true`

interface FeedbackBannerProps {
  className?: string
  containerClassName?: string
}

export default function FeedbackBanner({
  className = "",
  containerClassName = "",
}: FeedbackBannerProps) {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)

  // Close modal on Escape and lock background scrolling
  useEffect(() => {
    if (!feedbackModalOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFeedbackModalOpen(false)
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [feedbackModalOpen])

  const handleFeedbackClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      window.open(GOOGLE_FORM_URL, "_blank")
      return
    }
    setFeedbackModalOpen(true)
  }

  return (
    <div className={containerClassName}>
      <div
        className={`relative w-full rounded-2xl overflow-hidden flex items-center justify-between px-6 sm:px-8 py-6 md:py-8 ${className}`}
        style={{
          background: "linear-gradient(135deg, #1a1200 0%, #2a1f00 50%, #1a1200 100%)",
          border: "1px solid rgba(251,191,36,0.2)",
        }}
      >
        <div className="relative z-10 max-w-lg">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-semibold mb-2">
            We Value Your Opinion
          </p>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Tell Us About Your Experience With SYA
          </h3>
          <p className="text-gray-300 text-sm mb-5">
            Your feedback helps us improve our products, service, and delivery experience. It only takes a minute to complete.
          </p>
          <button
            type="button"
            onClick={handleFeedbackClick}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-sm font-bold rounded-lg transition hover:scale-105 shadow-lg shadow-amber-400/20 cursor-pointer"
          >
            <span>Give Feedback</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>

        {/* Decorative subtle gold glow orbs */}
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-72 h-72 bg-amber-400/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -left-16 bottom-0 w-48 h-48 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none" />
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #fbbf24, transparent)", transform: "translate(40%, -40%)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #fbbf24, transparent)", transform: "translateY(40%)" }}
        />
      </div>

      {/* Feedback Modal */}
      {feedbackModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setFeedbackModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-amber-500/20 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Customer Feedback Form
                </h3>
                <p className="text-sm text-zinc-400">
                  Help us improve your shopping experience
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFeedbackModalOpen(false)}
                className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 w-full overflow-y-auto bg-zinc-950">
              <iframe
                src={GOOGLE_FORM_EMBED_URL}
                width="100%"
                height="700"
                className="w-full border-0 min-h-[500px]"
                title="Customer Feedback Form"
              >
                Loading...
              </iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

