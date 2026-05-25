import { states } from "@/config/states";

export function ExperienceComposer() {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-sky-700">
        Share experience
      </p>

      <h2 className="mt-2 text-xl font-bold text-slate-950">
        Help learners at the same DMV location.
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Your post will be connected to a specific state and road test location, not shown as general advice for all states.
      </p>

      <input
        required
        placeholder="Title, for example: I failed because of parallel parking"
        className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none"
      />

      <select
        required
        className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
      >
        <option value="">Select state</option>
        {states.map((state) => (
          <option key={state.code} value={state.code}>
            {state.name}
          </option>
        ))}
      </select>

      <input
        required
        placeholder="Road test location or address, for example: Hamden DMV"
        className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none"
      />

      <select className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none">
        <option>Road test</option>
        <option>Parking</option>
        <option>Permit test</option>
        <option>Documents</option>
        <option>General</option>
      </select>

      <textarea
        required
        placeholder="What happened? Include what the examiner watched, what was difficult, and what helped."
        className="mt-3 min-h-36 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none"
      />

      <button className="mt-3 w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">
        Submit for Review
      </button>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        Posts will be moderated before showing publicly.
      </p>
    </aside>
  );
}
