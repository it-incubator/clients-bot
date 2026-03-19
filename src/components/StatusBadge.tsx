import type { DialogStatus } from '@/lib/types';

const statusConfig: Record<DialogStatus, { label: string; classes: string }> = {
  new: { label: 'New', classes: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', classes: 'bg-yellow-100 text-yellow-800' },
  waiting_customer: { label: 'Waiting Customer', classes: 'bg-purple-100 text-purple-800' },
  resolved: { label: 'Resolved', classes: 'bg-green-100 text-green-800' },
  closed: { label: 'Closed', classes: 'bg-gray-100 text-gray-800' },
};

interface StatusBadgeProps {
  status: DialogStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
