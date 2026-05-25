export function RoadTestSearch() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <label className="text-sm font-bold text-slate-700">
        Search road test location
      </label>
      <input
        placeholder="Example: Hamden DMV, Los Angeles DMV, Brooklyn road test"
        className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold outline-none"
      />
    </section>
  );
}
