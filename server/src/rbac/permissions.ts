import { Role } from '@prisma/client';

/**
 * Permission catalog — single source of truth for RBAC.
 * Add a permission here, then gate routes with requirePermission('...').
 */
export const PERMISSIONS = {
  'users:read': [Role.ADMIN],
  'users:write': [Role.ADMIN],
  'users:role': [Role.ADMIN],

  'projects:create': [Role.ADMIN, Role.MANAGER],
  'projects:read': [Role.ADMIN, Role.MANAGER, Role.MEMBER],
  'projects:update': [Role.ADMIN, Role.MANAGER],
  'projects:delete': [Role.ADMIN],
  'projects:members': [Role.ADMIN, Role.MANAGER],

  'tasks:create': [Role.ADMIN, Role.MANAGER, Role.MEMBER],
  'tasks:read': [Role.ADMIN, Role.MANAGER, Role.MEMBER],
  'tasks:update': [Role.ADMIN, Role.MANAGER, Role.MEMBER],
  'tasks:delete': [Role.ADMIN, Role.MANAGER],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}
