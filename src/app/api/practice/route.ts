import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { getGeneratedPracticeQuestions } from "@/lib/practice-question-bank";
import type {
  PracticeMode,
  PracticeQuestion,
  PracticeTopic,
} from "@/types/practice";

type PracticeQuestionRow = {
  id: string;
  state_code: string;
  mode: PracticeMode;
  topic: PracticeTopic;
  question: string;
  choices: string[];
  correct_answer_index: number;
  explanation: string;
  image_url?: string | null;
};

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function rowToQuestion(row: PracticeQuestionRow): PracticeQuestion {
  return {
    id: row.id,
    stateCode: row.state_code,
    mode: row.mode,
    topic: row.topic,
    question: row.question,
    choices: row.choices,
    correctAnswerIndex: row.correct_answer_index,
    explanation: row.explanation,
    imageUrl: row.image_url ?? undefined,
  };
}

function topicFilterForMode(mode: PracticeMode, topic: PracticeTopic) {
  if (mode === "road_signs") return ["signs"];
  if (topic !== "mixed") return [topic];
  return ["rules_of_road", "signs", "parking", "safety", "documents", "mixed"];
}

function generatedQuestions({
  stateCode,
  mode,
  topic,
}: {
  stateCode: string;
  mode: PracticeMode;
  topic: PracticeTopic;
}) {
  const allowedTopics = topicFilterForMode(mode, topic);

  return shuffle(
    getGeneratedPracticeQuestions(stateCode)
      .filter((question) => allowedTopics.includes(question.topic))
      .map((question) => ({
        ...question,
        stateCode,
        mode,
      })),
  ).slice(0, 25);
}

async function getDatabaseQuestions({
  stateCode,
  mode,
  topic,
}: {
  stateCode: string;
  mode: PracticeMode;
  topic: PracticeTopic;
}) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) return [];

  const allowedTopics = topicFilterForMode(mode, topic);

  let query = supabase
    .from("practice_questions")
    .select("id,state_code,mode,topic,question,choices,correct_answer_index,explanation,image_url")
    .eq("state_code", stateCode)
    .eq("status", "published")
    .in("topic", allowedTopics)
    .limit(250);

  if (mode !== "real_exam") {
    query = query.eq("mode", mode);
  }

  const { data } = await query;

  return shuffle((data ?? []).map((row) => rowToQuestion(row as PracticeQuestionRow))).slice(0, 25);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    stateCode?: string;
    mode?: PracticeMode;
    topic?: PracticeTopic;
  };

  const stateCode = body.stateCode?.trim().toUpperCase();

  if (!stateCode) {
    return NextResponse.json(
      { error: "Please select a state.", questions: [] },
      { status: 400 },
    );
  }

  const mode = body.mode ?? "real_exam";
  const topic = mode === "road_signs" ? "signs" : (body.topic ?? "mixed");
  const databaseQuestions = await getDatabaseQuestions({ stateCode, mode, topic });

  if (mode === "road_signs" && databaseQuestions.length < 25) {
    return NextResponse.json(
      {
        error:
          "Road sign question bank is not ready for this state yet. Please try again after the sign bank is updated.",
        questions: [],
        passingScore: 20,
        totalQuestions: 25,
        source: "database_missing",
      },
      { status: 503 },
    );
  }

  const questions =
    databaseQuestions.length >= 25
      ? databaseQuestions
      : generatedQuestions({ stateCode, mode, topic });

  return NextResponse.json({
    questions,
    passingScore: 20,
    totalQuestions: 25,
    source: databaseQuestions.length >= 25 ? "database" : "generated_bank",
  });
}

export async function GET() {
  return NextResponse.json({ questions: [] });
}

