import { Prisma, Role } from '@prisma/client';
import { assertFound } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { containsInsensitive } from '../../lib/search';
import { publicUserSelect } from '../auth/auth.service';

export async function listUsers(params: {
  page: number;
  limit: number;
  skip: number;
  search?: string;
  role?: Role;
}) {
  const search = containsInsensitive(params.search);
  const where: Prisma.UserWhereInput = {
    ...(params.role ? { role: params.role } : {}),
    ...(search
      ? {
          OR: [{ name: search }, { email: search }],
        }
      : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: publicUserSelect,
      orderBy: { createdAt: 'desc' },
      skip: params.skip,
      take: params.limit,
    }),
  ]);

  return { total, users };
}

export async function getUser(id: string) {
  return assertFound(
    await prisma.user.findUnique({ where: { id }, select: publicUserSelect }),
    'User not found'
  );
}

export async function updateUser(
  id: string,
  data: { name?: string; role?: Role; isActive?: boolean }
) {
  await getUser(id);
  return prisma.user.update({
    where: { id },
    data,
    select: publicUserSelect,
  });
}

export async function listAssignableUsers() {
  return prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  });
}
