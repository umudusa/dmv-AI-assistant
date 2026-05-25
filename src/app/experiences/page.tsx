import { ExperienceHub } from "@/components/experiences/ExperienceHub";
import { getMockExperiences } from "@/lib/experience-service";

export default function ExperiencesPage() {
  const posts = getMockExperiences();

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-sky-700">
            Real DMV Experiences
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            Search DMV stories by state, city, or test location.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            By default, we show experiences for your selected state. Search can still find road test stories from any state or DMV location.
          </p>
        </div>

        <ExperienceHub posts={posts} />
      </section>
    </div>
  );
}
