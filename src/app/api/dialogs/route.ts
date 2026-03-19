import { NextRequest, NextResponse } from "next/server";
import { getManagerOrThrow } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    await getManagerOrThrow();
    const supabase = createServerClient();

    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const managerId = searchParams.get("manager_id");
    const botActive = searchParams.get("bot_active");

    let query = supabase
      .from("dialogs")
      .select("*, user:users(*)")
      .order("updated_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }
    if (priority) {
      query = query.eq("priority", priority);
    }
    if (managerId) {
      query = query.eq("assigned_manager_id", managerId);
    }
    if (botActive !== null && botActive !== undefined) {
      query = query.eq("bot_active", botActive === "true");
    }

    const { data: dialogs, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch last message for each dialog
    const dialogIds = (dialogs ?? []).map((d) => d.id);

    let lastMessages: Record<string, unknown> = {};
    if (dialogIds.length > 0) {
      const { data: messages, error: msgError } = await supabase
        .from("messages")
        .select("*")
        .in("dialog_id", dialogIds)
        .order("created_at", { ascending: false });

      if (!msgError && messages) {
        for (const msg of messages) {
          if (!lastMessages[msg.dialog_id]) {
            lastMessages[msg.dialog_id] = msg;
          }
        }
      }
    }

    // Fetch manager emails for assigned dialogs
    const managerIds = [...new Set(
      (dialogs ?? [])
        .map((d) => d.assigned_manager_id)
        .filter(Boolean) as string[]
    )];

    const managerEmails: Record<string, string> = {};
    for (const managerId of managerIds) {
      const { data: userData } = await supabase.auth.admin.getUserById(managerId);
      if (userData?.user?.email) {
        managerEmails[managerId] = userData.user.email;
      }
    }

    const result = (dialogs ?? []).map((dialog) => ({
      ...dialog,
      last_message: lastMessages[dialog.id] ?? null,
      assigned_manager_email: dialog.assigned_manager_id
        ? managerEmails[dialog.assigned_manager_id] ?? null
        : null,
    }));

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" || message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
