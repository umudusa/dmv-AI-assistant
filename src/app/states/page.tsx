import { states } from "@/config/states";

export default function StatesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-sky-700">
          States
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
          Choose and explore DMV state support.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          All states are available in the app config. Official source validation and state-specific content will be improved step by step.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {states.map((state) => (
            <article
              key={state.code}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-slate-950">{state.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {state.code}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  Ready
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
