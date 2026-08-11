import type { Role } from './types';

/** Mirrors server permission catalog for UI gating. */
export const PERMISSIONS: Record<string, Role[]> = {
  'users:read': ['ADMIN'],
  'users:write': ['ADMIN'],
  'users:role': ['ADMIN'],
  'projects:create': ['ADMIN', 'MANAGER'],
  'projects:read': ['ADMIN', 'MANAGER', 'MEMBER'],
  'projects:update': ['ADMIN', 'MANAGER'],
  'projects:delete': ['ADMIN'],
  'projects:members': ['ADMIN', 'MANAGER'],
  'tasks:create': ['ADMIN', 'MANAGER', 'MEMBER'],
  'tasks:read': ['ADMIN', 'MANAGER', 'MEMBER'],
  'tasks:update': ['ADMIN', 'MANAGER', 'MEMBER'],
  'tasks:delete': ['ADMIN', 'MANAGER'],
};

export function can(role: Role | undefined, permission: string): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] ?? []).includes(role);
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  MEMBER: 'Member',
};
