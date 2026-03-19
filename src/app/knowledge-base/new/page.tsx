'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import KBArticleForm from '@/components/KBArticleForm';

export default function NewKBArticlePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const res = await fetch('/api/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to create article');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      router.push('/knowledge-base');
    },
  });

  return (
    <div className="p-6">
      <KBArticleForm
        onSave={(data) => createMutation.mutateAsync(data)}
        error={createMutation.isError ? createMutation.error.message : undefined}
      />
    </div>
  );
}
