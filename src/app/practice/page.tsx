import { PracticeStartCard } from "@/components/practice/PracticeStartCard";

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-sky-700">
          Practice
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
          Start a DMV practice session.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Choose a state, mode, and topic. Real questions will be added after the official manual service is connected.
        </p>

        <div className="mt-8">
          <PracticeStartCard />
        </div>
      </section>
    </div>
  );
}
