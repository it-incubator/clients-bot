'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Dialog, DialogStatus, Priority } from '@/lib/types';
import { createClient } from '@/lib/supabase-browser';

export interface DialogsFilter {
  status?: DialogStatus | 'all';
  priority?: Priority | 'all';
  botFailed?: boolean;
}

export function useRealtimeDialogs(filters?: DialogsFilter) {
  const [dialogs, setDialogs] = useState<Dialog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDialogs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'all') {
        params.set('status', filters.status);
      }
      if (filters?.priority && filters.priority !== 'all') {
        params.set('priority', filters.priority);
      }
      if (filters?.botFailed) {
        params.set('bot_active', 'false');
      }

      const qs = params.toString();
      const res = await fetch(`/api/dialogs${qs ? `?${qs}` : ''}`);
      if (res.ok) {
        const data: Dialog[] = await res.json();
        setDialogs(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.priority, filters?.botFailed]);

  useEffect(() => {
    setLoading(true);
    fetchDialogs();

    const supabase = createClient();

    const channel = supabase
      .channel('dialogs-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dialogs',
        },
        (payload) => {
          const newDialog = payload.new as Dialog;
          setDialogs((prev) => [newDialog, ...prev]);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'dialogs',
        },
        (payload) => {
          const updated = payload.new as Dialog;
          setDialogs((prev) =>
            prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d)),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDialogs]);

  return { dialogs, loading };
}
