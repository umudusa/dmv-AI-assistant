"use client";

import { states } from "@/config/states";
import { useSelectedState } from "@/components/states/SelectedStateContext";

const modes = ["Practice Mode", "Real Exam Mode", "Road Signs Mode", "Mistake Review"];
const topics = ["Mixed Topics", "Rules of Road", "Signs", "Parking", "Safety", "Documents"];

export function PracticeStartCard() {
  const { selectedStateCode } = useSelectedState();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        <select
          defaultValue={selectedStateCode ?? ""}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 outline-none"
        >
          <option value="">Select state</option>
          {states.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </select>

        <select className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 outline-none">
          {modes.map((mode) => (
            <option key={mode}>{mode}</option>
          ))}
        </select>

        <select className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 outline-none">
          {topics.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
      </div>

      <button className="mt-4 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-slate-900/10">
        Start Practice
      </button>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        Practice questions will use the selected state as the default rule source.
      </p>
    </section>
  );
}
