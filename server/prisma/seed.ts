import bcrypt from 'bcryptjs';
import { PrismaClient, ProjectStatus, Role, TaskPriority, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding FlowBoard...');

  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Ava Admin',
      email: 'admin@flowboard.dev',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Morgan Manager',
      email: 'manager@flowboard.dev',
      passwordHash,
      role: Role.MANAGER,
    },
  });

  const member = await prisma.user.create({
    data: {
      name: 'Sam Member',
      email: 'member@flowboard.dev',
      passwordHash,
      role: Role.MEMBER,
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: 'Riley Contributor',
      email: 'riley@flowboard.dev',
      passwordHash,
      role: Role.MEMBER,
    },
  });

  const website = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Rebuild marketing site with accessible design system.',
      status: ProjectStatus.ACTIVE,
      managerId: manager.id,
      members: {
        create: [{ userId: manager.id }, { userId: member.id }, { userId: member2.id }],
      },
    },
  });

  const mobile = await prisma.project.create({
    data: {
      name: 'Mobile App MVP',
      description: 'Ship the first release of the companion mobile app.',
      status: ProjectStatus.PLANNING,
      managerId: manager.id,
      members: {
        create: [{ userId: manager.id }, { userId: member.id }],
      },
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Audit current IA',
        description: 'Map existing pages and navigation paths.',
        status: TaskStatus.DONE,
        priority: TaskPriority.MEDIUM,
        projectId: website.id,
        assigneeId: member.id,
        createdById: manager.id,
      },
      {
        title: 'Design homepage hero',
        description: 'Produce responsive hero variants for review.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        projectId: website.id,
        assigneeId: member2.id,
        createdById: manager.id,
      },
      {
        title: 'Implement auth screens',
        description: 'Login and register flows for mobile MVP.',
        status: TaskStatus.TODO,
        priority: TaskPriority.URGENT,
        projectId: mobile.id,
        assigneeId: member.id,
        createdById: manager.id,
      },
      {
        title: 'Define API contracts',
        description: 'Document endpoints needed for sync.',
        status: TaskStatus.REVIEW,
        priority: TaskPriority.HIGH,
        projectId: mobile.id,
        assigneeId: manager.id,
        createdById: admin.id,
      },
    ],
  });

  console.log('Seed complete.');
  console.log('Test accounts (password: Password123!):');
  console.log(`  Admin   → ${admin.email}`);
  console.log(`  Manager → ${manager.email}`);
  console.log(`  Member  → ${member.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
