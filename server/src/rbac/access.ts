import { Role } from '@prisma/client';
import { AuthUser } from '../middleware/auth';
import { AppError } from '../lib/errors';
import { prisma } from '../lib/prisma';

/** Resource-level access checks used by services (role + ownership). */
export async function assertCanAccessProject(user: AuthUser, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: { select: { userId: true } } },
  });

  if (!project) throw new AppError(404, 'Project not found');

  if (user.role === Role.ADMIN) return project;
  if (user.role === Role.MANAGER && project.managerId === user.id) return project;

  const isMember = project.members.some((m) => m.userId === user.id);
  if (user.role === Role.MEMBER && isMember) return project;

  // Managers may view projects they are members of as well
  if (user.role === Role.MANAGER && isMember) return project;

  throw new AppError(403, 'You do not have access to this project');
}

export async function assertCanManageProject(user: AuthUser, projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError(404, 'Project not found');

  if (user.role === Role.ADMIN) return project;
  if (user.role === Role.MANAGER && project.managerId === user.id) return project;

  throw new AppError(403, 'Only the project manager or an admin can manage this project');
}

export async function assertCanModifyTask(user: AuthUser, taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { include: { members: true } } },
  });
  if (!task) throw new AppError(404, 'Task not found');

  if (user.role === Role.ADMIN) return task;
  if (user.role === Role.MANAGER && task.project.managerId === user.id) return task;

  // Members can update tasks assigned to them or created by them
  if (
    user.role === Role.MEMBER &&
    (task.assigneeId === user.id || task.createdById === user.id)
  ) {
    return task;
  }

  throw new AppError(403, 'You cannot modify this task');
}

/** Prisma where-clause helper for listing projects visible to a user. */
export function projectVisibilityWhere(user: AuthUser) {
  if (user.role === Role.ADMIN) return {};
  if (user.role === Role.MANAGER) {
    return {
      OR: [{ managerId: user.id }, { members: { some: { userId: user.id } } }],
    };
  }
  return { members: { some: { userId: user.id } } };
}

export function taskVisibilityWhere(user: AuthUser) {
  if (user.role === Role.ADMIN) return {};
  if (user.role === Role.MANAGER) {
    return {
      project: {
        OR: [{ managerId: user.id }, { members: { some: { userId: user.id } } }],
      },
    };
  }
  return {
    OR: [
      { assigneeId: user.id },
      { createdById: user.id },
      { project: { members: { some: { userId: user.id } } } },
    ],
  };
}
