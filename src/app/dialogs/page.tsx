'use client';

import { useState } from 'react';
import { useRealtimeDialogs } from '@/hooks/useRealtimeDialogs';
import DialogFilters, {
  type DialogFiltersState,
} from '@/components/DialogFilters';
import DialogList from '@/components/DialogList';
import ChatView from '@/components/ChatView';

export default function DialogsPage() {
  const [filters, setFilters] = useState<DialogFiltersState>({
    status: 'all',
    priority: 'all',
    botFailed: false,
  });

  const [selectedId, setSelectedId] = useState<string | undefined>();

  const { dialogs, loading } = useRealtimeDialogs({
    status: filters.status,
    priority: filters.priority,
    botFailed: filters.botFailed,
  });

  return (
    <div className="flex h-full flex-col">
      <DialogFilters filters={filters} onFiltersChange={setFilters} />

      <div className="flex flex-1 overflow-hidden">
        {/* Dialog list - 1/3 width */}
        <div className="w-1/3 border-r border-gray-200 bg-white overflow-hidden">
          {loading ? (
            <div className="flex h-full items-center justify-center text-gray-400 text-sm">
              Loading dialogs...
            </div>
          ) : (
            <DialogList
              dialogs={dialogs}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
        </div>

        {/* Chat view - 2/3 width */}
        <div className="flex-1 overflow-hidden">
          {selectedId ? (
            <ChatView key={selectedId} dialogId={selectedId} />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400 text-sm">
              Select a dialog to view the conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
