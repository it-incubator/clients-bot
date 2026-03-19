'use client';

import type { Dialog } from '@/lib/types';
import DialogListItem from './DialogListItem';

interface DialogListProps {
  dialogs: Dialog[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export default function DialogList({
  dialogs,
  selectedId,
  onSelect,
}: DialogListProps) {
  if (dialogs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-gray-500 text-sm">
        No dialogs found.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {dialogs.map((dialog) => (
        <DialogListItem
          key={dialog.id}
          dialog={dialog}
          selected={dialog.id === selectedId}
          onClick={() => onSelect(dialog.id)}
        />
      ))}
    </div>
  );
}
