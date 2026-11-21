import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { hasAdminSession } from "@/lib/requireAdmin";
import { hashKey } from "@/lib/auth";

// Admin can: delete a group, manually override its status, or rotate its
// 6-digit key (returns the new plain key once).
export async function DELETE(request, { params }) {
  if (!(await hasAdminSession(request))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("groups").delete().eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(request, { params }) {
  if (!(await hasAdminSession(request))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json();
  const supabase = getSupabaseAdmin();

  // Rotate this group's key.
  if (body.action === "rotate_key") {
    const plainKey = String(Math.floor(100000 + Math.random() * 900000));
    const key_hash = await hashKey(plainKey);
    const { error } = await supabase
      .from("group_keys")
      .update({ key_hash })
      .eq("group_id", params.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, plainKey });
  }

  // Manually override this group's status.
  if (body.status) {
    const { data, error } = await supabase
      .from("groups")
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ group: data });
  }

  return NextResponse.json({ error: "No action specified." }, { status: 400 });
}
