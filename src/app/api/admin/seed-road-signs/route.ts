import { NextResponse } from "next/server";
import { states } from "@/config/states";
import { createSupabaseAdminClient } from "@/lib/supabase";

const signBank = [
  ["R1-1", "MUTCD_R1-1.svg", "STOP sign", "Stop completely, check traffic, then proceed when safe.", ["Stop", "Yield", "Speed limit", "One way"], 0],
  ["R1-2", "MUTCD_R1-2.svg", "YIELD sign", "Slow down and give the right-of-way. Stop if needed.", ["Stop", "Yield", "Do not enter", "No parking"], 1],
  ["R2-1", "MUTCD_R2-1.svg", "SPEED LIMIT sign", "Drive no faster than the posted speed under normal conditions.", ["Minimum speed", "Speed limit", "Work zone only", "No passing"], 1],
  ["R3-1", "MUTCD_R3-1.svg", "NO RIGHT TURN sign", "You may not make a right turn where this sign is posted.", ["Right turn required", "No right turn", "One way right", "Road curves right"], 1],
  ["R3-2", "MUTCD_R3-2.svg", "NO LEFT TURN sign", "You may not make a left turn where this sign is posted.", ["No left turn", "Left lane ends", "Turn left only", "Detour left"], 0],
  ["R3-3", "MUTCD_R3-3.svg", "NO TURNS sign", "You may not turn right or left at this location.", ["No turns", "Two-way traffic", "Roundabout", "Lane ends"], 0],
  ["R3-4", "MUTCD_R3-4.svg", "NO U-TURN sign", "You may not make a U-turn where this sign is posted.", ["U-turn allowed", "No U-turn", "No left turn", "Divided highway"], 1],
  ["R4-1", "MUTCD_R4-1.svg", "DO NOT PASS sign", "Do not pass other vehicles after this sign.", ["Passing allowed", "Do not pass", "Keep right", "Yield ahead"], 1],
  ["R4-2", "MUTCD_R4-2.svg", "PASS WITH CARE sign", "Passing may resume only when it is safe and legal.", ["Pass with care", "Do not enter", "Stop ahead", "No parking"], 0],
  ["R4-7", "MUTCD_R4-7.svg", "KEEP RIGHT sign", "Keep to the right of the island, divider, or obstruction.", ["Keep left", "Keep right", "Right turn only", "No right turn"], 1],
  ["R5-1", "MUTCD_R5-1.svg", "DO NOT ENTER sign", "Do not drive into this roadway or ramp.", ["Do not enter", "Yield", "No parking", "Wrong lane"], 0],
  ["R5-1a", "MUTCD_R5-1a.svg", "WRONG WAY sign", "You are traveling against traffic. Safely stop and correct direction.", ["One way", "Wrong way", "No outlet", "Detour"], 1],
  ["R6-1R", "MUTCD_R6-1R.svg", "ONE WAY sign", "Traffic moves only in the direction shown by the arrow.", ["Two-way traffic", "One way", "No passing", "Divided highway"], 1],
  ["R6-2R", "MUTCD_R6-2R.svg", "ONE WAY vertical sign", "Traffic moves only in the direction shown.", ["One way", "Yield ahead", "Merge", "Stop ahead"], 0],
  ["R8-3", "MUTCD_R8-3.svg", "NO PARKING sign", "Parking is not allowed where this sign applies.", ["No parking", "No passing", "No turns", "No trucks"], 0],
  ["W1-1L", "MUTCD_W1-1L.svg", "SHARP LEFT TURN warning sign", "The road turns sharply left ahead. Slow down.", ["Sharp left turn", "Left lane closed", "No left turn", "Detour left"], 0],
  ["W1-2R", "MUTCD_W1-2R.svg", "RIGHT CURVE warning sign", "The road curves right ahead. Adjust speed.", ["Right curve", "No right turn", "Road narrows", "Merge right"], 0],
  ["W1-3L", "MUTCD_W1-3L.svg", "REVERSE TURN warning sign", "The road turns left then right ahead. Slow down.", ["Reverse turn", "Roundabout", "No U-turn", "One way"], 0],
  ["W2-1", "MUTCD_W2-1.svg", "CROSS ROAD warning sign", "A cross road is ahead. Watch for entering traffic.", ["Cross road", "Railroad crossing", "School zone", "No outlet"], 0],
  ["W3-1", "MUTCD_W3-1.svg", "STOP AHEAD warning sign", "A stop sign is ahead. Begin slowing down.", ["Stop ahead", "Yield ahead", "Signal ahead", "Road closed"], 0],
  ["W3-2", "MUTCD_W3-2.svg", "YIELD AHEAD warning sign", "A yield sign is ahead. Be ready to slow or stop.", ["Yield ahead", "Stop ahead", "Merge ahead", "No passing"], 0],
  ["W3-3", "MUTCD_W3-3.svg", "SIGNAL AHEAD warning sign", "A traffic signal is ahead. Be ready to stop.", ["Signal ahead", "Stop only", "Railroad ahead", "School crossing"], 0],
  ["W4-2", "MUTCD_W4-2.svg", "LANE ENDS / MERGE warning sign", "A lane ends ahead. Merge safely.", ["Lane ends", "Divided highway", "No passing", "Keep right"], 0],
  ["W6-1", "MUTCD_W6-1.svg", "DIVIDED HIGHWAY warning sign", "A divided highway begins ahead.", ["Divided highway", "Two-way traffic", "No median", "Road closed"], 0],
  ["W10-1", "MUTCD_W10-1.svg", "RAILROAD CROSSING AHEAD warning sign", "A railroad crossing is ahead. Slow down and look both ways.", ["Railroad crossing ahead", "School crossing", "Pedestrian crossing", "No passing"], 0],
  ["W11-2", "MUTCD_W11-2.svg", "PEDESTRIAN CROSSING warning sign", "Watch for pedestrians crossing or near the roadway.", ["Pedestrian crossing", "School bus stop", "Bike lane", "No walking"], 0],
  ["W11-8", "MUTCD_W11-8.svg", "BICYCLE warning sign", "Watch for bicyclists near or crossing the roadway.", ["Bicycle warning", "No bicycles", "Bike parking", "Motorcycle lane"], 0],
  ["W14-1", "MUTCD_W14-1.svg", "DEAD END warning sign", "The road ends ahead with no through route.", ["Dead end", "Detour", "Road work", "No passing"], 0],
  ["W14-2", "MUTCD_W14-2.svg", "NO OUTLET warning sign", "The road has no outlet ahead.", ["No outlet", "One way", "No entry", "Do not pass"], 0],
  ["S1-1", "MUTCD_S1-1.svg", "SCHOOL warning sign", "A school area or school crossing is ahead. Slow down and watch for children.", ["School crossing", "Hospital", "Playground only", "No pedestrians"], 0]
] as const;

function imageUrl(fileName: string) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
}

function sourceUrl(fileName: string) {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fileName)}`;
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

  await supabase
    .from("practice_questions")
    .delete()
    .eq("mode", "road_signs")
    .not("sign_code", "is", null);

  const rows = states.flatMap((state) =>
    signBank.map(([code, fileName, title, explanation, choices, correctIndex]) => ({
      state_code: state.code,
      mode: "road_signs",
      topic: "signs",
      sign_code: code,
      question: `What does this ${title} mean?`,
      choices,
      correct_answer_index: correctIndex,
      explanation,
      image_url: imageUrl(fileName),
      source_url: sourceUrl(fileName),
      status: "published",
    })),
  );

  const { error } = await supabase
    .from("practice_questions")
    .upsert(rows, {
      onConflict: "state_code,sign_code,question",
      ignoreDuplicates: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message, attempted: rows.length }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    insertedOrUpdated: rows.length,
    states: states.length,
    signsPerState: signBank.length,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    signs: signBank.length,
    states: states.length,
  });
}
