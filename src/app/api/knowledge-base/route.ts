import { NextRequest, NextResponse } from "next/server";
import { getManagerOrThrow } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase-server";
import { getOpenAIClient, getEmbeddingModel } from "@/lib/openai";

export async function GET() {
  try {
    await getManagerOrThrow();
    const supabase = createServerClient();

    const { data: articles, error } = await supabase
      .from("knowledge_base")
      .select("id, title, content, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(articles);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" || message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await getManagerOrThrow();
    const supabase = createServerClient();

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "title and content are required" },
        { status: 400 }
      );
    }

    // Generate embedding
    const openai = getOpenAIClient();
    const embeddingResponse = await openai.embeddings.create({
      model: getEmbeddingModel(),
      input: `${title}\n\n${content}`,
    });
    const embedding = embeddingResponse.data[0].embedding;

    const { data: article, error } = await supabase
      .from("knowledge_base")
      .insert({ title, content, embedding })
      .select("id, title, content, created_at, updated_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(article, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" || message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
