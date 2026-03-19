import { describe, it, expect } from 'vitest';
import { isValidTransition } from './status-transitions';
import type { DialogStatus } from './types';

describe('isValidTransition', () => {
  const validTransitions: [DialogStatus, DialogStatus][] = [
    ['new', 'in_progress'],
    ['in_progress', 'waiting_customer'],
    ['in_progress', 'resolved'],
    ['in_progress', 'closed'],
    ['waiting_customer', 'in_progress'],
    ['waiting_customer', 'resolved'],
    ['waiting_customer', 'closed'],
    ['resolved', 'in_progress'],
    ['closed', 'in_progress'],
  ];

  validTransitions.forEach(([from, to]) => {
    it(`allows ${from} → ${to}`, () => {
      expect(isValidTransition(from, to)).toBe(true);
    });
  });

  const invalidTransitions: [DialogStatus, DialogStatus][] = [
    ['new', 'resolved'],
    ['new', 'closed'],
    ['new', 'waiting_customer'],
    ['new', 'new'],
    ['in_progress', 'new'],
    ['in_progress', 'in_progress'],
    ['waiting_customer', 'new'],
    ['waiting_customer', 'waiting_customer'],
    ['resolved', 'closed'],
    ['resolved', 'new'],
    ['resolved', 'waiting_customer'],
    ['resolved', 'resolved'],
    ['closed', 'new'],
    ['closed', 'resolved'],
    ['closed', 'waiting_customer'],
    ['closed', 'closed'],
  ];

  invalidTransitions.forEach(([from, to]) => {
    it(`rejects ${from} → ${to}`, () => {
      expect(isValidTransition(from, to)).toBe(false);
    });
  });
});
