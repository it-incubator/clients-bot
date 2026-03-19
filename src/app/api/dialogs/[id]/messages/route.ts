import { NextRequest, NextResponse } from "next/server";
import { getManagerOrThrow } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase-server";
import { sendTelegramMessage, sendTelegramVoice } from "@/lib/telegram";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getManagerOrThrow();
    const { id } = await params;
    const supabase = createServerClient();

    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("dialog_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(messages);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" || message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const manager = await getManagerOrThrow();
    const { id } = await params;
    const supabase = createServerClient();

    const body = await request.json();
    const { text, voice_url } = body;

    if (!text && !voice_url) {
      return NextResponse.json(
        { error: "Either text or voice_url is required" },
        { status: 400 }
      );
    }

    // Get dialog with user info
    const { data: dialog, error: dialogError } = await supabase
      .from("dialogs")
      .select("*, user:users(*)")
      .eq("id", id)
      .single();

    if (dialogError || !dialog) {
      return NextResponse.json({ error: "Dialog not found" }, { status: 404 });
    }

    if (dialog.assigned_manager_id !== manager.id) {
      return NextResponse.json(
        { error: "You are not the assigned manager for this dialog" },
        { status: 403 }
      );
    }

    // Insert message
    const { data: message, error: insertError } = await supabase
      .from("messages")
      .insert({
        dialog_id: id,
        sender_type: "manager",
        sender_id: manager.id,
        text: text ?? null,
        voice_url: voice_url ?? null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Send to customer via Telegram
    const telegramId = dialog.user?.telegram_id;
    if (telegramId) {
      if (voice_url) {
        await sendTelegramVoice(telegramId, voice_url);
      } else if (text) {
        await sendTelegramMessage(telegramId, text);
      }
    }

    // Update dialog status and timestamp
    await supabase
      .from("dialogs")
      .update({
        status: "waiting_customer",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json(message, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" || message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
