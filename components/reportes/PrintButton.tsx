'use client'

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 rounded-xl text-sm font-semibold text-white shadow"
      style={{ background: '#1a2744' }}
    >
      {label}
    </button>
  )
}
