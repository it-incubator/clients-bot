import { DialogStatus } from './types';

const ALLOWED_TRANSITIONS: Record<DialogStatus, DialogStatus[]> = {
  new: ['in_progress'],
  in_progress: ['waiting_customer', 'resolved', 'closed'],
  waiting_customer: ['in_progress', 'resolved', 'closed'],
  resolved: ['in_progress'],
  closed: ['in_progress'],
};

export function isValidTransition(from: DialogStatus, to: DialogStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
