import { Prisma } from '@prisma/client';

/** Case-insensitive contains filter for PostgreSQL text search. */
export function containsInsensitive(value?: string): Prisma.StringFilter | undefined {
  if (!value?.trim()) return undefined;
  return { contains: value.trim(), mode: 'insensitive' };
}
