export function QuestionCard() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold text-slate-500">Sample question</p>
      <h2 className="mt-3 text-xl font-bold text-slate-950">
        What should you do at a complete stop sign?
      </h2>
      <div className="mt-5 grid gap-3">
        {["Slow down and continue", "Stop fully and check traffic", "Only stop if cars are nearby"].map((choice) => (
          <button key={choice} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-sm font-semibold text-slate-700">
            {choice}
          </button>
        ))}
      </div>
    </article>
  );
}
