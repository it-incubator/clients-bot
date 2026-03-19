import { NextResponse } from "next/server";
import { getManagerOrThrow } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase-server";
import { getOpenAIClient, getEmbeddingModel } from "@/lib/openai";

export async function POST() {
  try {
    await getManagerOrThrow();
    const supabase = createServerClient();
    const openai = getOpenAIClient();
    const model = getEmbeddingModel();

    const { data: articles, error } = await supabase
      .from("knowledge_base")
      .select("id, title, content");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({ reindexed: 0 });
    }

    let reindexed = 0;

    for (const article of articles) {
      const embeddingResponse = await openai.embeddings.create({
        model,
        input: `${article.title}\n\n${article.content}`,
      });
      const embedding = embeddingResponse.data[0].embedding;

      const { error: updateError } = await supabase
        .from("knowledge_base")
        .update({ embedding, updated_at: new Date().toISOString() })
        .eq("id", article.id);

      if (!updateError) {
        reindexed++;
      }
    }

    return NextResponse.json({ reindexed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" || message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
