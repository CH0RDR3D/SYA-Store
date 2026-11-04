"use client"

import React, { useState } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface SurveyData {
  // Step 1
  product_types: string[]
  product_types_other: string
  hard_to_find_products: string
  // Step 2
  navigation_ease: string
  website_improvements: string[]
  website_improvements_other: string
  // Step 3
  purchase_likelihood: number | null
  what_you_like: string
  suggested_improvements: string
  // Step 4
  wants_contact: "yes" | "no" | ""
  contact_name: string
  contact_phone: string
  contact_email: string
  // Meta
  submitted_at: string
}

const INITIAL_DATA: SurveyData = {
  product_types: [],
  product_types_other: "",
  hard_to_find_products: "",
  navigation_ease: "",
  website_improvements: [],
  website_improvements_other: "",
  purchase_likelihood: null,
  what_you_like: "",
  suggested_improvements: "",
  wants_contact: "",
  contact_name: "",
  contact_phone: "",
  contact_email: "",
  submitted_at: "",
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODUCT_TYPE_OPTIONS = [
  "Clothing and Fashion",
  "Beauty and Personal Care",
  "Electronics and Accessories",
  "Home and Lifestyle",
  "Shoes and Bags",
  "Furniture",
  "Solar Products",
  "Household Appliances",
  "Other",
]

const WEBSITE_IMPROVEMENT_OPTIONS = [
  "Easier Website Navigation",
  "Better Product Photos and Descriptions",
  "More Product Variety",
  "Clearer Pricing and Product Information",
  "Easier Ordering and Payment Process",
  "More Delivery Information",
  "Faster Website Performance",
  "Live Chat Support",
  "Other",
]

const NAVIGATION_EASE_OPTIONS = [
  "Very Easy",
  "Easy",
  "Neither Easy nor Difficult",
  "Difficult",
  "Very Difficult",
]

const STEP_LABELS = [
  "Shopping Preferences",
  "Website Experience",
  "Customer Satisfaction",
  "Contact Info",
]

const TOTAL_STEPS = 4

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputCls =
  "w-full bg-zinc-800 border border-zinc-700 focus:border-amber-400/60 focus:outline-none text-white rounded-xl px-4 py-3 text-sm placeholder-zinc-500 transition-colors"
const textareaCls = `${inputCls} resize-none`
const labelCls = "text-amber-400 text-xs uppercase tracking-widest font-bold mb-3 block"
const questionCls = "text-white font-semibold text-sm md:text-base mb-3"
const errorCls = "text-red-400 text-xs mt-1"

// ─── Sub-components ──────────────────────────────────────────────────────────

function CheckboxGroup({
  options,
  selected,
  onChange,
  otherValue,
  onOtherChange,
  otherField,
  error,
}: {
  options: string[]
  selected: string[]
  onChange: (val: string[]) => void
  otherValue?: string
  onOtherChange?: (v: string) => void
  otherField?: boolean
  error?: string
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const isOther = opt === "Other"
        const checked = selected.includes(opt)
        return (
          <div key={opt}>
            <label className="flex items-start gap-3 cursor-pointer group">
              <span
                onClick={() => toggle(opt)}
                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                  checked
                    ? "bg-amber-400 border-amber-400"
                    : "bg-zinc-800 border-zinc-600 group-hover:border-amber-400/40"
                }`}
              >
                {checked && (
                  <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span
                onClick={() => toggle(opt)}
                className={`text-sm transition-colors ${checked ? "text-white" : "text-zinc-300"}`}
              >
                {opt}
              </span>
            </label>
            {isOther && checked && otherField && onOtherChange && (
              <div className="mt-2 ml-8">
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Please specify…"
                  value={otherValue || ""}
                  onChange={(e) => onOtherChange(e.target.value)}
                />
              </div>
            )}
          </div>
        )
      })}
      {error && <p className={errorCls}>{error}</p>}
    </div>
  )
}

function RadioGroup({
  options,
  value,
  onChange,
  error,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const checked = value === opt
        return (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group">
            <span
              onClick={() => onChange(opt)}
              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                checked
                  ? "border-amber-400"
                  : "border-zinc-600 group-hover:border-amber-400/40"
              }`}
            >
              {checked && <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />}
            </span>
            <span
              onClick={() => onChange(opt)}
              className={`text-sm transition-colors ${checked ? "text-white" : "text-zinc-300"}`}
            >
              {opt}
            </span>
          </label>
        )
      })}
      {error && <p className={errorCls}>{error}</p>}
    </div>
  )
}

function ScaleSelector({
  value,
  onChange,
  error,
}: {
  value: number | null
  onChange: (v: number) => void
  error?: string
}) {
  return (
    <div>
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const selected = value === n
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`w-10 h-10 rounded-lg border text-sm font-semibold transition-all ${
                selected
                  ? "bg-amber-400 border-amber-400 text-black"
                  : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-amber-400/40 hover:text-white"
              }`}
            >
              {n}
            </button>
          )
        })}
      </div>
      <div className="flex justify-between mt-1 text-xs text-zinc-500">
        <span>Not likely</span>
        <span>Very likely</span>
      </div>
      {error && <p className={errorCls}>{error}</p>}
    </div>
  )
}

// ─── Step components ──────────────────────────────────────────────────────────

function Step1({
  data,
  update,
  errors,
}: {
  data: SurveyData
  update: (k: keyof SurveyData, v: any) => void
  errors: Partial<Record<keyof SurveyData, string>>
}) {
  return (
    <div className="space-y-8">
      <div>
        <p className={labelCls}>Shopping Preferences</p>
        <p className={questionCls}>
          Q1. What types of products do you usually look for when shopping online?
          <span className="text-red-400 ml-1">*</span>
        </p>
        <CheckboxGroup
          options={PRODUCT_TYPE_OPTIONS}
          selected={data.product_types}
          onChange={(v) => update("product_types", v)}
          otherField
          otherValue={data.product_types_other}
          onOtherChange={(v) => update("product_types_other", v)}
          error={errors.product_types}
        />
      </div>

      <div>
        <p className={questionCls}>
          Q2. What products or items do you find difficult to find when shopping online?
        </p>
        <textarea
          className={textareaCls}
          rows={4}
          placeholder="e.g. specific brands, niche items, local products…"
          value={data.hard_to_find_products}
          onChange={(e) => update("hard_to_find_products", e.target.value)}
        />
      </div>
    </div>
  )
}

function Step2({
  data,
  update,
  errors,
}: {
  data: SurveyData
  update: (k: keyof SurveyData, v: any) => void
  errors: Partial<Record<keyof SurveyData, string>>
}) {
  return (
    <div className="space-y-8">
      <div>
        <p className={labelCls}>Website Experience</p>
        <p className={questionCls}>
          Q3. How easy was it to navigate the SYA website and find the products you were looking for?
          <span className="text-red-400 ml-1">*</span>
        </p>
        <RadioGroup
          options={NAVIGATION_EASE_OPTIONS}
          value={data.navigation_ease}
          onChange={(v) => update("navigation_ease", v)}
          error={errors.navigation_ease}
        />
      </div>

      <div>
        <p className={questionCls}>
          Q4. What would make your experience on the SYA website more convenient?
        </p>
        <CheckboxGroup
          options={WEBSITE_IMPROVEMENT_OPTIONS}
          selected={data.website_improvements}
          onChange={(v) => update("website_improvements", v)}
          otherField
          otherValue={data.website_improvements_other}
          onOtherChange={(v) => update("website_improvements_other", v)}
        />
      </div>
    </div>
  )
}

function Step3({
  data,
  update,
  errors,
}: {
  data: SurveyData
  update: (k: keyof SurveyData, v: any) => void
  errors: Partial<Record<keyof SurveyData, string>>
}) {
  return (
    <div className="space-y-8">
      <div>
        <p className={labelCls}>Customer Satisfaction</p>
        <p className={questionCls}>
          Q5. How likely are you to purchase from SYA Online Trading?
          <span className="text-red-400 ml-1">*</span>
        </p>
        <ScaleSelector
          value={data.purchase_likelihood}
          onChange={(v) => update("purchase_likelihood", v)}
          error={errors.purchase_likelihood}
        />
      </div>

      <div>
        <p className={questionCls}>Q6. What do you like most about the website?</p>
        <textarea
          className={textareaCls}
          rows={3}
          placeholder="Tell us what you love…"
          value={data.what_you_like}
          onChange={(e) => update("what_you_like", e.target.value)}
        />
      </div>

      <div>
        <p className={questionCls}>Q7. What improvements would you suggest?</p>
        <textarea
          className={textareaCls}
          rows={3}
          placeholder="Your suggestions help us improve…"
          value={data.suggested_improvements}
          onChange={(e) => update("suggested_improvements", e.target.value)}
        />
      </div>
    </div>
  )
}

function Step4({
  data,
  update,
  errors,
}: {
  data: SurveyData
  update: (k: keyof SurveyData, v: any) => void
  errors: Partial<Record<keyof SurveyData, string>>
}) {
  return (
    <div className="space-y-8">
      <div>
        <p className={labelCls}>Optional Contact Info</p>
        <p className={questionCls}>
          Q8. Would you like us to contact you regarding your feedback?
          <span className="text-red-400 ml-1">*</span>
        </p>
        <RadioGroup
          options={["Yes", "No"]}
          value={data.wants_contact === "yes" ? "Yes" : data.wants_contact === "no" ? "No" : ""}
          onChange={(v) => update("wants_contact", v === "Yes" ? "yes" : "no")}
          error={errors.wants_contact}
        />
      </div>

      {data.wants_contact === "yes" && (
        <div className="space-y-4 pl-0 border-l-2 border-amber-400/30 pl-4">
          <div>
            <label className="text-zinc-300 text-sm font-medium block mb-1.5">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              className={inputCls}
              placeholder="Your full name"
              value={data.contact_name}
              onChange={(e) => update("contact_name", e.target.value)}
            />
            {errors.contact_name && <p className={errorCls}>{errors.contact_name}</p>}
          </div>
          <div>
            <label className="text-zinc-300 text-sm font-medium block mb-1.5">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              className={inputCls}
              placeholder="+260 97 XXX XXXX"
              value={data.contact_phone}
              onChange={(e) => update("contact_phone", e.target.value)}
            />
            {errors.contact_phone && <p className={errorCls}>{errors.contact_phone}</p>}
          </div>
          <div>
            <label className="text-zinc-300 text-sm font-medium block mb-1.5">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              className={inputCls}
              placeholder="you@example.com"
              value={data.contact_email}
              onChange={(e) => update("contact_email", e.target.value)}
            />
            {errors.contact_email && <p className={errorCls}>{errors.contact_email}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-16 text-center">
      {/* Animated checkmark circle */}
      <div
        className="w-20 h-20 rounded-full bg-amber-400/10 border-2 border-amber-400 flex items-center justify-center mb-6"
        style={{ animation: "popIn 0.4s ease-out" }}
      >
        <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Thank You!</h2>
      <p className="text-zinc-400 text-sm max-w-sm mb-2">
        Your feedback has been submitted successfully. We really appreciate you taking the time to share your experience with SYA.
      </p>
      <p className="text-amber-400/70 text-xs mb-8">We&apos;ll use your input to improve our service.</p>
      <button
        type="button"
        onClick={onClose}
        className="px-8 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-lg transition text-sm"
      >
        Done
      </button>
      <style>{`
        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStep(step: number, data: SurveyData): Partial<Record<keyof SurveyData, string>> {
  const errs: Partial<Record<keyof SurveyData, string>> = {}
  if (step === 1) {
    if (data.product_types.length === 0) {
      errs.product_types = "Please select at least one option."
    }
  }
  if (step === 2) {
    if (!data.navigation_ease) {
      errs.navigation_ease = "Please select an option."
    }
  }
  if (step === 3) {
    if (data.purchase_likelihood === null) {
      errs.purchase_likelihood = "Please select a score."
    }
  }
  if (step === 4) {
    if (!data.wants_contact) {
      errs.wants_contact = "Please select an option."
    }
    if (data.wants_contact === "yes") {
      if (!data.contact_name.trim()) errs.contact_name = "Full name is required."
      if (!data.contact_phone.trim()) errs.contact_phone = "Phone number is required."
      if (!data.contact_email.trim()) {
        errs.contact_email = "Email address is required."
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email)) {
        errs.contact_email = "Please enter a valid email address."
      }
    }
  }
  return errs
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface FeedbackSurveyProps {
  onClose: () => void
}

export default function FeedbackSurvey({ onClose }: FeedbackSurveyProps) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<SurveyData>(INITIAL_DATA)
  const [errors, setErrors] = useState<Partial<Record<keyof SurveyData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const update = (key: keyof SurveyData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }))
    // Clear error on change
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const handleNext = () => {
    const errs = validateStep(step, data)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  const handleBack = () => {
    setErrors({})
    setStep((s) => Math.max(s - 1, 1))
  }

  const handleSubmit = async () => {
    const errs = validateStep(4, data)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setSubmitting(true)
    setSubmitError(null)

    const payload: SurveyData = {
      ...data,
      submitted_at: new Date().toISOString(),
    }

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setSubmitError(json.message || "Something went wrong. Please try again.")
        setSubmitting(false)
        return
      }
      setSubmitted(true)
      // Auto-close after 5 seconds
      setTimeout(onClose, 5000)
    } catch {
      setSubmitError("Network error. Please check your connection and try again.")
      setSubmitting(false)
    }
  }

  const progress = (step / TOTAL_STEPS) * 100

  if (submitted) {
    return (
      <div className="flex flex-col h-full bg-zinc-950">
        <SuccessScreen onClose={onClose} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Progress bar */}
      <div className="w-full h-1 bg-zinc-800 shrink-0">
        <div
          className="h-full bg-amber-400 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step label */}
      <div className="px-6 pt-5 pb-2 shrink-0">
        <p className="text-amber-400 text-xs uppercase tracking-widest font-bold">
          Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
        </p>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div
            className="bg-zinc-900 border border-amber-500/20 rounded-2xl p-6 md:p-8"
            style={{ animation: "fadeSlide 0.3s ease-out" }}
            key={step}
          >
            {step === 1 && <Step1 data={data} update={update} errors={errors} />}
            {step === 2 && <Step2 data={data} update={update} errors={errors} />}
            {step === 3 && <Step3 data={data} update={update} errors={errors} />}
            {step === 4 && <Step4 data={data} update={update} errors={errors} />}
          </div>
        </div>
      </div>

      {/* Footer nav */}
      <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 border border-zinc-700 hover:border-amber-400/40 text-zinc-300 hover:text-white text-sm font-medium rounded-lg transition"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {submitError && (
              <p className="text-red-400 text-xs text-right max-w-xs">{submitError}</p>
            )}
            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm rounded-lg transition"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Submitting…
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
