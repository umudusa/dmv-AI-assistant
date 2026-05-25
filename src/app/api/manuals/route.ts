import { NextResponse } from "next/server";
import { getManualSources } from "@/lib/manual-service";

export async function GET() {
  return NextResponse.json({ manuals: getManualSources() });
}
