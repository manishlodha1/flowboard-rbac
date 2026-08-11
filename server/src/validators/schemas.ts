import { z } from 'zod';
import { ProjectStatus, Role, TaskPriority, TaskStatus } from '@prisma/client';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(72),
  role: z.nativeEnum(Role).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  search: z.string().optional(),
});

export const projectCreateSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  memberIds: z.array(z.string()).optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial().extend({
  managerId: z.string().optional(),
});

export const projectQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(ProjectStatus).optional(),
});

export const memberSchema = z.object({
  userId: z.string().min(1),
});

export const taskCreateSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().max(4000).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  projectId: z.string().min(1),
  assigneeId: z.string().optional().nullable(),
});

export const taskUpdateSchema = taskCreateSchema.partial().omit({ projectId: true });

export const taskQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  projectId: z.string().optional(),
  assigneeId: z.string().optional(),
});

export const userQuerySchema = paginationSchema.extend({
  role: z.nativeEnum(Role).optional(),
});
