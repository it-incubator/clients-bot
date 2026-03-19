import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isManager } from './auth';

describe('isManager', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns false for undefined email', () => {
    vi.stubEnv('MANAGER_EMAILS', 'admin@test.com');
    expect(isManager(undefined)).toBe(false);
  });

  it('returns false for empty email', () => {
    vi.stubEnv('MANAGER_EMAILS', 'admin@test.com');
    expect(isManager('')).toBe(false);
  });

  it('returns true for matching email', () => {
    vi.stubEnv('MANAGER_EMAILS', 'admin@test.com,support@test.com');
    expect(isManager('admin@test.com')).toBe(true);
  });

  it('returns true case-insensitively', () => {
    vi.stubEnv('MANAGER_EMAILS', 'Admin@Test.com');
    expect(isManager('admin@test.com')).toBe(true);
  });

  it('returns false for non-manager email', () => {
    vi.stubEnv('MANAGER_EMAILS', 'admin@test.com');
    expect(isManager('user@test.com')).toBe(false);
  });

  it('handles spaces in MANAGER_EMAILS', () => {
    vi.stubEnv('MANAGER_EMAILS', 'admin@test.com , support@test.com');
    expect(isManager('support@test.com')).toBe(true);
  });

  it('returns false when MANAGER_EMAILS is empty', () => {
    vi.stubEnv('MANAGER_EMAILS', '');
    expect(isManager('admin@test.com')).toBe(false);
  });

  it('returns false when MANAGER_EMAILS is not set', () => {
    delete process.env.MANAGER_EMAILS;
    expect(isManager('admin@test.com')).toBe(false);
  });
});
