"use client";

import { useEffect, useState } from "react";

export function ChangeStateButton() {
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    function highlight() {
      setIsHighlighted(true);
      window.setTimeout(() => setIsHighlighted(false), 2600);
    }

    window.addEventListener("highlight-change-state", highlight);

    return () => window.removeEventListener("highlight-change-state", highlight);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-state-picker"))}
      className={`rounded-2xl border px-4 py-2 text-sm font-semibold shadow-sm transition hover:border-slate-300 hover:text-slate-950 ${
        isHighlighted
          ? "animate-pulse border-amber-300 bg-amber-100 text-amber-900 ring-4 ring-amber-200"
          : "border-slate-200 bg-white text-slate-700"
      }`}
    >
      Change State
    </button>
  );
}
