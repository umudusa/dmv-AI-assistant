import type { ExperiencePost } from "@/types/experience";

const avatars = [
  {
    bg: "bg-sky-100",
    text: "text-sky-700",
    icon: "CAR",
  },
  {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    icon: "SIGN",
  },
  {
    bg: "bg-violet-100",
    text: "text-violet-700",
    icon: "ID",
  },
];

function avatarForPost(id: string) {
  const total = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return avatars[total % avatars.length];
}

export function ExperienceCard({ post }: { post: ExperiencePost }) {
  const avatar = avatarForPost(post.id);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${avatar.bg} ${avatar.text} text-xs font-black shadow-sm`}
        >
          {avatar.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
              {post.stateCode}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {post.topic.replace("_", " ")}
            </span>
            {post.dmvLocation && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                {post.dmvLocation}
              </span>
            )}
          </div>

          <h2 className="mt-3 text-xl font-bold text-slate-950">{post.title}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{post.body}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-400">
            <span>{post.sourceType.replace("_", " ")}</span>
            <span>-</span>
            <span>{post.createdAt}</span>
            <span>-</span>
            <span>{post.upvotes} helpful</span>
          </div>
        </div>
      </div>
    </article>
  );
}
