const tips = [
  "Stop fully before the line.",
  "Make blind spot checks visible.",
  "Signal before every turn or lane change.",
  "Keep parking slow and controlled.",
];

export function RoadTestTips() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Road test tips</h2>
      <ul className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
        {tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </article>
  );
}
