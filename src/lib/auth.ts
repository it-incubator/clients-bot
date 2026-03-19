import { createAuthClient } from './supabase-auth';

export function isManager(email: string | undefined): boolean {
  if (!email) return false;
  const managerEmails = (process.env.MANAGER_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase());
  return managerEmails.includes(email.toLowerCase());
}

export async function getManagerOrThrow(): Promise<{ id: string; email: string }> {
  const supabase = await createAuthClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user || !user.email) {
    throw new Error('Unauthorized');
  }
  if (!isManager(user.email)) {
    throw new Error('Forbidden: not a manager');
  }
  return { id: user.id, email: user.email };
}
