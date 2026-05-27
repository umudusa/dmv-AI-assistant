import { createClient } from "@supabase/supabase-js";

function normalizeSupabaseUrl(url?: string) {
  if (!url) {
    return undefined;
  }

  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);
    return parsed.origin;
  } catch {
    return trimmed.replace(/\/rest\/v1\/?$/, "");
  }
}

const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export function getSupabaseDebugInfo() {
  return {
    hasSupabaseUrl: Boolean(supabaseUrl),
    supabaseUrlHost: supabaseUrl ? new URL(supabaseUrl).host : null,
    hasAnonKey: Boolean(supabaseAnonKey),
    hasServiceRole: Boolean(supabaseServiceRoleKey),
    serviceRoleStartsWithEyJ:
      supabaseServiceRoleKey?.startsWith("eyJ") ?? false,
  };
}

export function hasSupabasePublicConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function hasSupabaseAdminConfig() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

export function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export function createSupabaseAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
