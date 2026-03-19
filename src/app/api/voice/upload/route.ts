import { NextRequest, NextResponse } from "next/server";
import { getManagerOrThrow } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    await getManagerOrThrow();
    const supabase = createServerClient();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "ogg";
    const filename = `manager-voice-${timestamp}.${extension}`;
    const path = `voice-messages/${filename}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("voice-messages")
      .upload(filename, buffer, {
        contentType: file.type || "audio/ogg",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("voice-messages")
      .getPublicUrl(filename);

    return NextResponse.json({ voice_url: urlData.publicUrl }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" || message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
