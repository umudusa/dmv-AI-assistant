import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

const bucketName = "road-signs";

const signFiles: Record<string, string> = {
  "R1-1": "MUTCD_R1-1.svg",
  "R1-2": "MUTCD_R1-2.svg",
  "R2-1": "MUTCD_R2-1.svg",
  "R3-1": "MUTCD_R3-1.svg",
  "R3-2": "MUTCD_R3-2.svg",
  "R3-3": "MUTCD_R3-3.svg",
  "R3-4": "MUTCD_R3-4.svg",
  "R4-1": "MUTCD_R4-1.svg",
  "R4-2": "MUTCD_R4-2.svg",
  "R4-7": "MUTCD_R4-7.svg",
  "R5-1": "MUTCD_R5-1.svg",
  "R5-1a": "MUTCD_R5-1a.svg",
  "R6-1R": "MUTCD_R6-1R.svg",
  "R6-2R": "MUTCD_R6-2R.svg",
  "R8-3": "MUTCD_R8-3.svg",
  "W1-1L": "MUTCD_W1-1L.svg",
  "W1-2R": "MUTCD_W1-2R.svg",
  "W1-3L": "MUTCD_W1-3L.svg",
  "W2-1": "MUTCD_W2-1.svg",
  "W3-1": "MUTCD_W3-1.svg",
  "W3-2": "MUTCD_W3-2.svg",
  "W3-3": "MUTCD_W3-3.svg",
  "W4-2": "MUTCD_W4-2.svg",
  "W6-1": "MUTCD_W6-1.svg",
  "W10-1": "MUTCD_W10-1.svg",
  "W11-2": "MUTCD_W11-2.svg",
  "W11-8": "MUTCD_W11-8.svg",
  "W14-1": "MUTCD_W14-1.svg",
  "W14-2": "MUTCD_W14-2.svg",
  "S1-1": "MUTCD_S1-1.svg",
};

function commonsUrl(fileName: string) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
}

async function ensureBucket(supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((bucket) => bucket.name === bucketName);

  if (!exists) {
    await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 1024 * 1024,
      allowedMimeTypes: ["image/svg+xml"],
    });
  }
}

async function uploadFile(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  fileName: string,
) {
  const existing = supabase.storage.from(bucketName).getPublicUrl(fileName);

  const response = await fetch(commonsUrl(fileName), {
    headers: {
      "User-Agent": "DMV-AI-Practice-Hub/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Download failed for ${fileName}: ${response.status}`);
  }

  const fileBody = await response.arrayBuffer();

  const { error } = await supabase.storage.from(bucketName).upload(fileName, fileBody, {
    contentType: "image/svg+xml",
    upsert: true,
  });

  if (error) {
    throw new Error(`Upload failed for ${fileName}: ${error.message}`);
  }

  return existing.data.publicUrl;
}

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = process.env.ADMIN_SEED_SECRET;

  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase admin config missing" }, { status: 500 });
  }

  try {
    await ensureBucket(supabase);

    let uploaded = 0;
    let updatedRows = 0;

    for (const [signCode, fileName] of Object.entries(signFiles)) {
      const publicUrl = await uploadFile(supabase, fileName);

      const { count, error } = await supabase
        .from("practice_questions")
        .update({ image_url: publicUrl })
        .eq("mode", "road_signs")
        .eq("sign_code", signCode)
        .select("id", { count: "exact", head: true });

      if (error) {
        throw new Error(`DB update failed for ${signCode}: ${error.message}`);
      }

      uploaded += 1;
      updatedRows += count ?? 0;

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    return NextResponse.json({
      ok: true,
      bucket: bucketName,
      uploaded,
      updatedRows,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Storage seed failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    bucket: bucketName,
    signs: Object.keys(signFiles).length,
  });
}
