import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { sendSuccess } from '../lib/http';
import { prisma } from '../lib/prisma';
import { projectVisibilityWhere, taskVisibilityWhere } from '../rbac/access';
import { PERMISSIONS } from '../rbac/permissions';
import authRoutes from '../modules/auth/auth.routes';
import usersRoutes from '../modules/users/users.routes';
import projectsRoutes from '../modules/projects/projects.routes';
import tasksRoutes from '../modules/tasks/tasks.routes';

const router = Router();

router.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'ok', service: 'flowboard-api' });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/projects', projectsRoutes);
router.use('/tasks', tasksRoutes);

router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    const user = req.user!;
    const projectWhere = projectVisibilityWhere(user);
    const taskWhere = taskVisibilityWhere(user);

    const [projectCount, taskCount, todoCount, inProgressCount, doneCount, myTasks] =
      await Promise.all([
        prisma.project.count({ where: projectWhere }),
        prisma.task.count({ where: taskWhere }),
        prisma.task.count({ where: { AND: [taskWhere, { status: 'TODO' }] } }),
        prisma.task.count({ where: { AND: [taskWhere, { status: 'IN_PROGRESS' }] } }),
        prisma.task.count({ where: { AND: [taskWhere, { status: 'DONE' }] } }),
        prisma.task.findMany({
          where: { AND: [taskWhere, { assigneeId: user.id }] },
          include: {
            project: { select: { id: true, name: true } },
          },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        }),
      ]);

    sendSuccess(res, {
      stats: {
        projects: projectCount,
        tasks: taskCount,
        todo: todoCount,
        inProgress: inProgressCount,
        done: doneCount,
      },
      myTasks,
      permissions: (Object.keys(PERMISSIONS) as Array<keyof typeof PERMISSIONS>).filter((key) =>
        (PERMISSIONS[key] as readonly string[]).includes(user.role)
      ),
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
