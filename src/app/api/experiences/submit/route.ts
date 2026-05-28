import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type { ExperienceTopic } from "@/types/experience";

type SubmitExperienceRequest = {
  title?: string;
  body?: string;
  stateCode?: string;
  dmvLocation?: string;
  topic?: ExperienceTopic;
};

const topics: ExperienceTopic[] = [
  "road_test",
  "parking",
  "permit_test",
  "documents",
  "general",
];

function clean(value?: string) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function guessCity(location: string) {
  const firstPart = location.split(",")[0]?.trim();

  if (!firstPart) {
    return undefined;
  }

  return firstPart
    .replace(/\bDMV\b/gi, "")
    .replace(/\bMVA\b/gi, "")
    .replace(/\bBMV\b/gi, "")
    .trim() || undefined;
}

export async function POST(request: Request) {
  const body = (await request.json()) as SubmitExperienceRequest;

  const title = clean(body.title);
  const postBody = clean(body.body);
  const stateCode = clean(body.stateCode).toUpperCase();
  const dmvLocation = clean(body.dmvLocation);
  const topic = body.topic && topics.includes(body.topic) ? body.topic : "general";

  if (!title || title.length < 8) {
    return NextResponse.json(
      { error: "Please write a more specific title." },
      { status: 400 },
    );
  }

  if (!stateCode || stateCode.length !== 2) {
    return NextResponse.json(
      { error: "Please select the state where this happened." },
      { status: 400 },
    );
  }

  if (!dmvLocation || dmvLocation.length < 3) {
    return NextResponse.json(
      { error: "Please add the DMV location, city, or address." },
      { status: 400 },
    );
  }

  if (!postBody || postBody.length < 10) {
    return NextResponse.json(
      { error: "Please write at least a short sentence about what happened." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 },
    );
  }

  const { error } = await supabase.from("experience_posts").insert({
    title,
    body: postBody,
    state_code: stateCode,
    city: guessCity(dmvLocation),
    dmv_location: dmvLocation,
    topic,
    source_type: "user_submitted",
    moderation_status: "pending",
    upvotes: 0,
  });

  if (error) {
    return NextResponse.json(
      { error: "Could not submit your experience right now." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Thanks. Your experience was submitted for review.",
  });
}

