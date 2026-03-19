import { NextRequest, NextResponse } from "next/server";
import { getManagerOrThrow } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase-server";
import { getOpenAIClient, getEmbeddingModel } from "@/lib/openai";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getManagerOrThrow();
    const { id } = await params;
    const supabase = createServerClient();

    const { data: article, error } = await supabase
      .from("knowledge_base")
      .select("id, title, content, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error || !article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" || message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getManagerOrThrow();
    const { id } = await params;
    const supabase = createServerClient();

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "title and content are required" },
        { status: 400 }
      );
    }

    // Regenerate embedding
    const openai = getOpenAIClient();
    const embeddingResponse = await openai.embeddings.create({
      model: getEmbeddingModel(),
      input: `${title}\n\n${content}`,
    });
    const embedding = embeddingResponse.data[0].embedding;

    const { data: article, error } = await supabase
      .from("knowledge_base")
      .update({
        title,
        content,
        embedding,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, title, content, created_at, updated_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
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
    await getManagerOrThrow();
    const { id } = await params;
    const supabase = createServerClient();

    const { error } = await supabase
      .from("knowledge_base")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" || message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
