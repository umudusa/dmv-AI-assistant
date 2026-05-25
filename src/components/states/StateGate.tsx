"use client";

import { useEffect, useMemo, useState } from "react";
import { states } from "@/config/states";
import { SelectedStateProvider } from "@/components/states/SelectedStateContext";

export function StateGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return states;
    }

    return states.filter((state) => {
      return (
        state.name.toLowerCase().includes(query) ||
        state.code.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
      setPickerOpen(true);
    }, 1400);

    const openPicker = () => setPickerOpen(true);

    window.addEventListener("open-state-picker", openPicker);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("open-state-picker", openPicker);
    };
  }, []);

  function chooseState(code: string) {
    setSelectedState(code);
    setPickerOpen(false);
    setSearchQuery("");
  }

  const shouldBlurSite = loading || pickerOpen || !selectedState;

  return (
    <SelectedStateProvider selectedStateCode={selectedState}>
      <div className="relative min-h-screen overflow-hidden">
        <div
          className={`min-h-screen transform-gpu transition-all duration-700 ease-out ${
            shouldBlurSite
              ? "scale-[0.985] blur-md opacity-60"
              : "scale-100 blur-0 opacity-100"
          }`}
        >
          {children}
        </div>

        {loading && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(14,165,233,0.26),transparent_30%),radial-gradient(circle_at_75%_35%,rgba(16,185,129,0.18),transparent_28%),linear-gradient(135deg,#020617,#0f172a_55%,#111827)]" />

            <div className="relative text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 text-xl font-black text-white shadow-2xl backdrop-blur">
                DMV
              </div>

              <div className="mt-7 h-1.5 w-64 overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-2/3 animate-[loadingBar_1.35s_ease-in-out_infinite] rounded-full bg-white" />
              </div>

              <p className="mt-5 text-sm font-semibold tracking-wide text-white/75">
                Preparing your DMV AI hub
              </p>
            </div>
          </div>
        )}

        {!loading && (pickerOpen || !selectedState) && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center overflow-hidden bg-slate-950/35 px-4 backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.20),transparent_30%),radial-gradient(circle_at_80%_35%,rgba(16,185,129,0.18),transparent_30%)]" />

            <div className="relative w-full max-w-3xl animate-[stateModalIn_0.6s_ease-out] rounded-[2rem] border border-white/30 bg-white/90 p-5 shadow-2xl shadow-slate-950/25 backdrop-blur-2xl sm:p-7">
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-700">
                  DMV AI Practice Hub
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Choose your state
                </h1>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                  Your assistant answers and practice tests will use this as the default state. Experiences can still search across all states.
                </p>
              </div>

              <div className="mt-6">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search your state, for example California or CA"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-800 outline-none shadow-sm transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <div className="mt-5 grid max-h-[42vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                {filteredStates.map((state) => (
                  <button
                    key={state.code}
                    type="button"
                    onClick={() => chooseState(state.code)}
                    className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950">{state.name}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {state.code}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        Ready
                      </span>
                    </div>
                  </button>
                ))}

                {filteredStates.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-center text-sm font-semibold text-slate-500 sm:col-span-2">
                    No state found. Try searching by state name or abbreviation.
                  </div>
                )}
              </div>

              <p className="mt-5 text-center text-xs leading-5 text-slate-500">
                This is not an official DMV website.
              </p>
            </div>
          </div>
        )}
      </div>
    </SelectedStateProvider>
  );
}
