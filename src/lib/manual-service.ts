import { states, getStateByCode } from "@/config/states";
import { createSupabaseAdminClient } from "@/lib/supabase";

type OfficialSourceRecord = {
  source_type: string;
  title: string;
  url: string;
  status: string;
};

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

export async function getOfficialSourcesForState(stateCode: string | null) {
  if (!stateCode) {
    return [];
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    const state = getStateByCode(stateCode);

    if (!state) {
      return [];
    }

    return [
      {
        source_type: "dmv_website",
        title: `${state.name} official DMV website`,
        url: state.dmvWebsite,
        status: state.manualStatus,
      },
      {
        source_type: "manual_page",
        title: `${state.name} driver manual page`,
        url: state.manualPage,
        status: state.manualStatus,
      },
    ];
  }

  const { data, error } = await supabase
    .from("official_sources")
    .select("source_type,title,url,status")
    .eq("state_code", stateCode.toUpperCase())
    .in("source_type", ["dmv_website", "manual_page", "manual_pdf"])
    .order("source_type", { ascending: true });

  if (error || !data?.length) {
    const state = getStateByCode(stateCode);

    if (!state) {
      return [];
    }

    return [
      {
        source_type: "dmv_website",
        title: `${state.name} official DMV website`,
        url: state.dmvWebsite,
        status: state.manualStatus,
      },
      {
        source_type: "manual_page",
        title: `${state.name} driver manual page`,
        url: state.manualPage,
        status: state.manualStatus,
      },
    ];
  }

  return data as OfficialSourceRecord[];
}

export function formatOfficialSourcesMessage({
  stateName,
  sources,
}: {
  stateName: string;
  sources: OfficialSourceRecord[];
}) {
  const website = sources.find((source) => source.source_type === "dmv_website");
  const manual = sources.find((source) => source.source_type === "manual_page");
  const pdf = sources.find((source) => source.source_type === "manual_pdf");

  const lines = [`Here are the official ${stateName} DMV links:`];

  if (website) {
    lines.push(`Official DMV website: ${website.url}`);
  }

  if (manual) {
    lines.push(`Driver manual / handbook page: ${manual.url}`);
  }

  if (pdf) {
    lines.push(`Driver manual PDF: ${pdf.url}`);
  }

  lines.push("Use these official links for final verification.");

  return lines.join("\n\n");
}
