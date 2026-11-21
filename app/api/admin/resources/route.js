import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { hasAdminSession } from "@/lib/requireAdmin";

export async function POST(request) {
  if (!(await hasAdminSession(request))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { title, url, category } = await request.json();
  if (!title || !url) {
    return NextResponse.json(
      { error: "Title and URL are required." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("resources")
    .insert({
      title: title.trim(),
      url: url.trim(),
      category: (category || "General").trim(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ resource: data });
}
