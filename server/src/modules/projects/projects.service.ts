import { Prisma, ProjectStatus, Role } from '@prisma/client';
import { AuthUser } from '../../middleware/auth';
import { AppError, assertFound } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { containsInsensitive } from '../../lib/search';
import {
  assertCanAccessProject,
  assertCanManageProject,
  projectVisibilityWhere,
} from '../../rbac/access';

const projectInclude = {
  manager: { select: { id: true, name: true, email: true, role: true } },
  members: {
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  },
  _count: { select: { tasks: true } },
} as const;

export async function listProjects(
  user: AuthUser,
  params: {
    page: number;
    limit: number;
    skip: number;
    search?: string;
    status?: ProjectStatus;
  }
) {
  const search = containsInsensitive(params.search);
  const where: Prisma.ProjectWhereInput = {
    AND: [
      projectVisibilityWhere(user),
      params.status ? { status: params.status } : {},
      search
        ? {
            OR: [{ name: search }, { description: search }],
          }
        : {},
    ],
  };

  const [total, projects] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      include: projectInclude,
      orderBy: { updatedAt: 'desc' },
      skip: params.skip,
      take: params.limit,
    }),
  ]);

  return { total, projects };
}

export async function getProject(user: AuthUser, id: string) {
  await assertCanAccessProject(user, id);
  return assertFound(
    await prisma.project.findUnique({ where: { id }, include: projectInclude }),
    'Project not found'
  );
}

export async function createProject(
  user: AuthUser,
  data: {
    name: string;
    description?: string;
    status?: ProjectStatus;
    memberIds?: string[];
  }
) {
  if (user.role === Role.MEMBER) {
    throw new AppError(403, 'Members cannot create projects');
  }

  const memberIds = Array.from(new Set([...(data.memberIds ?? []), user.id]));

  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      status: data.status,
      managerId: user.id,
      members: {
        create: memberIds.map((userId) => ({ userId })),
      },
    },
    include: projectInclude,
  });
}

export async function updateProject(
  user: AuthUser,
  id: string,
  data: {
    name?: string;
    description?: string;
    status?: ProjectStatus;
    managerId?: string;
    memberIds?: string[];
  }
) {
  await assertCanManageProject(user, id);

  if (data.managerId && user.role !== Role.ADMIN) {
    throw new AppError(403, 'Only admins can reassign project managers');
  }

  const { memberIds, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    if (memberIds) {
      await tx.projectMember.deleteMany({ where: { projectId: id } });
      const unique = Array.from(new Set(memberIds));
      if (unique.length) {
        await tx.projectMember.createMany({
          data: unique.map((userId) => ({ projectId: id, userId })),
        });
      }
    }

    return tx.project.update({
      where: { id },
      data: rest,
      include: projectInclude,
    });
  });
}

export async function deleteProject(user: AuthUser, id: string) {
  if (user.role !== Role.ADMIN) {
    throw new AppError(403, 'Only admins can delete projects');
  }
  await assertFound(await prisma.project.findUnique({ where: { id } }), 'Project not found');
  await prisma.project.delete({ where: { id } });
}

export async function addMember(user: AuthUser, projectId: string, userId: string) {
  await assertCanManageProject(user, projectId);
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || !target.isActive) throw new AppError(404, 'User not found');

  try {
    await prisma.projectMember.create({ data: { projectId, userId } });
  } catch {
    throw new AppError(409, 'User is already a project member');
  }

  return getProject(user, projectId);
}

export async function removeMember(user: AuthUser, projectId: string, userId: string) {
  const project = await assertCanManageProject(user, projectId);
  if (project.managerId === userId) {
    throw new AppError(400, 'Cannot remove the project manager from members');
  }

  await prisma.projectMember.deleteMany({ where: { projectId, userId } });
  return getProject(user, projectId);
}
