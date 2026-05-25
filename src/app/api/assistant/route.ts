import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getStateByCode } from "@/config/states";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type AssistantRequest = {
  question?: string;
  stateCode?: string | null;
};

function asksForOfficialLookup(message: string) {
  const text = message.toLowerCase();

  return (
    text.includes("official") ||
    text.includes("website") ||
    text.includes("site") ||
    text.includes("link") ||
    text.includes("manual") ||
    text.includes("handbook") ||
    text.includes("source")
  );
}

function stateContext(stateCode: string | null) {
  if (!stateCode) {
    return "No state is selected.";
  }

  const state = getStateByCode(stateCode);

  if (!state) {
    return `Selected state code: ${stateCode}. No config found.`;
  }

  return `Selected state:
Name: ${state.name}
Code: ${state.code}
Configured official DMV website: ${state.dmvWebsite}
Configured manual page: ${state.manualPage}`;
}

function fallbackOfficialLinks(stateCode: string | null) {
  const state = stateCode ? getStateByCode(stateCode) : undefined;

  if (!state) {
    return "I can help find the official DMV link, but please choose a state first.";
  }

  return `${state.name} official DMV website:
${state.dmvWebsite}

Driver manual / handbook:
${state.manualPage}`;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    keyLength: process.env.OPENAI_API_KEY?.length ?? 0,
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as AssistantRequest;
  const question = body.question?.trim();
  const stateCode = body.stateCode ?? null;
  const needsOfficialLookup = question ? asksForOfficialLookup(question) : false;

  if (!question) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        question,
        message:
          "OpenAI API key is missing. Add OPENAI_API_KEY to .env.local and restart the dev server.",
      },
      { status: 500 },
    );
  }

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      tools: needsOfficialLookup ? [{ type: "web_search_preview" }] : [],
      input: `You are a DMV-only AI assistant for a non-official DMV learning and practice hub.

${stateContext(stateCode)}

User message: ${question}

Rules:
- Answer only DMV-related topics.
- If the user asks for an official DMV site, official link, manual, handbook, or source, use web search to find the official state DMV/BMV/MVD page.
- Prefer official government/state DMV domains. Avoid SEO/private DMV help sites.
- For official links, answer cleanly with the link and a one-line explanation. Do not over-explain.
- If web search is unavailable, use the configured official DMV website and manual page from the state context.
- For normal DMV questions, focus on official DMV/state manual style guidance.
- Do not include Reddit or real user experience in assistant answers. Experiences live in the Experiences page.
- Do not claim this is an official DMV website.
- Do not book, change, or cancel DMV appointments.
- Be concise, useful, and human.

Return only the assistant message. No JSON. No markdown table.`,
    });

    const message = response.output_text.trim();

    return NextResponse.json({
      question,
      message: message || fallbackOfficialLinks(stateCode),
    });
  } catch {
    return NextResponse.json({
      question,
      message: needsOfficialLookup
        ? fallbackOfficialLinks(stateCode)
        : "I could not reach the AI service right now. Please try again in a moment.",
    });
  }
}
