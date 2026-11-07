import Spinner from "@modules/common/icons/spinner"

export default function Loading() {
  return (
    <div
      className="min-h-[60vh] flex items-center justify-center text-amber-400"
      role="status"
      aria-live="polite"
      aria-label="Loading country store"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-amber-400/20 bg-[var(--bg-card)] px-8 py-7 shadow-xl">
        <Spinner size={32} color="#fbbf24" />
        <span className="text-xs font-semibold text-[var(--text-secondary)]">
          Loading store
        </span>
      </div>
    </div>
  )
}
