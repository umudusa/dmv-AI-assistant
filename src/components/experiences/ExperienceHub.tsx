"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExperienceCard } from "@/components/experiences/ExperienceCard";
import { ExperienceComposer } from "@/components/experiences/ExperienceComposer";
import { useSelectedState } from "@/components/states/SelectedStateContext";
import type { ExperiencePost } from "@/types/experience";

type ExperienceResponse = {
  posts: ExperiencePost[];
  error?: string;
  notice?: string;
  suggestedStateCode?: string | null;
};

type LoadingKind = "page" | "search" | null;

function defaultSearchForState(stateCode: string | null) {
  return stateCode
    ? `${stateCode} DMV road test experience reddit forum parking examiner failed learner`
    : "DMV road test experience reddit forum parking examiner failed learner";
}

export function ExperienceHub({ posts: initialPosts }: { posts: ExperiencePost[] }) {
  const { selectedStateCode } = useSelectedState();
  const loadedStateRef = useRef<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<ExperiencePost[]>(initialPosts);
  const [loadingKind, setLoadingKind] = useState<LoadingKind>(null);
  const [hasLoaded, setHasLoaded] = useState(initialPosts.length > 0);
  const [status, setStatus] = useState("Choose a state or search DMV experiences.");
  const [notice, setNotice] = useState<string | null>(null);
  const [suggestedStateCode, setSuggestedStateCode] = useState<string | null>(null);

  const searchLabel = useMemo(() => {
    if (!selectedStateCode) {
      return "Choose a state first, or search any DMV city/address.";
    }

    return `Default state: ${selectedStateCode}. You can still search another state by typing it.`;
  }, [selectedStateCode]);

  const fetchExperiences = useCallback(
    async (query: string, loadingType: LoadingKind) => {
      setLoadingKind(loadingType);
      setHasLoaded(false);
      setNotice(null);
      setSuggestedStateCode(null);

      try {
        const response = await fetch("/api/experiences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            stateCode: selectedStateCode,
          }),
        });

        const data = (await response.json()) as ExperienceResponse;

        setPosts(data.posts);
        setNotice(data.notice ?? null);
        setSuggestedStateCode(data.suggestedStateCode ?? null);

        if (data.suggestedStateCode) {
          window.dispatchEvent(new Event("highlight-change-state"));
        }

        setStatus(
          data.error ??
            (data.posts.length > 0
              ? `Found ${data.posts.length} real DMV experience summaries.`
              : "No real experience summaries found. Try a city, DMV address, or road test issue."),
        );
      } catch {
        setPosts([]);
        setStatus("Live search failed. Try a specific DMV city, address, or road test issue.");
      } finally {
        setHasLoaded(true);
        setLoadingKind(null);
      }
    },
    [selectedStateCode],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!selectedStateCode) {
        setPosts([]);
        setHasLoaded(true);
        setStatus("Choose a state first, then this page will load DMV experiences.");
        return;
      }

      if (loadedStateRef.current === selectedStateCode) {
        return;
      }

      loadedStateRef.current = selectedStateCode;
      setPosts([]);
      setStatus("Loading real DMV learner experiences for this state...");

      fetchExperiences(defaultSearchForState(selectedStateCode), "page");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchExperiences, selectedStateCode]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const rawQuery = searchQuery.trim();

    const query =
      rawQuery.length <= 12 && selectedStateCode
        ? `${selectedStateCode} DMV road test ${rawQuery || "experience"} parking examiner reddit forum`
        : rawQuery || defaultSearchForState(selectedStateCode);

    setPosts([]);
    setStatus("Searching public DMV discussions...");
    fetchExperiences(query, "search");
  }

  const isPageLoading = loadingKind === "page";
  const isSearchLoading = loadingKind === "search";
  const showLoadingCard = isPageLoading || isSearchLoading || (!hasLoaded && posts.length === 0);
  const showEmptyCard = !loadingKind && hasLoaded && posts.length === 0;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <label className="text-sm font-bold text-slate-700">
                Search real DMV experiences
              </label>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Type like Google: city, DMV address, road test issue, parking, or examiner concern.
              </p>
            </div>

            <span className="w-fit rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
              {selectedStateCode ? `State: ${selectedStateCode}` : "No state selected"}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Example: Hamden CT DMV road test parallel parking"
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />

            <button
              type="submit"
              disabled={isSearchLoading}
              className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 disabled:bg-slate-300"
            >
              {isSearchLoading ? "Searching..." : "Search"}
            </button>
          </form>

          <p className="mt-3 text-xs leading-5 text-slate-500">{searchLabel}</p>
          {notice && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">
              <p>{notice}</p>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("open-state-picker"))}
                className="mt-3 rounded-2xl bg-amber-900 px-4 py-2 text-xs font-black text-white"
              >
                {suggestedStateCode ? `Change state to ${suggestedStateCode}` : "Change State"}
              </button>
            </div>
          )}

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
            No live experience summaries found yet. Try a DMV city, road test location, or the issue you are worried about.
          </div>
        )}
      </div>

      <ExperienceComposer />
    </div>
  );
}


