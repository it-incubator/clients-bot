import type { Priority } from '@/lib/types';

const priorityConfig: Record<string, { label: string; classes: string }> = {
  high: { label: 'High', classes: 'bg-red-100 text-red-800' },
  medium: { label: 'Medium', classes: 'bg-yellow-100 text-yellow-800' },
  low: { label: 'Low', classes: 'bg-green-100 text-green-800' },
};

interface PriorityBadgeProps {
  priority: Priority | null;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  if (!priority) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
        &mdash;
      </span>
    );
  }

  const config = priorityConfig[priority];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
