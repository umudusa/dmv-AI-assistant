import { states } from "@/config/states";

export function getManualSources() {
  return states.map((state) => ({
    id: state.code.toLowerCase(),
    stateCode: state.code,
    title: `${state.name} DMV manual source`,
    url: state.manualPage,
    type: "official_page" as const,
    status: state.manualStatus,
  }));
}
