import type { PracticeQuestion, PracticeTopic } from "@/types/practice";

type SeedQuestion = Omit<PracticeQuestion, "stateCode" | "mode">;

type SignSeed = {
  key: string;
  label: string;
  shape: "octagon" | "triangle" | "diamond" | "rectangle" | "circle" | "pentagon";
  fill: string;
  stroke: string;
  textColor: string;
  answer: string;
  wrong: string[];
};

function signImage(seed: SignSeed) {
  const shape =
    seed.shape === "triangle"
      ? `<polygon points="80,18 146,136 14,136" fill="${seed.fill}" stroke="${seed.stroke}" stroke-width="7"/>`
      : seed.shape === "diamond"
        ? `<rect x="34" y="34" width="92" height="92" rx="8" fill="${seed.fill}" stroke="${seed.stroke}" stroke-width="7" transform="rotate(45 80 80)"/>`
        : seed.shape === "rectangle"
          ? `<rect x="18" y="38" width="124" height="84" rx="8" fill="${seed.fill}" stroke="${seed.stroke}" stroke-width="7"/>`
          : seed.shape === "circle"
            ? `<circle cx="80" cy="80" r="58" fill="${seed.fill}" stroke="${seed.stroke}" stroke-width="7"/>`
            : seed.shape === "pentagon"
              ? `<polygon points="80,16 138,58 116,144 44,144 22,58" fill="${seed.fill}" stroke="${seed.stroke}" stroke-width="7"/>`
              : `<polygon points="58,14 102,14 146,58 146,102 102,146 58,146 14,102 14,58" fill="${seed.fill}" stroke="${seed.stroke}" stroke-width="7"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" fill="#f8fafc"/>${shape}<text x="80" y="84" text-anchor="middle" font-family="Arial" font-size="14" font-weight="900" fill="${seed.textColor}">${seed.label}</text></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const signs: SignSeed[] = [
  { key: "stop", label: "STOP", shape: "octagon", fill: "#dc2626", stroke: "#ffffff", textColor: "#ffffff", answer: "Stop completely", wrong: ["Yield only", "No parking", "School zone"] },
  { key: "yield", label: "YIELD", shape: "triangle", fill: "#ffffff", stroke: "#dc2626", textColor: "#dc2626", answer: "Yield the right-of-way", wrong: ["Speed up", "No turns", "Parking only"] },
  { key: "warning", label: "WARNING", shape: "diamond", fill: "#facc15", stroke: "#111827", textColor: "#111827", answer: "Warning or hazard ahead", wrong: ["Gas station", "Hospital", "Parking only"] },
  { key: "speed-limit", label: "SPEED", shape: "rectangle", fill: "#ffffff", stroke: "#111827", textColor: "#111827", answer: "Maximum legal speed", wrong: ["Minimum speed only", "Suggested speed only", "Truck route"] },
  { key: "no-u-turn", label: "NO U TURN", shape: "circle", fill: "#ffffff", stroke: "#dc2626", textColor: "#111827", answer: "No U-turn allowed", wrong: ["No parking", "No stopping", "Railroad crossing"] },
  { key: "one-way", label: "ONE WAY", shape: "rectangle", fill: "#111827", stroke: "#111827", textColor: "#ffffff", answer: "Traffic moves one direction", wrong: ["Two-way traffic", "Dead end", "Stop ahead"] },
  { key: "do-not-enter", label: "DO NOT ENTER", shape: "circle", fill: "#dc2626", stroke: "#ffffff", textColor: "#ffffff", answer: "Do not enter this road", wrong: ["Enter slowly", "Truck lane", "School crossing"] },
  { key: "railroad", label: "RAILROAD", shape: "circle", fill: "#ffffff", stroke: "#111827", textColor: "#111827", answer: "Railroad crossing nearby", wrong: ["Airport nearby", "Hospital", "No passing"] },
  { key: "school", label: "SCHOOL", shape: "pentagon", fill: "#facc15", stroke: "#111827", textColor: "#111827", answer: "Watch for children", wrong: ["Work zone", "No pedestrians", "Truck route"] },
  { key: "pedestrian", label: "PED XING", shape: "diamond", fill: "#facc15", stroke: "#111827", textColor: "#111827", answer: "Pedestrian crossing", wrong: ["No walking", "Bike lane", "Bus stop"] },
  { key: "slippery", label: "SLIPPERY", shape: "diamond", fill: "#facc15", stroke: "#111827", textColor: "#111827", answer: "Road may be slippery", wrong: ["Road closed", "No passing", "Hill ahead only"] },
  { key: "merge", label: "MERGE", shape: "diamond", fill: "#facc15", stroke: "#111827", textColor: "#111827", answer: "Traffic merges ahead", wrong: ["Stop ahead", "No lane changes", "Parking lane"] },
  { key: "no-parking", label: "NO PARK", shape: "rectangle", fill: "#ffffff", stroke: "#dc2626", textColor: "#dc2626", answer: "No parking allowed", wrong: ["No left turn", "Speed limit", "Yield"] },
  { key: "work-zone", label: "WORK", shape: "diamond", fill: "#fb923c", stroke: "#111827", textColor: "#111827", answer: "Slow down for workers", wrong: ["Speed up", "Ignore cones", "Use shoulder"] },
  { key: "keep-right", label: "KEEP RIGHT", shape: "rectangle", fill: "#ffffff", stroke: "#111827", textColor: "#111827", answer: "Keep right of obstruction", wrong: ["Turn left only", "Stop", "No trucks"] },
  { key: "lane-ends", label: "LANE ENDS", shape: "diamond", fill: "#facc15", stroke: "#111827", textColor: "#111827", answer: "Lane ends ahead", wrong: ["Parking ahead", "No passing", "School zone"] },
  { key: "two-way", label: "TWO WAY", shape: "diamond", fill: "#facc15", stroke: "#111827", textColor: "#111827", answer: "Two-way traffic ahead", wrong: ["One-way road", "No traffic", "Bus lane"] },
  { key: "hospital", label: "HOSPITAL", shape: "rectangle", fill: "#2563eb", stroke: "#ffffff", textColor: "#ffffff", answer: "Hospital nearby", wrong: ["No parking", "School crossing", "Railroad"] },
  { key: "bike", label: "BIKE", shape: "diamond", fill: "#facc15", stroke: "#111827", textColor: "#111827", answer: "Watch for bicycles", wrong: ["No bicycles ever", "Bike repair", "Bus stop"] },
  { key: "deer", label: "DEER", shape: "diamond", fill: "#facc15", stroke: "#111827", textColor: "#111827", answer: "Animal crossing area", wrong: ["Zoo entrance", "No animals", "Parking area"] },
];

const normalQuestions: Array<{
  topic: PracticeTopic;
  question: string;
  choices: string[];
  correctAnswerIndex: number;
  explanation: string;
}> = [
  { topic: "rules_of_road", question: "At a four-way stop, who usually goes first if vehicles arrive together?", choices: ["Driver on the right", "Driver on the left", "Largest vehicle", "Fastest vehicle"], correctAnswerIndex: 0, explanation: "When vehicles arrive together, the driver on the right usually goes first." },
  { topic: "rules_of_road", question: "What should you do before entering an intersection on green?", choices: ["Check that it is clear", "Speed up", "Stop forever", "Ignore pedestrians"], correctAnswerIndex: 0, explanation: "Green means go only when the intersection is clear and safe." },
  { topic: "rules_of_road", question: "A solid yellow line on your side usually means:", choices: ["Do not pass", "Pass anytime", "Parking allowed", "Bike lane"], correctAnswerIndex: 0, explanation: "A solid yellow line usually means passing is not allowed on that side." },
  { topic: "safety", question: "Before changing lanes, you should:", choices: ["Signal, check mirrors, check blind spot", "Only check forward", "Move quickly", "Brake hard"], correctAnswerIndex: 0, explanation: "Safe lane changes require signal, mirrors, blind spot, and a safe gap." },
  { topic: "safety", question: "On wet roads, you should:", choices: ["Slow down and increase following distance", "Tailgate", "Turn off headlights", "Brake suddenly"], correctAnswerIndex: 0, explanation: "Wet roads increase stopping distance and reduce traction." },
  { topic: "safety", question: "When an emergency vehicle approaches with lights and siren, you should:", choices: ["Pull over safely and stop", "Keep driving normally", "Follow it", "Stop in the travel lane"], correctAnswerIndex: 0, explanation: "Move right when safe and stop for emergency vehicles." },
  { topic: "parking", question: "Before backing out of a parking space, you should:", choices: ["Look around and back slowly", "Back quickly", "Only honk", "Ignore pedestrians"], correctAnswerIndex: 0, explanation: "Backing requires slow movement and careful observation." },
  { topic: "parking", question: "Parallel parking is mostly about:", choices: ["Control and observation", "Speed", "Music volume", "Ignoring mirrors"], correctAnswerIndex: 0, explanation: "Examiners look for control, observation, and safe final position." },
  { topic: "documents", question: "A common document needed for DMV license applications is:", choices: ["Proof of identity", "Gym card", "Restaurant receipt", "Movie ticket"], correctAnswerIndex: 0, explanation: "DMV applications commonly require identity and residency documents." },
  { topic: "documents", question: "Why check official DMV document lists first?", choices: ["Requirements vary by state", "Documents never matter", "It cancels your test", "It replaces studying"], correctAnswerIndex: 0, explanation: "Document requirements depend on state and transaction type." },
];

function signQuestions(stateCode: string): SeedQuestion[] {
  return signs.flatMap((sign) => [
    {
      id: `${stateCode}-sign-${sign.key}-meaning`,
      topic: "signs",
      question: "What does this road sign mean?",
      choices: [sign.answer, ...sign.wrong],
      correctAnswerIndex: 0,
      explanation: `${sign.label} means: ${sign.answer}.`,
      imageUrl: signImage(sign),
    },
    {
      id: `${stateCode}-sign-${sign.key}-action`,
      topic: "signs",
      question: `In ${stateCode}, what is the safest response to this sign?`,
      choices: [sign.answer, ...sign.wrong],
      correctAnswerIndex: 0,
      explanation: `Drivers should recognize this sign and respond safely: ${sign.answer}.`,
      imageUrl: signImage(sign),
    },
  ]);
}

export function getGeneratedPracticeQuestions(stateCode: string) {
  const generated: SeedQuestion[] = [...signQuestions(stateCode)];

  for (let round = 0; round < 9; round += 1) {
    normalQuestions.forEach((question, index) => {
      generated.push({
        ...question,
        id: `${stateCode}-${question.topic}-${round}-${index}`,
        question:
          round === 0
            ? question.question
            : `${question.question} (${stateCode} scenario ${round + 1})`,
      });
    });
  }

  return generated;
}
