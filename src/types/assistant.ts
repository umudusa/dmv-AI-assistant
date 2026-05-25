export type AssistantAnswer = {
  officialAnswer: string;
  realUserExperience: string;
  practicalTip: string;
  sources?: {
    label: string;
    url: string;
  }[];
};
