export function ExperienceSearch() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <input
        placeholder="Search road test experiences"
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <select className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
          <option>All states</option>
          <option>Connecticut</option>
          <option>California</option>
          <option>New York</option>
        </select>

        <input
          placeholder="DMV location"
          className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold outline-none placeholder:text-slate-400"
        />

        <select className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
          <option>All topics</option>
          <option>Road test</option>
          <option>Parking</option>
          <option>Permit test</option>
          <option>Documents</option>
        </select>
      </div>
    </section>
  );
}
