"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExperienceCard } from "@/components/experiences/ExperienceCard";
import { ExperienceComposer } from "@/components/experiences/ExperienceComposer";
import { useSelectedState } from "@/components/states/SelectedStateContext";
import type { ExperiencePost } from "@/types/experience";

type ExperienceResponse = {
  posts: ExperiencePost[];
  error?: string;
};

export function ExperienceHub({ posts: initialPosts }: { posts: ExperiencePost[] }) {
  const { selectedStateCode } = useSelectedState();
  const didAutoLoadRef = useRef<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [posts, setPosts] = useState<ExperiencePost[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [status, setStatus] = useState("Loading selected state experiences...");

  const cities = useMemo(() => {
    return Array.from(
      new Set(
        posts
          .filter((post) => !selectedStateCode || post.stateCode === selectedStateCode)
          .map((post) => post.city)
          .filter((city): city is string => Boolean(city)),
      ),
    );
  }, [posts, selectedStateCode]);

  async function fetchExperiences({
    query,
    stateCode,
    city,
  }: {
    query?: string;
    stateCode?: string | null;
    city?: string;
  }) {
    setIsLoading(true);
    setStatus("Searching public DMV discussions...");

    try {
      const response = await fetch("/api/experiences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          stateCode,
          city,
        }),
      });

      const data = (await response.json()) as ExperienceResponse;
      setPosts(data.posts);
      setStatus(
        data.error ??
          `Updated with ${data.posts.length} DMV experience summaries.`,
      );
    } finally {
      setHasLoaded(true);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedStateCode || didAutoLoadRef.current === selectedStateCode) {
      return;
    }

    didAutoLoadRef.current = selectedStateCode;
    setPosts([]);
    setHasLoaded(false);
    setStatus("Loading selected state experiences...");

    const timer = window.setTimeout(() => {
      fetchExperiences({
        query: `${selectedStateCode} DMV road test experiences parking examiner`,
        stateCode: selectedStateCode,
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [selectedStateCode]);

  function searchExperiences() {
    const query = searchQuery.trim();

    fetchExperiences({
      query: query || `${selectedStateCode ?? ""} DMV road test experiences`,
      stateCode: selectedStateCode,
      city: cityFilter,
    });
  }

  const showLoadingCard = isLoading || (!hasLoaded && posts.length === 0);
  const showEmptyCard = !isLoading && hasLoaded && posts.length === 0;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="text-sm font-bold text-slate-700">
            Search real DMV experiences
          </label>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Try: Hamden CT road test parallel parking, Bridgeport DMV reverse parking"
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />

            <button
              onClick={searchExperiences}
              disabled={isLoading}
              className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/10 disabled:bg-slate-300"
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
            >
              <option value="">All cities / locations</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <p className="text-xs font-semibold text-slate-500">
              {selectedStateCode
                ? `Default state: ${selectedStateCode}. Search can still find DMV experiences from any state.`
                : "Choose a state or search any DMV location."}
            </p>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">{status}</p>
        </section>

        {showLoadingCard && (
          <div className="rounded-2xl border border-sky-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-xs font-black text-sky-700 shadow-sm">
              DMV
            </div>
            <div className="mx-auto mt-5 h-1.5 w-52 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 animate-[loadingBar_1.25s_ease-in-out_infinite] rounded-full bg-sky-500" />
            </div>
            <p className="mt-4 text-sm font-bold text-slate-600">
              Finding real DMV learner experiences...
            </p>
          </div>
        )}

        {!showLoadingCard &&
          posts.map((post) => <ExperienceCard key={post.id} post={post} />)}

        {showEmptyCard && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-semibold text-slate-500">
            No live experience summaries found yet. Try a more specific DMV location.
          </div>
        )}
      </div>

      <ExperienceComposer />
    </div>
  );
}
