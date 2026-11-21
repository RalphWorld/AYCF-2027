import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { hasAdminSession } from "@/lib/requireAdmin";

// Create a new announcement. If is_live_banner is true, this one becomes the
// pinned "happening now" banner and all previous banners are un-pinned.
export async function POST(request) {
  if (!(await hasAdminSession(request))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { text, is_live_banner } = await request.json();
  if (!text || !text.trim()) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (is_live_banner) {
    await supabase
      .from("announcements")
      .update({ is_live_banner: false })
      .eq("is_live_banner", true);
  }

  const { data, error } = await supabase
    .from("announcements")
    .insert({ text: text.trim(), is_live_banner: !!is_live_banner })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ announcement: data });
}
