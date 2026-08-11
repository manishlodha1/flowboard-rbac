import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { buildMeta, getPagination, sendSuccess } from '../../lib/http';
import { updateUserSchema, userQuerySchema } from '../../validators/schemas';
import * as usersService from './users.service';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission('users:read'),
  validate(userQuerySchema, 'query'),
  async (req, res, next) => {
    try {
      const { page, limit, skip } = getPagination(req.query as { page?: number; limit?: number });
      const { total, users } = await usersService.listUsers({
        page,
        limit,
        skip,
        search: (req.query as { search?: string }).search,
        role: (req.query as { role?: never }).role,
      });
      sendSuccess(res, users, 200, buildMeta(total, page, limit));
    } catch (err) {
      next(err);
    }
  }
);

router.get('/assignable', requirePermission('projects:members'), async (_req, res, next) => {
  try {
    const users = await usersService.listAssignableUsers();
    sendSuccess(res, users);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requirePermission('users:read'), async (req, res, next) => {
  try {
    const user = await usersService.getUser(req.params.id);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/:id',
  requirePermission('users:write'),
  validate(updateUserSchema),
  async (req, res, next) => {
    try {
      const user = await usersService.updateUser(req.params.id, req.body);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
