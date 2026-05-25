export type ExperienceTopic =
  | "road_test"
  | "parking"
  | "permit_test"
  | "documents"
  | "general";

export type ExperienceSourceType =
  | "user_submitted"
  | "public_web"
  | "reddit_like";

export type ExperiencePost = {
  id: string;
  title: string;
  body: string;
  stateCode: string;
  city?: string;
  dmvLocation?: string;
  topic: ExperienceTopic;
  sourceType: ExperienceSourceType;
  upvotes: number;
  createdAt: string;
};
