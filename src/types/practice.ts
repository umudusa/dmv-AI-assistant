export type PracticeMode =
  | "real_exam"
  | "road_signs"
  | "mistake_review";

export type PracticeTopic =
  | "rules_of_road"
  | "signs"
  | "parking"
  | "safety"
  | "documents"
  | "mixed";

export type PracticeQuestion = {
  id: string;
  stateCode: string;
  mode: PracticeMode;
  topic: PracticeTopic;
  question: string;
  choices: string[];
  correctAnswerIndex: number;
  explanation: string;
  imageUrl?: string;
};

