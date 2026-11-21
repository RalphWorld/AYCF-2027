import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { hashKey } from "@/lib/auth";

// One-time setup, done from the browser instead of a local script.
// Refuses to run again once site_config already has a row — so this can't
// be used to silently reset keys later (use the Admin tab's key rotation
// for that instead).
export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("site_config")
    .select("id")
    .eq("id", 1)
    .maybeSingle();

  return NextResponse.json({ alreadySetUp: !!data });
}

export async function POST(request) {
  const { siteKey, adminKey } = await request.json();
  if (!siteKey || !adminKey) {
    return NextResponse.json(
      { error: "Both a site key and an admin key are required." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("site_config")
    .select("id")
    .eq("id", 1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Already set up. Use the Admin tab to change keys from now on." },
      { status: 409 }
    );
  }

  const site_key_hash = await hashKey(siteKey);
  const admin_key_hash = await hashKey(adminKey);

  const { error } = await supabase
    .from("site_config")
    .insert({ id: 1, site_key_hash, admin_key_hash });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
