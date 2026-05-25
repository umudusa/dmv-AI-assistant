type AnswerCardProps = {
  title: string;
  label: string;
  body: string;
};

export function AnswerCard({ title, label, body }: AnswerCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">
        {label}
      </p>
      <h3 className="mt-2 text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
    </article>
  );
}
