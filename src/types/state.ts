export type ManualStatus = "ready" | "coming_soon" | "needs_review";

export type StateConfig = {
  name: string;
  code: string;
  enabled: boolean;
  manualStatus: ManualStatus;
  dmvWebsite: string;
  manualPage: string;
  manualPdfUrl?: string;
};
