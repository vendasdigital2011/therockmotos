const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const org = await prisma.organization.findFirst();
  const branch = await prisma.branch.findFirst();

  await prisma.user.upsert({
    where: { email: 'lucas.vendedor@therockmotos.com.br' },
    update: {},
    create: {
      organizationId: org.id,
      branchId: branch.id,
      name: 'Lucas Ribeiro',
      email: 'lucas.vendedor@therockmotos.com.br',
      passwordHash: '123456',
      role: 'VENDEDOR',
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'mariana.financeiro@therockmotos.com.br' },
    update: {},
    create: {
      organizationId: org.id,
      branchId: branch.id,
      name: 'Mariana Dias',
      email: 'mariana.financeiro@therockmotos.com.br',
      passwordHash: '123456',
      role: 'FINANCEIRO',
      active: true,
    },
  });

  console.log('✅ Team users seeded successfully!');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
