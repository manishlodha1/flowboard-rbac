import { NextFunction, Request, Response } from 'express';
import { Role, User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../lib/errors';
import { prisma } from '../lib/prisma';
import { Permission, roleHasPermission } from '../rbac/permissions';

export type AuthUser = Pick<User, 'id' | 'email' | 'name' | 'role' | 'isActive'>;

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

interface JwtPayload {
  sub: string;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication required');
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'Invalid or inactive account');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError(401, 'Invalid or expired token'));
  }
}

/** Gate a route by permission key from the central catalog. */
export function requirePermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, 'Authentication required'));

    const allowed = permissions.some((p) => roleHasPermission(req.user!.role, p));
    if (!allowed) {
      return next(new AppError(403, 'You do not have permission for this action'));
    }
    next();
  };
}

export function requireRoles(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, 'Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Insufficient role privileges'));
    }
    next();
  };
}
