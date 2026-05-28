"use client";

import { useMemo, useState } from "react";
import { states } from "@/config/states";
import { getDmvLocationAreas } from "@/config/dmv-locations";
import { useSelectedState } from "@/components/states/SelectedStateContext";
import type { ExperienceTopic } from "@/types/experience";

const topicOptions: { label: string; value: ExperienceTopic }[] = [
  { label: "Road test", value: "road_test" },
  { label: "Parking", value: "parking" },
  { label: "Permit test", value: "permit_test" },
  { label: "Documents", value: "documents" },
  { label: "General", value: "general" },
];

export function ExperienceComposer() {
  const { selectedStateCode } = useSelectedState();
  const [title, setTitle] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [dmvLocation, setDmvLocation] = useState("");
  const [topic, setTopic] = useState<ExperienceTopic>("road_test");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeStateCode = stateCode || selectedStateCode || "";
  const locationAreas = useMemo(
    () => getDmvLocationAreas(activeStateCode),
    [activeStateCode],
  );

  async function submitExperience(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("");

    try {
      const response = await fetch("/api/experiences/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, stateCode: activeStateCode, dmvLocation, topic }),
      });

      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        setStatus(data.error ?? "Could not submit your experience.");
        return;
      }

      setTitle("");
      setStateCode("");
      setDmvLocation("");
      setTopic("road_test");
      setBody("");
      setStatus(data.message ?? "Submitted for review.");
    } catch {
      setStatus("Could not submit your experience right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-sky-700">
        Share experience
      </p>

      <h2 className="mt-2 text-xl font-bold text-slate-950">
        Help learners at the same DMV location.
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Your selected state is the default, but you can choose another state if the experience happened somewhere else.
      </p>

      <form onSubmit={submitExperience}>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title, for example: I failed because of parallel parking" className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100" />

        <select required value={activeStateCode} onChange={(e) => { setStateCode(e.target.value); setDmvLocation(""); }} className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100">
          <option value="">Select state</option>
          {states.map((state) => <option key={state.code} value={state.code}>{state.name}</option>)}
        </select>

        <input required list="dmv-location-areas" value={dmvLocation} onChange={(e) => setDmvLocation(e.target.value)} placeholder={locationAreas.length ? `Choose or type a location, for example: ${locationAreas[0]}` : "Road test location, city, or address"} className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100" />
        <datalist id="dmv-location-areas">
          {locationAreas.map((location) => <option key={location} value={location} />)}
        </datalist>

        <select value={topic} onChange={(e) => setTopic(e.target.value as ExperienceTopic)} className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100">
          {topicOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>

        <textarea required value={body} onChange={(e) => setBody(e.target.value)} placeholder="What happened? Include what the examiner watched, what was difficult, and what helped." className="mt-3 min-h-36 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100" />

        <button disabled={isSubmitting} className="mt-3 w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:bg-slate-300">
          {isSubmitting ? "Submitting..." : "Submit for Review"}
        </button>
      </form>

      {status && <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-600">{status}</p>}

      <p className="mt-3 text-xs leading-5 text-slate-500">
        Posts will be moderated before showing publicly.
      </p>
    </aside>
  );
}
