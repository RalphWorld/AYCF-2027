import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyKey } from "@/lib/auth";
import { createSessionToken, verifySessionToken, ADMIN_COOKIE } from "@/lib/session";

// Lets the admin page check, on load, whether it's already unlocked this
// session — so re-visiting /admin doesn't always re-prompt for the key.
export async function GET(request) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const valid = await verifySessionToken(token, "admin");
  return NextResponse.json({ unlocked: valid });
}

export async function POST(request) {
  const { key } = await request.json();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_config")
    .select("admin_key_hash")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Site is not set up yet." },
      { status: 500 }
    );
  }

  const ok = await verifyKey(key, data.admin_key_hash);
  if (!ok) {
    return NextResponse.json({ error: "Wrong admin key." }, { status: 401 });
  }

  const token = await createSessionToken("admin");
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
