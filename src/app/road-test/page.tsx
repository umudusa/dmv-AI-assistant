"use client";

import { useSelectedState } from "@/components/states/SelectedStateContext";

const failReasons = [
  "Rolling stops",
  "Missing blind spot checks",
  "Weak parking control",
  "Speed too fast or too slow",
  "Unsafe lane changes",
];

const checklist = [
  "Practice full stops",
  "Use mirrors before every move",
  "Make blind spot checks visible",
  "Control speed smoothly",
  "Signal early",
];

export default function RoadTestPage() {
  const { selectedStateCode } = useSelectedState();

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-sky-700">
          Road Test
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
          Prepare for your DMV road test.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          This page is for road test preparation only. It does not book appointments or perform official DMV services.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Current state context</p>
          <p className="mt-2 text-2xl font-black text-slate-950">
            {selectedStateCode ?? "Choose a state first"}
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Common fail reasons</h2>
            <ul className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
              {failReasons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Road test checklist</h2>
            <ul className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
              {checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">AI practical tip</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Make every safety action obvious. Examiners cannot read your mind, so visibly check mirrors, turn your head for blind spots, stop fully, and move calmly.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
