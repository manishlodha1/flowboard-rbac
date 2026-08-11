import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { AppError } from '../lib/errors';

type RequestPart = 'body' | 'query' | 'params';

/** Generic Zod validator — reuse on any route. */
export function validate(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[part]);
      req[part] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(
          new AppError(400, 'Validation failed', err.flatten().fieldErrors)
        );
        return;
      }
      next(err);
    }
  };
}
