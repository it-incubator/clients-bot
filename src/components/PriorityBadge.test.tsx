import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PriorityBadge from './PriorityBadge';

describe('PriorityBadge', () => {
  it('renders "High" for high priority', () => {
    render(<PriorityBadge priority="high" />);
    expect(screen.getByText('High')).toBeDefined();
  });

  it('renders "Medium" for medium priority', () => {
    render(<PriorityBadge priority="medium" />);
    expect(screen.getByText('Medium')).toBeDefined();
  });

  it('renders "Low" for low priority', () => {
    render(<PriorityBadge priority="low" />);
    expect(screen.getByText('Low')).toBeDefined();
  });

  it('renders dash for null priority', () => {
    render(<PriorityBadge priority={null} />);
    expect(screen.getByText('—')).toBeDefined();
  });
});
