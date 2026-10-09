'use client'

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="px-5 py-2 rounded-xl text-sm font-bold bg-white shadow hover:opacity-90 transition-opacity"
      style={{ color: '#1a2744' }}
    >
      {label}
    </button>
  )
}
