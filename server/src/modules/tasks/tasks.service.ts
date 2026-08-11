import { Prisma, Role, TaskPriority, TaskStatus } from '@prisma/client';
import { AuthUser } from '../../middleware/auth';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { containsInsensitive } from '../../lib/search';
import {
  assertCanAccessProject,
  assertCanManageProject,
  assertCanModifyTask,
  taskVisibilityWhere,
} from '../../rbac/access';

const taskInclude = {
  project: { select: { id: true, name: true, managerId: true } },
  assignee: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true, email: true } },
} as const;

export async function listTasks(
  user: AuthUser,
  params: {
    page: number;
    limit: number;
    skip: number;
    search?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    projectId?: string;
    assigneeId?: string;
  }
) {
  if (params.projectId) {
    await assertCanAccessProject(user, params.projectId);
  }

  const search = containsInsensitive(params.search);
  const where: Prisma.TaskWhereInput = {
    AND: [
      taskVisibilityWhere(user),
      params.projectId ? { projectId: params.projectId } : {},
      params.status ? { status: params.status } : {},
      params.priority ? { priority: params.priority } : {},
      params.assigneeId ? { assigneeId: params.assigneeId } : {},
      search
        ? {
            OR: [{ title: search }, { description: search }],
          }
        : {},
    ],
  };

  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
      skip: params.skip,
      take: params.limit,
    }),
  ]);

  return { total, tasks };
}

export async function getTask(user: AuthUser, id: string) {
  const task = await prisma.task.findUnique({ where: { id }, include: taskInclude });
  if (!task) throw new AppError(404, 'Task not found');
  await assertCanAccessProject(user, task.projectId);
  return task;
}

export async function createTask(
  user: AuthUser,
  data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
    projectId: string;
    assigneeId?: string | null;
  }
) {
  await assertCanAccessProject(user, data.projectId);

  // Members may only assign tasks to themselves
  let assigneeId = data.assigneeId ?? null;
  if (user.role === Role.MEMBER) {
    assigneeId = user.id;
  }

  if (assigneeId) {
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: data.projectId, userId: assigneeId } },
    });
    if (!membership) {
      throw new AppError(400, 'Assignee must be a member of the project');
    }
  }

  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      projectId: data.projectId,
      assigneeId,
      createdById: user.id,
    },
    include: taskInclude,
  });
}

export async function updateTask(
  user: AuthUser,
  id: string,
  data: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
    assigneeId?: string | null;
  }
) {
  const existing = await assertCanModifyTask(user, id);

  if (data.assigneeId !== undefined && user.role === Role.MEMBER && data.assigneeId !== user.id) {
    throw new AppError(403, 'Members cannot reassign tasks to others');
  }

  if (data.assigneeId) {
    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId: existing.projectId, userId: data.assigneeId },
      },
    });
    if (!membership) {
      throw new AppError(400, 'Assignee must be a member of the project');
    }
  }

  return prisma.task.update({
    where: { id },
    data: {
      ...data,
      dueDate:
        data.dueDate === undefined
          ? undefined
          : data.dueDate
            ? new Date(data.dueDate)
            : null,
    },
    include: taskInclude,
  });
}

export async function deleteTask(user: AuthUser, id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new AppError(404, 'Task not found');

  if (user.role === Role.ADMIN) {
    await prisma.task.delete({ where: { id } });
    return;
  }

  await assertCanManageProject(user, task.projectId);
  await prisma.task.delete({ where: { id } });
}
