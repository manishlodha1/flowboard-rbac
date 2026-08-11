import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { buildMeta, getPagination, sendSuccess } from '../../lib/http';
import {
  memberSchema,
  projectCreateSchema,
  projectQuerySchema,
  projectUpdateSchema,
} from '../../validators/schemas';
import * as projectsService from './projects.service';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission('projects:read'),
  validate(projectQuerySchema, 'query'),
  async (req, res, next) => {
    try {
      const q = req.query as {
        page?: number;
        limit?: number;
        search?: string;
        status?: never;
      };
      const { page, limit, skip } = getPagination(q);
      const { total, projects } = await projectsService.listProjects(req.user!, {
        page,
        limit,
        skip,
        search: q.search,
        status: q.status,
      });
      sendSuccess(res, projects, 200, buildMeta(total, page, limit));
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id', requirePermission('projects:read'), async (req, res, next) => {
  try {
    const project = await projectsService.getProject(req.user!, req.params.id);
    sendSuccess(res, project);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  requirePermission('projects:create'),
  validate(projectCreateSchema),
  async (req, res, next) => {
    try {
      const project = await projectsService.createProject(req.user!, req.body);
      sendSuccess(res, project, 201);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id',
  requirePermission('projects:update'),
  validate(projectUpdateSchema),
  async (req, res, next) => {
    try {
      const project = await projectsService.updateProject(req.user!, req.params.id, req.body);
      sendSuccess(res, project);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id', requirePermission('projects:delete'), async (req, res, next) => {
  try {
    await projectsService.deleteProject(req.user!, req.params.id);
    sendSuccess(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/:id/members',
  requirePermission('projects:members'),
  validate(memberSchema),
  async (req, res, next) => {
    try {
      const project = await projectsService.addMember(
        req.user!,
        req.params.id,
        req.body.userId
      );
      sendSuccess(res, project);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id/members/:userId',
  requirePermission('projects:members'),
  async (req, res, next) => {
    try {
      const project = await projectsService.removeMember(
        req.user!,
        req.params.id,
        req.params.userId
      );
      sendSuccess(res, project);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
