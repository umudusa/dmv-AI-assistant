export type ManualSource = {
  id: string;
  stateCode: string;
  title: string;
  url: string;
  type: "official_page" | "pdf";
  status: "ready" | "coming_soon" | "needs_review";
};
