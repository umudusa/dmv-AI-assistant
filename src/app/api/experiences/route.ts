import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getStateByCode } from "@/config/states";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type { ExperiencePost } from "@/types/experience";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ExperienceSearchRequest = {
  query?: string;
  stateCode?: string | null;
};

type SearchResult = {
  title: string;
  snippet: string;
};

type AiExperienceResult = {
  searchedStateCode?: string | null;
  searchedCity?: string | null;
  posts?: ExperiencePost[];
};

type CachedExperienceResult = {
  posts: ExperiencePost[];
  searchedStateCode?: string | null;
};

function cleanText(text: string) {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function extractJson(text: string) {
  const cleaned = text
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No JSON object found.");
  }

  return cleaned.slice(start, end + 1);
}

function uniquePosts(posts: ExperiencePost[]) {
  const seen = new Set<string>();

  return posts.filter((post) => {
    const key = post.id || `${post.stateCode}-${post.title}-${post.dmvLocation ?? ""}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function normalizePosts(posts: ExperiencePost[], stateCode: string) {
  return posts.map((post) => ({
    ...post,
    stateCode: post.stateCode || stateCode,
    title: cleanText(post.title),
    body: cleanText(post.body),
    dmvLocation: post.dmvLocation ? cleanText(post.dmvLocation) : undefined,
    city: post.city ? cleanText(post.city) : undefined,
    upvotes: Number.isFinite(post.upvotes) ? post.upvotes : 0,
    createdAt: post.createdAt || new Date().toISOString().slice(0, 10),
  }));
}

function safeParseResult(text: string): AiExperienceResult {
  return JSON.parse(extractJson(text)) as AiExperienceResult;
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; DMVExperienceSearch/1.0)",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function parseDuckDuckGoResults(html: string): SearchResult[] {
  const blocks = html.match(/<div class="result[\s\S]*?<\/div>\s*<\/div>/g) ?? [];

  return blocks
    .map((block) => {
      const titleMatch = block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/);
      const snippetMatch = block.match(
        /class="result__snippet"[^>]*>([\s\S]*?)<\/a>|class="result__snippet"[^>]*>([\s\S]*?)<\/div>/,
      );

      return {
        title: cleanText(titleMatch?.[1] ?? ""),
        snippet: cleanText(snippetMatch?.[1] ?? snippetMatch?.[2] ?? ""),
      };
    })
    .filter((result) => result.title || result.snippet)
    .slice(0, 8);
}

function rowToExperiencePost(row: {
  id: string;
  title: string;
  body: string;
  state_code: string;
  city: string | null;
  dmv_location: string | null;
  topic: ExperiencePost["topic"];
  source_type: ExperiencePost["sourceType"];
  upvotes: number;
  created_at: string;
}): ExperiencePost {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    stateCode: row.state_code,
    city: row.city ?? undefined,
    dmvLocation: row.dmv_location ?? undefined,
    topic: row.topic,
    sourceType: row.source_type,
    upvotes: row.upvotes,
    createdAt: row.created_at.slice(0, 10),
  };
}

function queryWords(query: string) {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3)
    .slice(0, 6);
}

async function searchSubmittedExperiences({
  searchIntent,
  stateCode,
}: {
  searchIntent: string;
  stateCode?: string | null;
}) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return [];
  }

  const words = queryWords(searchIntent);
  const orParts = words.flatMap((word) => [
    `title.ilike.%${word}%`,
    `body.ilike.%${word}%`,
    `dmv_location.ilike.%${word}%`,
    `city.ilike.%${word}%`,
  ]);

  if (orParts.length === 0) {
    return [];
  }

  try {
    let query = supabase
      .from("experience_posts")
      .select("id,title,body,state_code,city,dmv_location,topic,source_type,upvotes,created_at")
      .in("moderation_status", ["pending", "approved"])
      .or(orParts.join(","))
      .order("created_at", { ascending: false })
      .limit(5);

    if (stateCode) {
      query = query.eq("state_code", stateCode);
    }

    const { data } = await query;

    return (data ?? []).map(rowToExperiencePost);
  } catch {
    return [];
  }
}

async function searchPublicWeb(searchIntent: string) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchIntent)}`;
  const response = await fetchWithTimeout(url, 12000);

  if (!response.ok) {
    return [];
  }

  return parseDuckDuckGoResults(await response.text());
}

function cacheKey(searchIntent: string, stateCode?: string | null) {
  return {
    query: searchIntent.trim().toLowerCase(),
    stateCode: stateCode ?? null,
  };
}

async function getCachedExperiences(searchIntent: string, stateCode?: string | null) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const key = cacheKey(searchIntent, stateCode);

  try {
    let query = supabase
      .from("experience_search_cache")
      .select("result_json")
      .eq("query", key.query)
      .gt("expires_at", new Date().toISOString());

    query = key.stateCode
      ? query.eq("state_code", key.stateCode)
      : query.is("state_code", null);

    const { data } = await query.maybeSingle();

    if (!data?.result_json) {
      return null;
    }

    return data.result_json as CachedExperienceResult;
  } catch {
    return null;
  }
}

async function setCachedExperiences({
  searchIntent,
  stateCode,
  posts,
  searchedStateCode,
}: {
  searchIntent: string;
  stateCode?: string | null;
  posts: ExperiencePost[];
  searchedStateCode?: string | null;
}) {
  if (posts.length === 0) {
    return;
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  const key = cacheKey(searchIntent, stateCode);

  try {
    await supabase.from("experience_search_cache").insert({
      query: key.query,
      state_code: key.stateCode,
      city: null,
      result_json: { posts, searchedStateCode },
      provider: "duckduckgo_openai",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch {
    // Cache should never block the experience search.
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as ExperienceSearchRequest;
  const selectedState = body.stateCode ? getStateByCode(body.stateCode) : undefined;
  const selectedStateCode = selectedState?.code ?? body.stateCode ?? null;
  const query = body.query?.trim();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      posts: [],
      error: "OPENAI_API_KEY is missing.",
    });
  }

  const searchIntent =
    query ||
    [
      selectedState ? `${selectedState.name} ${selectedState.code}` : "",
      "DMV road test experience reddit forum parking examiner failed learner",
    ]
      .filter(Boolean)
      .join(" ");
  const submittedPosts = await searchSubmittedExperiences({
    searchIntent,
    stateCode: selectedStateCode,
  });

  const cached = await getCachedExperiences(searchIntent, selectedStateCode);

  if (cached?.posts?.length) {
    return NextResponse.json({
      posts: uniquePosts([...submittedPosts, ...cached.posts]).slice(0, 8),
      searchedStateCode: cached.searchedStateCode ?? null,
      cached: true,
    });
  }

  try {
    const publicResults = await searchPublicWeb(searchIntent);

    if (publicResults.length === 0) {
      return NextResponse.json({
        posts: submittedPosts,
        error:
          submittedPosts.length > 0
            ? undefined
            : "No public experience results found yet. Try a specific DMV city, address, or road test issue.",
      });
    }

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "You analyze DMV-related public search snippets. Detect the real US state being searched, then create short experience cards. Return only valid JSON.",
        },
        {
          role: "user",
          content: `Selected state in app:
${selectedState ? `${selectedState.name} (${selectedState.code})` : "not selected"}

User search intent:
${searchIntent}

Public search snippets:
${publicResults
  .map((result, index) => `${index + 1}. ${result.title}\n${result.snippet}`)
  .join("\n\n")}

Tasks:
1. Infer searchedStateCode from the user query and snippets. Use two-letter US state code.
2. If the query mentions a city/location that clearly belongs to another state, searchedStateCode must be that real state.
3. Example: Hamden means Connecticut, searchedStateCode CT.
4. Create 2 to 5 DMV learner experience cards only if snippets are DMV-related.

Rules:
- Do not include URLs or citations.
- Do not copy text word-for-word.
- Do not force the selected app state onto another state's result.
- topic must be one of: road_test, parking, permit_test, documents, general.
- sourceType must be public_web or reddit_like.
- Return only JSON.

JSON shape:
{
  "searchedStateCode": "CT",
  "searchedCity": "Hamden",
  "posts": [
    {
      "id": "unique-id",
      "title": "short title",
      "body": "2 to 4 sentence summary",
      "stateCode": "CT",
      "city": "Hamden",
      "dmvLocation": "Hamden DMV",
      "topic": "road_test",
      "sourceType": "public_web",
      "upvotes": 0,
      "createdAt": "${new Date().toISOString().slice(0, 10)}"
    }
  ]
}`,
        },
      ],
    });

    const content = response.choices[0]?.message.content ?? "";
    const result = safeParseResult(content);
    const searchedStateCode = result.searchedStateCode?.trim().toUpperCase() || null;

    if (
      selectedStateCode &&
      searchedStateCode &&
      searchedStateCode !== selectedStateCode
    ) {
      return NextResponse.json({
        posts: [],
        notice: `This search looks like it belongs to ${searchedStateCode}, not ${selectedStateCode}. Please change your selected state or search a city/location in ${selectedStateCode}.`,
        suggestedStateCode: searchedStateCode,
      });
    }

    const finalStateCode = searchedStateCode ?? selectedStateCode ?? "US";
    const posts = normalizePosts(result.posts ?? [], finalStateCode);

    await setCachedExperiences({
      searchIntent,
      stateCode: selectedStateCode,
      posts,
      searchedStateCode,
    });

    return NextResponse.json({
      posts,
      searchedStateCode,
      cached: false,
    });
  } catch {
    return NextResponse.json({
      posts: [],
      error:
        "Live search failed. Try a specific DMV city, DMV address, or road test issue.",
    });
  }
}








