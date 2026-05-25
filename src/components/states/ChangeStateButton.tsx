"use client";

export function ChangeStateButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-state-picker"))}
      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
    >
      Change State
    </button>
  );
}
