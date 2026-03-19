'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { KBArticle } from '@/lib/types';
import KBArticleForm from '@/components/KBArticleForm';

export default function EditKBArticlePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const articleId = params.id;

  const { data: article, isLoading } = useQuery<KBArticle>({
    queryKey: ['knowledge-base', articleId],
    queryFn: async () => {
      const res = await fetch(`/api/knowledge-base/${articleId}`);
      if (!res.ok) throw new Error('Failed to fetch article');
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const res = await fetch(`/api/knowledge-base/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update article');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      router.push('/knowledge-base');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/knowledge-base/${articleId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete article');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      router.push('/knowledge-base');
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400 text-sm">
        Loading article...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500 text-sm">
        Article not found.
      </div>
    );
  }

  return (
    <div className="p-6">
      <KBArticleForm
        article={article}
        onSave={(data) => updateMutation.mutateAsync(data)}
        onDelete={() => deleteMutation.mutateAsync()}
        error={
          updateMutation.isError
            ? updateMutation.error.message
            : deleteMutation.isError
              ? deleteMutation.error.message
              : undefined
        }
      />
    </div>
  );
}
