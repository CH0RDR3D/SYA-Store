import Spinner from "@modules/common/icons/spinner"

export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-[var(--app-bg)] text-[var(--app-fg)]"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-full border border-amber-400/25 bg-amber-400/10 shadow-[0_0_32px_rgba(251,191,36,0.12)]">
          <Spinner size={30} color="#fbbf24" />
        </div>
        <span className="text-xs font-semibold tracking-wide text-[var(--text-secondary)]">
          Loading
        </span>
      </div>
    </div>
  )
}
