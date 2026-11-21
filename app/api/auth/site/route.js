import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyKey } from "@/lib/auth";
import { createSessionToken, SITE_COOKIE } from "@/lib/session";

export async function POST(request) {
  const { key } = await request.json();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_config")
    .select("site_key_hash")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Site is not set up yet. Run the initial setup script." },
      { status: 500 }
    );
  }

  const ok = await verifyKey(key, data.site_key_hash);
  if (!ok) {
    return NextResponse.json({ error: "Wrong key." }, { status: 401 });
  }

  const token = await createSessionToken("site");
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SITE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
