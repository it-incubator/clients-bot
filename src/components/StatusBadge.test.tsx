import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders "New" for new status', () => {
    render(<StatusBadge status="new" />);
    expect(screen.getByText('New')).toBeDefined();
  });

  it('renders "In Progress" for in_progress status', () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByText('In Progress')).toBeDefined();
  });

  it('renders "Waiting" for waiting_customer status', () => {
    render(<StatusBadge status="waiting_customer" />);
    expect(screen.getByText('Waiting Customer')).toBeDefined();
  });

  it('renders "Resolved" for resolved status', () => {
    render(<StatusBadge status="resolved" />);
    expect(screen.getByText('Resolved')).toBeDefined();
  });

  it('renders "Closed" for closed status', () => {
    render(<StatusBadge status="closed" />);
    expect(screen.getByText('Closed')).toBeDefined();
  });
});
