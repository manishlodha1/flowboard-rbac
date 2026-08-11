import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, requirePermission } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { sendSuccess } from '../../lib/http';
import { loginSchema, registerSchema } from '../../validators/schemas';
import * as authService from './auth.service';

const router = Router();

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
});

/** Public self-registration always creates MEMBER accounts. */
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.register({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
});

/** Admin-only: create users with any role. */
router.post(
  '/users',
  authenticate,
  requirePermission('users:write'),
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const result = await authService.register({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role as Role | undefined,
        actorRole: req.user!.role,
      });
      sendSuccess(res, result.user, 201);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/me', authenticate, async (req, res) => {
  sendSuccess(res, req.user);
});

export default router;
