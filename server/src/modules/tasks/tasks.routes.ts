import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { buildMeta, getPagination, sendSuccess } from '../../lib/http';
import {
  taskCreateSchema,
  taskQuerySchema,
  taskUpdateSchema,
} from '../../validators/schemas';
import * as tasksService from './tasks.service';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission('tasks:read'),
  validate(taskQuerySchema, 'query'),
  async (req, res, next) => {
    try {
      const q = req.query as {
        page?: number;
        limit?: number;
        search?: string;
        status?: never;
        priority?: never;
        projectId?: string;
        assigneeId?: string;
      };
      const { page, limit, skip } = getPagination(q);
      const { total, tasks } = await tasksService.listTasks(req.user!, {
        page,
        limit,
        skip,
        search: q.search,
        status: q.status,
        priority: q.priority,
        projectId: q.projectId,
        assigneeId: q.assigneeId,
      });
      sendSuccess(res, tasks, 200, buildMeta(total, page, limit));
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id', requirePermission('tasks:read'), async (req, res, next) => {
  try {
    const task = await tasksService.getTask(req.user!, req.params.id);
    sendSuccess(res, task);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  requirePermission('tasks:create'),
  validate(taskCreateSchema),
  async (req, res, next) => {
    try {
      const task = await tasksService.createTask(req.user!, req.body);
      sendSuccess(res, task, 201);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id',
  requirePermission('tasks:update'),
  validate(taskUpdateSchema),
  async (req, res, next) => {
    try {
      const task = await tasksService.updateTask(req.user!, req.params.id, req.body);
      sendSuccess(res, task);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id', requirePermission('tasks:delete'), async (req, res, next) => {
  try {
    await tasksService.deleteTask(req.user!, req.params.id);
    sendSuccess(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

export default router;
