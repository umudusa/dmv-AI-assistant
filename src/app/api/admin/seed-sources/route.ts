import { NextResponse } from "next/server";
import { states } from "@/config/states";
import {
  createSupabaseAdminClient,
  getSupabaseDebugInfo,
} from "@/lib/supabase";

type OfficialSourceSeed = {
  state_code: string;
  source_type: "dmv_website" | "manual_page" | "manual_pdf";
  title: string;
  url: string;
  status: "ready" | "needs_review" | "broken";
};

function buildSources(): OfficialSourceSeed[] {
  return states.flatMap((state) => {
    const sources: OfficialSourceSeed[] = [
      {
        state_code: state.code,
        source_type: "dmv_website",
        title: `${state.name} official DMV website`,
        url: state.dmvWebsite,
        status: state.manualStatus === "ready" ? "ready" : "needs_review",
      },
      {
        state_code: state.code,
        source_type: "manual_page",
        title: `${state.name} driver manual page`,
        url: state.manualPage,
        status: state.manualStatus === "ready" ? "ready" : "needs_review",
      },
    ];

    if (state.manualPdfUrl) {
      sources.push({
        state_code: state.code,
        source_type: "manual_pdf",
        title: `${state.name} driver manual PDF`,
        url: state.manualPdfUrl,
        status: state.manualStatus === "ready" ? "ready" : "needs_review",
      });
    }

    return sources;
  });
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hasSeedSecret: Boolean(process.env.ADMIN_SEED_SECRET),
    seedSecretLength: process.env.ADMIN_SEED_SECRET?.length ?? 0,
    ...getSupabaseDebugInfo(),
  });
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.ADMIN_SEED_SECRET?.trim();

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
          hasSeedSecret: Boolean(expectedToken),
          seedSecretLength: expectedToken?.length ?? 0,
          receivedAuthLength: authHeader?.length ?? 0,
        },
        { status: 401 },
      );
    }

    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json(
        {
          error: "Supabase admin config is missing.",
          ...getSupabaseDebugInfo(),
        },
        { status: 500 },
      );
    }

    const sources = buildSources();
    let inserted = 0;
    let skipped = 0;

    for (const source of sources) {
      const existingResult = await supabase
        .from("official_sources")
        .select("id")
        .eq("url", source.url)
        .maybeSingle();

      if (existingResult.error) {
        return NextResponse.json(
          {
            step: "check_existing",
            sourceUrl: source.url,
            error: existingResult.error.message,
            ...getSupabaseDebugInfo(),
          },
          { status: 500 },
        );
      }

      if (existingResult.data) {
        skipped += 1;
        continue;
      }

      const insertResult = await supabase
        .from("official_sources")
        .insert(source);

      if (insertResult.error) {
        return NextResponse.json(
          {
            step: "insert",
            sourceUrl: source.url,
            error: insertResult.error.message,
            inserted,
            skipped,
            ...getSupabaseDebugInfo(),
          },
          { status: 500 },
        );
      }

      inserted += 1;
    }

    return NextResponse.json({
      ok: true,
      inserted,
      skipped,
      total: sources.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        step: "unexpected_exception",
        error: getErrorMessage(error),
        ...getSupabaseDebugInfo(),
      },
      { status: 500 },
    );
  }
}
