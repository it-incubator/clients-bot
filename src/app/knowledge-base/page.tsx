'use client';

import { useQuery } from '@tanstack/react-query';
import type { KBArticle } from '@/lib/types';
import KBArticleList from '@/components/KBArticleList';

export default function KnowledgeBasePage() {
  const { data: articles, isLoading } = useQuery<KBArticle[]>({
    queryKey: ['knowledge-base'],
    queryFn: async () => {
      const res = await fetch('/api/knowledge-base');
      if (!res.ok) throw new Error('Failed to fetch articles');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400 text-sm">
        Loading articles...
      </div>
    );
  }

  return (
    <div className="p-6">
      <KBArticleList articles={articles ?? []} />
    </div>
  );
}
