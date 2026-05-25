"use client";

import Link from "next/link";
import { enabledStates } from "@/config/states";
import { useSelectedState } from "@/components/states/SelectedStateContext";

const actions = [
  {
    title: "Ask DMV AI",
    description: "Get answers separated into official DMV rules, real user experience, and a practical AI tip.",
    href: "/assistant",
  },
  {
    title: "Start Practice Test",
    description: "Choose your mode and topic before practicing with DMV-style questions.",
    href: "/practice",
  },
  {
    title: "Explore Real DMV Experiences",
    description: "Search community-style posts about road tests, parking, examiners, and DMV locations.",
    href: "/experiences",
  },
  {
    title: "Road Test Prep",
    description: "Review common fail reasons, checklist items, parking tips, and examiner expectations.",
    href: "/road-test",
  },
];

export function HomeContent() {
  const { selectedStateCode } = useSelectedState();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),linear-gradient(180deg,#f8fafc,#eef2f7)]">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
            Current state context: {selectedStateCode ?? "Choose a state"}
          </p>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Learn DMV rules with official sources and real driver stories.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Ask questions, practice knowledge tests, prepare for road tests, and compare what the manual says with what people actually experience.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/assistant"
              className="rounded-2xl bg-slate-950 px-6 py-3 text-center text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800"
            >
              Ask DMV AI
            </Link>
            <Link
              href="/practice"
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-center text-sm font-bold text-slate-800 shadow-sm transition hover:border-slate-300"
            >
              Start Practice Test
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur">
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-sm font-semibold text-blue-200">Answer format</p>
            <div className="mt-5 space-y-3">
              {["Official DMV Answer", "Real User Experience", "AI Practical Tip"].map((item) => (
                <div key={item} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <p className="font-semibold">{item}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Clear separation between official rules, community experiences, and practical next steps.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <h2 className="text-lg font-bold text-slate-950">{action.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{action.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Ready states</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {enabledStates.slice(0, 12).map((state) => (
              <span key={state.code} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {state.name}
              </span>
            ))}
            <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-bold text-sky-700">
              All 50 states + DC
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
