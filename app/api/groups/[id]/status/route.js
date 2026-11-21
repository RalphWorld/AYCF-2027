import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyKey } from "@/lib/auth";

// The status changer tab calls this. Requires that specific group's 6-digit
// key on EVERY call — there is no session for this, by design, so one
// group leader can never update another group's status just by being
// logged into the site.
export async function POST(request, { params }) {
  const { key, status } = await request.json();
  const groupId = params.id;

  if (!key || !status) {
    return NextResponse.json(
      { error: "Key and status are required." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data: keyRow, error: keyError } = await supabase
    .from("group_keys")
    .select("key_hash")
    .eq("group_id", groupId)
    .single();

  if (keyError || !keyRow) {
    return NextResponse.json({ error: "Group not found." }, { status: 404 });
  }

  const ok = await verifyKey(key, keyRow.key_hash);
  if (!ok) {
    return NextResponse.json({ error: "Wrong key for this group." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("groups")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", groupId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ group: data });
}
