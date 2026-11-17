const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding IA & Automações Inteligentes (PRD 10)...');

  // 1. Criar regras de automação padrão
  const rules = [
    {
      name: 'Monitor de Giro de Estoque (> 30 dias)',
      triggerType: 'ESTOQUE_DIAS',
      condition: JSON.stringify({ days: 30 }),
      actionType: 'CREATE_ALERT',
      isActive: true,
    },
    {
      name: 'Alerta de Lead Sem Resposta (> 24 horas)',
      triggerType: 'LEAD_TEMPO',
      condition: JSON.stringify({ hours: 24 }),
      actionType: 'CREATE_ALERT',
      isActive: true,
    },
    {
      name: 'Vigilante de Tarefas de Oficina Atrasadas',
      triggerType: 'OFICINA_PRAZO',
      condition: JSON.stringify({ overdue: true }),
      actionType: 'CREATE_ALERT',
      isActive: true,
    },
  ];

  for (const r of rules) {
    const existing = await prisma.automationRule.findFirst({
      where: { name: r.name },
    });
    if (!existing) {
      await prisma.automationRule.create({ data: r });
    }
  }

  // 2. Criar alertas realistas
  const motos = await prisma.motorcycle.findMany();
  const leads = await prisma.lead.findMany();

  if (motos.length > 0) {
    await prisma.systemAlert.create({
      data: {
        type: 'ESTOQUE_PARADO',
        severity: 'WARNING',
        title: `Estoque Parado: ${motos[0].brand} ${motos[0].model} (42 dias)`,
        message: `A moto ${motos[0].brand} ${motos[0].model} (${motos[0].plate}) está há 42 dias no showroom. Sugerimos impulsionar anúncio nos portais ou ajustar condições.`,
        entity: 'Motorcycle',
        entityId: motos[0].id,
        actionUrl: '/admin?tab=estoque',
      },
    });
  }

  if (leads.length > 0) {
    await prisma.systemAlert.create({
      data: {
        type: 'LEAD_SEM_CONTATO',
        severity: 'CRITICAL',
        title: `Oportunidade Crítica: ${leads[0].name}`,
        message: `Lead recebido da vitrine web com interesse na moto está aguardando retorno há mais de 24 horas no CRM.`,
        entity: 'Lead',
        entityId: leads[0].id,
        actionUrl: '/admin?tab=crm',
      },
    });
  }

  console.log('✓ Regras de automação e alertas inteligentes semeados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
