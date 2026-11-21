import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { hasAdminSession } from "@/lib/requireAdmin";
import { hashKey } from "@/lib/auth";

// Rotate the site-wide key and/or the admin key itself.
// Body: { siteKey?: "new site key", adminKey?: "new admin key" }
export async function POST(request) {
  if (!(await hasAdminSession(request))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { siteKey, adminKey } = await request.json();
  if (!siteKey && !adminKey) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const update = {};
  if (siteKey) update.site_key_hash = await hashKey(siteKey);
  if (adminKey) update.admin_key_hash = await hashKey(adminKey);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("site_config")
    .update(update)
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
