import type { Dialog } from '@/lib/types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

interface DialogListItemProps {
  dialog: Dialog;
  selected: boolean;
  onClick: () => void;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DialogListItem({
  dialog,
  selected,
  onClick,
}: DialogListItemProps) {
  const userName = dialog.user?.name ?? 'Unknown User';
  const lastMessageText = dialog.last_message?.text ?? '';
  const preview =
    lastMessageText.length > 80
      ? lastMessageText.slice(0, 80) + '...'
      : lastMessageText;
  const summary = dialog.summary ?? null;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
        selected
          ? 'bg-blue-50 border-l-2 border-l-blue-500'
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-gray-900 truncate">
          {userName}
        </span>
        <span className="text-xs text-gray-500 shrink-0 ml-2">
          {timeAgo(dialog.updated_at)}
        </span>
      </div>

      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
        <StatusBadge status={dialog.status} />
        <PriorityBadge priority={dialog.priority} />
        {dialog.bot_active ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            Bot
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
            Bot off
          </span>
        )}
      </div>

      {dialog.assigned_manager_email && (
        <p className="text-xs text-indigo-600 mb-1">
          {dialog.assigned_manager_email}
        </p>
      )}

      {preview && (
        <p className="text-sm text-gray-600 truncate">{preview}</p>
      )}

      {summary && (
        <p className="mt-1 text-xs text-gray-400 italic">
          {summary}
        </p>
      )}
    </button>
  );
}
