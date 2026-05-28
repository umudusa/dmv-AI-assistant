/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { states } from "@/config/states";
import { useSelectedState } from "@/components/states/SelectedStateContext";
import type {
  PracticeMode,
  PracticeQuestion,
  PracticeTopic,
} from "@/types/practice";

const modes: { label: string; value: PracticeMode }[] = [
  { label: "Real Exam Mode", value: "real_exam" },
  { label: "Road Signs Mode", value: "road_signs" },
  { label: "Mistake Review", value: "mistake_review" },
];

const topics: { label: string; value: PracticeTopic }[] = [
  { label: "Mixed Topics", value: "mixed" },
  { label: "Rules of Road", value: "rules_of_road" },
  { label: "Signs", value: "signs" },
  { label: "Parking", value: "parking" },
  { label: "Safety", value: "safety" },
  { label: "Documents", value: "documents" },
];

type PracticeResponse = {
  questions: PracticeQuestion[];
  passingScore: number;
  totalQuestions: number;
  error?: string;
};

export function PracticeStartCard() {
  const { selectedStateCode } = useSelectedState();
  const [stateCode, setStateCode] = useState("");
  const [mode, setMode] = useState<PracticeMode>("real_exam");
  const [topic, setTopic] = useState<PracticeTopic>("mixed");
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [passingScore, setPassingScore] = useState(20);
  const [reviewMode, setReviewMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  const activeStateCode = stateCode || selectedStateCode || "";
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isFinished = questions.length > 0 && answeredCount === questions.length;

  const correctCount = useMemo(() => {
    return questions.reduce((total, question) => {
      return answers[question.id] === question.correctAnswerIndex
        ? total + 1
        : total;
    }, 0);
  }, [answers, questions]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (selectedStateCode && !stateCode) {
        setStateCode(selectedStateCode);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [selectedStateCode, stateCode]);

  async function startPractice() {
    if (!activeStateCode) {
      setStatus("Please choose a state first.");
      return;
    }

    setIsLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/practice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stateCode: activeStateCode,
          mode,
          topic,
        }),
      });

      const data = (await response.json()) as PracticeResponse;

      if (!response.ok) {
        setStatus(data.error ?? "Could not start practice.");
        return;
      }

      setQuestions(data.questions);
      setPassingScore(data.passingScore ?? 20);
      setAnswers({});
      setCurrentIndex(0);
      setReviewMode(false);
      setIsOpen(true);
    } catch {
      setStatus("Could not start practice right now.");
    } finally {
      setIsLoading(false);
    }
  }

  function answerQuestion(choiceIndex: number) {
    if (!currentQuestion || answers[currentQuestion.id] !== undefined) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: choiceIndex,
    }));

    window.setTimeout(() => {
      setCurrentIndex((index) => {
        if (index >= questions.length - 1) {
          return index;
        }

        return index + 1;
      });
    }, 180);
  }

  function nextQuestion() {
    setCurrentIndex((index) => Math.min(index + 1, questions.length - 1));
  }

  function previousQuestion() {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }

  function closePractice() {
    setIsOpen(false);
  }

  function restartPractice() {
    setAnswers({});
    setCurrentIndex(0);
    setReviewMode(false);
  }

  const missedQuestions = questions.filter(
    (question) => answers[question.id] !== question.correctAnswerIndex,
  );

  const selectedAnswer =
    currentQuestion ? answers[currentQuestion.id] : undefined;

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <select
            value={activeStateCode}
            onChange={(event) => setStateCode(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 outline-none"
          >
            <option value="">Select state</option>
            {states.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>

          <select
            value={mode}
            onChange={(event) => {
              const nextMode = event.target.value as PracticeMode;
              setMode(nextMode);
              if (nextMode === "road_signs") {
                setTopic("signs");
              }
              if (nextMode === "mistake_review") {
                setTopic("mixed");
              }
            }}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 outline-none"
          >
            {modes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={topic}
            disabled={mode === "road_signs" || mode === "mistake_review"}
            onChange={(event) => setTopic(event.target.value as PracticeTopic)}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 outline-none disabled:text-slate-400"
          >
            {topics.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={startPractice}
          disabled={isLoading}
          className="mt-4 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-slate-900/10 disabled:bg-slate-300"
        >
          {isLoading ? "Preparing questions..." : "Start 25-Question Practice"}
        </button>

        {status && (
          <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs font-bold text-amber-900">
            {status}
          </p>
        )}

        <p className="mt-3 text-xs leading-5 text-slate-500">
          Unlimited daily practice. Each session has 25 questions. Score 20 or more to pass.
        </p>
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur">
          <section className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">
                  {activeStateCode} Practice Session
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Question {currentIndex + 1} of {questions.length}
                </h2>
              </div>

              <button
                type="button"
                onClick={closePractice}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {reviewMode && (
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-rose-700">
                    Mistake Review
                  </p>
                  <h3 className="mt-3 text-3xl font-black text-slate-950">
                    {missedQuestions.length} missed question{missedQuestions.length === 1 ? "" : "s"}
                  </h3>

                  <div className="mt-6 space-y-4">
                    {missedQuestions.length === 0 && (
                      <div className="rounded-2xl bg-emerald-50 p-5 text-sm font-bold text-emerald-800">
                        No mistakes in this session.
                      </div>
                    )}

                    {missedQuestions.map((question) => {
                      const userAnswer = answers[question.id];

                      return (
                        <article key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          {question.imageUrl && (
                            <div className="mb-4 flex justify-center">
                              <img loading="lazy" referrerPolicy="no-referrer"
                                src={question.imageUrl}
                                alt="Road sign for missed question"
                                width={120}
                                height={120}
                                className="h-30 w-30 object-contain"
                              />
                            </div>
                          )}

                          <h4 className="text-base font-black text-slate-950">
                            {question.question}
                          </h4>
                          <p className="mt-3 text-sm font-semibold text-rose-700">
                            Your answer: {userAnswer !== undefined ? question.choices[userAnswer] : "Not answered"}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-emerald-700">
                            Correct answer: {question.choices[question.correctAnswerIndex]}
                          </p>
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {question.explanation}
                          </p>
                        </article>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setReviewMode(false)}
                    className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
                  >
                    Back to Result
                  </button>
                </div>
              )}

              {currentQuestion && !isFinished && !reviewMode && (
                <>
                  <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-sky-500 transition-all"
                      style={{
                        width: `${(answeredCount / questions.length) * 100}%`,
                      }}
                    />
                  </div>

                  {currentQuestion.imageUrl && (
                    <div className="mb-5 flex justify-center rounded-2xl bg-slate-50 p-5">
                      <img loading="lazy" referrerPolicy="no-referrer"
                        src={currentQuestion.imageUrl}
                        alt="Road sign for this question"
                        width={144}
                        height={144}
                        className="h-36 w-36 object-contain"
                      />
                    </div>
                  )}

                  <h3 className="text-2xl font-black leading-tight text-slate-950">
                    {currentQuestion.question}
                  </h3>

                  <div className="mt-6 grid gap-3">
                    {currentQuestion.choices.map((choice, index) => {
                      const isSelected = selectedAnswer === index;
                      return (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => answerQuestion(index)}
                          className={`rounded-2xl border p-4 text-left text-sm font-bold transition ${
                            isSelected
                              ? "border-sky-300 bg-sky-50 text-sky-900"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300"
                          }`}
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>


                </>
              )}

              {isFinished && !reviewMode && (
                <div className="text-center">
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-sky-700">
                    Result
                  </p>
                  <h3 className="mt-3 text-5xl font-black text-slate-950">
                    {correctCount} / {questions.length}
                  </h3>
                  <p
                    className={`mt-4 text-xl font-black ${
                      correctCount >= passingScore
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }`}
                  >
                    {correctCount >= passingScore ? "Pass" : "Keep Practicing"}
                  </p>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
                    Passing score is {passingScore} correct answers out of {questions.length}.
                  </p>
                  <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setReviewMode(true)}
                      className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700"
                    >
                      Review Mistakes
                    </button>
                    <button
                      type="button"
                      onClick={restartPractice}
                      className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
                    >
                      Practice Again
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!isFinished && (
              <div className="flex items-center justify-between border-t border-slate-200 p-5">
                <button
                  type="button"
                  onClick={previousQuestion}
                  disabled={currentIndex === 0}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-xs font-bold text-slate-500">
                  {answeredCount} answered
                </span>

                <button
                  type="button"
                  onClick={nextQuestion}
                  disabled={
                    selectedAnswer === undefined ||
                    currentIndex === questions.length - 1
                  }
                  className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white disabled:bg-slate-300"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}







