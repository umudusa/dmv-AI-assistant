import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getStateByCode } from "@/config/states";
import type { ExperiencePost } from "@/types/experience";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ExperienceSearchRequest = {
  query?: string;
  stateCode?: string | null;
  city?: string;
};

function cleanText(text: string) {
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function safeParsePosts(text: string): ExperiencePost[] {
  const cleaned = text
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned) as { posts?: ExperiencePost[] };

  return (parsed.posts ?? []).map((post) => ({
    ...post,
    title: cleanText(post.title),
    body: cleanText(post.body),
    dmvLocation: post.dmvLocation ? cleanText(post.dmvLocation) : undefined,
    city: post.city ? cleanText(post.city) : undefined,
  }));
}

export async function POST(request: Request) {
  const body = (await request.json()) as ExperienceSearchRequest;
  const state = body.stateCode ? getStateByCode(body.stateCode) : undefined;
  const query = body.query?.trim();
  const city = body.city?.trim();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { posts: [], error: "OPENAI_API_KEY is missing." },
      { status: 500 },
    );
  }

  const searchIntent = query
    ? query
    : [
        state ? `${state.name} DMV road test experiences` : "DMV road test experiences",
        city ? `${city} DMV` : "",
        "public learner discussion road test parking blind spot examiner",
      ]
        .filter(Boolean)
        .join(" ");

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      tools: [{ type: "web_search_preview" }],
      input: `Search the public web for real DMV learner experiences.

Search intent:
${searchIntent}

Selected state:
${state ? `${state.name} (${state.code})` : "not selected"}

City/location filter:
${city || "none"}

Rules:
- Focus on real learner experiences and public discussion patterns.
- Use public web, Reddit-like/forum discussions, and community reports when available.
- Do not copy posts word-for-word.
- Do not include URLs, markdown links, citations, or source links inside title or body.
- Summarize the useful experience directly inside the body so the user can stay on our site.
- Body should be 2 to 4 helpful sentences.
- Include practical details when found: parking type, road conditions, examiner focus, common fail reasons, location impressions.
- Do not include official DMV rules as experience posts.
- If there are not enough results, return fewer posts.
- sourceType must be "public_web" or "reddit_like".
- topic must be one of: "road_test", "parking", "permit_test", "documents", "general".
- Return only valid JSON. No markdown.

JSON shape:
{
  "posts": [
    {
      "id": "unique-id",
      "title": "short title",
      "body": "summary written in your own words, no links",
      "stateCode": "CT",
      "city": "Bridgeport",
      "dmvLocation": "Bridgeport DMV",
      "topic": "road_test",
      "sourceType": "public_web",
      "upvotes": 0,
      "createdAt": "2026-05-25"
    }
  ]
}`,
    });

    return NextResponse.json({
      posts: safeParsePosts(response.output_text),
    });
  } catch {
    return NextResponse.json(
      {
        posts: [],
        error:
          "Could not search public experiences right now. Try a more specific state, city, or DMV location.",
      },
      { status: 500 },
    );
  }
}
