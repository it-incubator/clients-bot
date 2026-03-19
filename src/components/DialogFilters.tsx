'use client';

import type { DialogStatus, Priority } from '@/lib/types';

export interface DialogFiltersState {
  status: DialogStatus | 'all';
  priority: Priority | 'all';
  botFailed: boolean;
}

interface DialogFiltersProps {
  filters: DialogFiltersState;
  onFiltersChange: (filters: DialogFiltersState) => void;
}

const statuses: { value: DialogStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting_customer', label: 'Waiting Customer' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const priorities: { value: Priority | 'all'; label: string }[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default function DialogFilters({
  filters,
  onFiltersChange,
}: DialogFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
      <select
        value={filters.status}
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            status: e.target.value as DialogStatus | 'all',
          })
        }
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        value={filters.priority}
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            priority: e.target.value as Priority | 'all',
          })
        }
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {priorities.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={filters.botFailed}
          onChange={(e) =>
            onFiltersChange({ ...filters, botFailed: e.target.checked })
          }
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Bot failed only
      </label>
    </div>
  );
}
