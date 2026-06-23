import { PrismaClient, Role, ServiceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const services = [
  {
    title: 'Full-Stack SaaS Development',
    description: 'Scalable web platforms with dashboards, payments, secure auth, automation, and production deployment pipelines.',
    price: 25000000,
  },
  {
    title: 'E-Commerce & Payment Systems',
    description: 'High-conversion storefronts, order management, checkout integrations, and operational admin panels.',
    price: 18000000,
  },
  {
    title: 'Cloud Architecture & DevOps',
    description: 'Vercel, PostgreSQL, observability, CI/CD, performance hardening, and production reliability support.',
    price: 12000000,
  },
];

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@reii.com' },
    update: { name: 'ReiiKajurawa Admin', role: Role.ADMIN, passwordHash },
    create: {
      name: 'ReiiKajurawa Admin',
      email: 'admin@reii.com',
      role: Role.ADMIN,
      passwordHash,
    },
  });

  for (const service of services) {
    await prisma.service.upsert({
      where: { title: service.title },
      update: { ...service, status: ServiceStatus.ACTIVE },
      create: { ...service, status: ServiceStatus.ACTIVE },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
