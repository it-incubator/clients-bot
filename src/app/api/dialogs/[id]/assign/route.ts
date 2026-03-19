import { NextRequest, NextResponse } from "next/server";
import { getManagerOrThrow } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase-server";
import { isValidTransition } from "@/lib/status-transitions";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const manager = await getManagerOrThrow();
    const { id } = await params;
    const supabase = createServerClient();

    const { data: dialog, error: fetchError } = await supabase
      .from("dialogs")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !dialog) {
      return NextResponse.json({ error: "Dialog not found" }, { status: 404 });
    }

    if (dialog.assigned_manager_id && dialog.assigned_manager_id !== manager.id) {
      return NextResponse.json(
        { error: "Dialog is already assigned to another manager" },
        { status: 409 }
      );
    }

    const updates: Record<string, unknown> = {
      assigned_manager_id: manager.id,
      updated_at: new Date().toISOString(),
    };

    if (dialog.status === "new" && isValidTransition("new", "in_progress")) {
      updates.status = "in_progress";
    }

    const { data: updated, error: updateError } = await supabase
      .from("dialogs")
      .update(updates)
      .eq("id", id)
      .select("*, user:users(*)")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" || message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const manager = await getManagerOrThrow();
    const { id } = await params;
    const supabase = createServerClient();

    const { data: dialog, error: fetchError } = await supabase
      .from("dialogs")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !dialog) {
      return NextResponse.json({ error: "Dialog not found" }, { status: 404 });
    }

    if (dialog.assigned_manager_id !== manager.id) {
      return NextResponse.json(
        { error: "You are not the assigned manager" },
        { status: 403 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("dialogs")
      .update({
        assigned_manager_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*, user:users(*)")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" || message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
