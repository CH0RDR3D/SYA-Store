"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FeedbackSurvey from "@modules/common/components/feedback-survey"

interface FeedbackBannerProps {
  className?: string
  containerClassName?: string
}

export default function FeedbackBanner({
  className = "",
  containerClassName = "",
}: FeedbackBannerProps) {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const router = useRouter()

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
      router.push("/feedback")
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

      {/* Feedback Modal — full-screen takeover */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex flex-col">
          {/* Modal panel */}
          <div className="flex-1 bg-zinc-950 flex flex-col overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-white">Customer Feedback Form</h3>
                <p className="text-sm text-zinc-400">Help us improve your shopping experience</p>
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

            {/* Survey component fills the rest */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <FeedbackSurvey onClose={() => setFeedbackModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
