import OpenAI from 'openai';

export function getOpenAIClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}

export function getModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

export function getEmbeddingModel(): string {
  return process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
}
