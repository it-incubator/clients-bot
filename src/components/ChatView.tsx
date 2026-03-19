'use client';

import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Dialog, DialogStatus, Message } from '@/lib/types';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import MessageBubble from './MessageBubble';
import ReplyInput from './ReplyInput';

interface ChatViewProps {
  dialogId: string;
}

const statusOptions: { value: DialogStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting_customer', label: 'Waiting Customer' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

async function fetchDialog(dialogId: string): Promise<Dialog> {
  const res = await fetch(`/api/dialogs/${dialogId}`);
  if (!res.ok) throw new Error('Failed to fetch dialog');
  return res.json();
}

export default function ChatView({ dialogId }: ChatViewProps) {
  const queryClient = useQueryClient();
  const { messages, loading: messagesLoading } = useRealtimeMessages(dialogId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const dialogQueryKey = ['dialog', dialogId];

  const { data: dialog, isLoading } = useQuery<Dialog>({
    queryKey: dialogQueryKey,
    queryFn: () => fetchDialog(dialogId),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const assignMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/dialogs/${dialogId}/assign`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to assign');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dialogQueryKey });
      queryClient.invalidateQueries({ queryKey: ['dialogs'] });
    },
  });

  const unassignMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/dialogs/${dialogId}/assign`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to unassign');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dialogQueryKey });
      queryClient.invalidateQueries({ queryKey: ['dialogs'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (status: DialogStatus) => {
      const res = await fetch(`/api/dialogs/${dialogId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to change status');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dialogQueryKey });
      queryClient.invalidateQueries({ queryKey: ['dialogs'] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { text?: string; voice_url?: string }) => {
      const res = await fetch(`/api/dialogs/${dialogId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }
      return res.json() as Promise<Message>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dialogQueryKey });
      queryClient.invalidateQueries({ queryKey: ['dialogs'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Loading dialog...
      </div>
    );
  }

  if (!dialog) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Dialog not found.
      </div>
    );
  }

  const isAssigned = !!dialog.assigned_manager_id;
  const isActionPending = assignMutation.isPending || unassignMutation.isPending || statusMutation.isPending;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {dialog.user?.name ?? 'Unknown User'}
            </h2>
            <StatusBadge status={dialog.status} />
            <PriorityBadge priority={dialog.priority} />
          </div>

          <div className="flex items-center gap-2">
            {isAssigned ? (
              <button
                onClick={() => unassignMutation.mutate()}
                disabled={isActionPending}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {unassignMutation.isPending ? 'Unassigning...' : 'Unassign'}
              </button>
            ) : (
              <button
                onClick={() => assignMutation.mutate()}
                disabled={isActionPending}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assignMutation.isPending ? 'Assigning...' : 'Assign to me'}
              </button>
            )}

            <select
              value={dialog.status}
              onChange={(e) => statusMutation.mutate(e.target.value as DialogStatus)}
              disabled={isActionPending}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error display */}
        {(assignMutation.isError || unassignMutation.isError || statusMutation.isError) && (
          <p className="text-sm text-red-600 mb-2">
            {(assignMutation.error || unassignMutation.error || statusMutation.error)?.message}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {dialog.topic && (
            <span>
              <span className="font-medium text-gray-500">Topic:</span>{' '}
              {dialog.topic}
            </span>
          )}
          {dialog.sentiment && (
            <span>
              <span className="font-medium text-gray-500">Sentiment:</span>{' '}
              {dialog.sentiment}
            </span>
          )}
          {dialog.summary && (
            <span>
              <span className="font-medium text-gray-500">Summary:</span>{' '}
              {dialog.summary}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4">
        {messagesLoading ? (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            No messages yet.
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Send error */}
      {sendMessageMutation.isError && (
        <div className="px-4 py-2 bg-red-50 text-sm text-red-600">
          Failed to send: {sendMessageMutation.error.message}
        </div>
      )}

      {/* Reply */}
      <ReplyInput
        onSend={(text) => sendMessageMutation.mutate({ text })}
        onSendVoice={(voiceUrl) => sendMessageMutation.mutate({ voice_url: voiceUrl })}
        disabled={!isAssigned}
        sending={sendMessageMutation.isPending}
      />
    </div>
  );
}
