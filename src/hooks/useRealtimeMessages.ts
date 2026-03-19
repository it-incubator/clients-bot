'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Message } from '@/lib/types';
import { createClient } from '@/lib/supabase-browser';

export function useRealtimeMessages(dialogId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/dialogs/${dialogId}/messages`);
      if (res.ok) {
        const data: Message[] = await res.json();
        setMessages(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [dialogId]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    fetchMessages();

    const supabase = createClient();

    const channel = supabase
      .channel(`messages:${dialogId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `dialog_id=eq.${dialogId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dialogId, fetchMessages]);

  return { messages, loading };
}
