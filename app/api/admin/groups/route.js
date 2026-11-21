import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { hasAdminSession } from "@/lib/requireAdmin";
import { hashKey } from "@/lib/auth";

// Generates a random 6-digit key for a brand new group.
function randomSixDigitKey() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Add a new group. Generates its 6-digit key, stores the hash, and returns
// the PLAIN key once in this response only — admin must copy it down
// immediately, since it is never shown again.
export async function POST(request) {
  if (!(await hasAdminSession(request))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Group name is required." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({ name: name.trim(), status: "Not started" })
    .select()
    .single();

  if (groupError) {
    return NextResponse.json({ error: groupError.message }, { status: 500 });
  }

  const plainKey = randomSixDigitKey();
  const key_hash = await hashKey(plainKey);

  const { error: keyError } = await supabase
    .from("group_keys")
    .insert({ group_id: group.id, key_hash });

  if (keyError) {
    // Roll back the group row so we don't leave an orphan with no key.
    await supabase.from("groups").delete().eq("id", group.id);
    return NextResponse.json({ error: keyError.message }, { status: 500 });
  }

  return NextResponse.json({ group, plainKey });
}
