import { NextRequest, NextResponse } from "next/server";
import { getManagerOrThrow } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase-server";
import { isValidTransition } from "@/lib/status-transitions";
import { DialogStatus } from "@/lib/types";
import { sendTelegramMessage } from "@/lib/telegram";

const CLOSE_MESSAGES: Record<string, string> = {
  resolved: "✅ Статус обращения: закрыто. Проблема решена. Если возникнут новые вопросы — просто напишите сюда.",
  closed: "Обращение закрыто. Если у вас появятся вопросы — напишите нам снова.",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getManagerOrThrow();
    const { id } = await params;
    const supabase = createServerClient();

    const { data: dialog, error } = await supabase
      .from("dialogs")
      .select("*, user:users(*)")
      .eq("id", id)
      .single();

    if (error || !dialog) {
      return NextResponse.json({ error: "Dialog not found" }, { status: 404 });
    }

    return NextResponse.json(dialog);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" || message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getManagerOrThrow();
    const { id } = await params;
    const supabase = createServerClient();

    const body = await request.json();
    const newStatus = body.status as DialogStatus;

    if (!newStatus) {
      return NextResponse.json({ error: "status is required" }, { status: 400 });
    }

    // Get current dialog to validate transition
    const { data: current, error: fetchError } = await supabase
      .from("dialogs")
      .select("status")
      .eq("id", id)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: "Dialog not found" }, { status: 404 });
    }

    if (!isValidTransition(current.status, newStatus)) {
      return NextResponse.json(
        { error: `Invalid status transition from '${current.status}' to '${newStatus}'` },
        { status: 400 }
      );
    }

    // Reset bot_active when resolving/closing so bot tries again next conversation
    const updateFields: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (newStatus === "resolved" || newStatus === "closed") {
      updateFields.bot_active = true;
    }

    const { data: updated, error: updateError } = await supabase
      .from("dialogs")
      .update(updateFields)
      .eq("id", id)
      .select("*, user:users(*)")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Notify customer in Telegram when dialog is resolved or closed
    if ((newStatus === "resolved" || newStatus === "closed") && updated?.user?.telegram_id) {
      try {
        await sendTelegramMessage(updated.user.telegram_id, CLOSE_MESSAGES[newStatus]);
      } catch (tgErr) {
        console.error("Failed to send close notification to Telegram:", tgErr);
      }
    }

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" || message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
