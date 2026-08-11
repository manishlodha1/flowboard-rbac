import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../../config/env';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.isActive) throw new AppError(401, 'Invalid email or password');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError(401, 'Invalid email or password');

  const token = signToken(user.id);
  const { passwordHash: _, ...safe } = user;
  return { token, user: safe };
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
  role?: Role;
  actorRole?: Role;
}) {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError(409, 'Email already registered');

  // Only admins may create elevated roles; public signup defaults to MEMBER
  let role: Role = Role.MEMBER;
  if (input.role && input.actorRole === Role.ADMIN) {
    role = input.role;
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: { name: input.name, email, passwordHash, role },
    select: publicUserSelect,
  });

  const token = signToken(user.id);
  return { token, user };
}

function signToken(userId: string) {
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

export { publicUserSelect };
