const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Trilha de Auditoria & Logs de Segurança (PRD 10)...');

  // Buscar usuários e entidades para vincular
  const users = await prisma.user.findMany();
  const motos = await prisma.motorcycle.findMany();
  const sales = await prisma.sale.findMany({ include: { motorcycle: true, customer: true } });
  const entries = await prisma.financialEntry.findMany();
  const leads = await prisma.lead.findMany();
  const contracts = await prisma.documentContract.findMany();

  const adminUser = users.find((u) => u.role === 'ADMIN') || users[0];
  const gerenteUser = users.find((u) => u.role === 'GERENTE') || users[0];
  const vendedorUser = users.find((u) => u.role === 'VENDEDOR') || users[0];

  const now = Date.now();
  const hour = 1000 * 60 * 60;
  const day = hour * 24;

  const mockLogs = [
    {
      userId: adminUser?.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: adminUser?.id,
      details: `Login efetuado com sucesso via credenciais administrativas por ${adminUser?.name || 'Administrador'}.`,
      ipAddress: '189.4.12.89',
      createdAt: new Date(now - 4 * day),
    },
    {
      userId: adminUser?.id,
      action: 'PRICE_CHANGE',
      entity: 'Motorcycle',
      entityId: motos[0]?.id,
      details: `Preço público de venda da moto ${motos[0]?.brand} ${motos[0]?.model} (${motos[0]?.plate}) atualizado de R$ ${(motos[0]?.publicPrice ? motos[0].publicPrice - 1500 : 35000).toLocaleString('pt-BR')} para R$ ${(motos[0]?.publicPrice || 36500).toLocaleString('pt-BR')} com base na Tabela FIPE oficial.`,
      ipAddress: '189.4.12.89',
      createdAt: new Date(now - 3 * day - 2 * hour),
    },
    {
      userId: gerenteUser?.id,
      action: 'STATUS_CHANGE',
      entity: 'Motorcycle',
      entityId: motos[1]?.id || motos[0]?.id,
      details: `Status do veículo ${motos[1]?.model || motos[0]?.model} alterado de EM_PREPARACAO para DISPONIVEL após conclusão do checklist de estética e revisão mecânica.`,
      ipAddress: '177.18.23.44',
      createdAt: new Date(now - 3 * day),
    },
    {
      userId: gerenteUser?.id,
      action: 'COST_ADD',
      entity: 'MotorcycleCost',
      entityId: motos[0]?.id,
      details: `Custo de oficina mecânica adicionado à moto ${motos[0]?.model}: Troca de pastilhas de freio dianteiras e traseiras + óleo Motul 5100 (R$ 680,00).`,
      ipAddress: '177.18.23.44',
      createdAt: new Date(now - 2 * day - 5 * hour),
    },
    {
      userId: vendedorUser?.id,
      action: 'SALE_CREATE',
      entity: 'Sale',
      entityId: sales[0]?.id,
      details: `Venda formalizada e faturada: Motocicleta ${sales[0]?.motorcycle?.brand} ${sales[0]?.motorcycle?.model} (${sales[0]?.motorcycle?.plate}) para o cliente ${sales[0]?.customer?.name} pelo valor de R$ ${(sales[0]?.salePrice || 0).toLocaleString('pt-BR')}.`,
      ipAddress: '191.36.14.102',
      createdAt: new Date(now - 2 * day),
    },
    {
      userId: adminUser?.id,
      action: 'FINANCIAL_BAIXA',
      entity: 'FinancialEntry',
      entityId: entries[0]?.id,
      details: `Baixa e conciliação bancária efetuada: Título "${entries[0]?.description || 'Venda de Veículo'}" no valor de R$ ${(entries[0]?.amount || 0).toLocaleString('pt-BR')} creditado com sucesso. Saldo da conta atualizado.`,
      ipAddress: '189.4.12.89',
      createdAt: new Date(now - 1 * day - 3 * hour),
    },
    {
      userId: vendedorUser?.id,
      action: 'DOCUMENT_GENERATE',
      entity: 'DocumentContract',
      entityId: contracts[0]?.id,
      details: `Instrumento Particular de Compra e Venda gerado com 6 cláusulas legais, checklist de vistoria e garantia de 90 dias (CDC) para a moto ${contracts[0]?.title || 'Honda'}.`,
      ipAddress: '191.36.14.102',
      createdAt: new Date(now - 1 * day),
    },
    {
      userId: adminUser?.id,
      action: 'DOCUMENT_SIGN',
      entity: 'DocumentContract',
      entityId: contracts[0]?.id,
      details: `Contrato de Compra e Venda registrado como ASSINADO pelas partes (Loja, Comprador e Testemunhas) com cópia arquivada digitalmente.`,
      ipAddress: '189.4.12.89',
      createdAt: new Date(now - 18 * hour),
    },
    {
      userId: vendedorUser?.id,
      action: 'LEAD_STAGE',
      entity: 'Lead',
      entityId: leads[0]?.id,
      details: `Oportunidade "${leads[0]?.name || 'Cliente'}" avançada no funil do CRM de NOVO para CONTATO após envio de template no WhatsApp.`,
      ipAddress: '191.36.14.102',
      createdAt: new Date(now - 12 * hour),
    },
    {
      userId: gerenteUser?.id,
      action: 'LEAD_LOSS',
      entity: 'Lead',
      entityId: leads[leads.length - 1]?.id,
      details: `Lead arquivado como PERDIDO. Motivo registrado: "Financiamento bancário reprovado". Observação registrada para recontato futuro.`,
      ipAddress: '177.18.23.44',
      createdAt: new Date(now - 6 * hour),
    },
    {
      userId: adminUser?.id,
      action: 'SWITCH_USER',
      entity: 'User',
      entityId: vendedorUser?.id,
      details: `Troca de sessão simulada de perfil: Administrador simulou visão do vendedor ${vendedorUser?.name} para validação de restrições de margem (RBAC).`,
      ipAddress: '189.4.12.89',
      createdAt: new Date(now - 2 * hour),
    },
    {
      userId: adminUser?.id,
      action: 'PRICE_CHANGE',
      entity: 'Motorcycle',
      entityId: motos[motos.length - 1]?.id,
      details: `Ajuste promocional de estoque: Moto ${motos[motos.length - 1]?.brand} ${motos[motos.length - 1]?.model} com preço recalculado para giro rápido.`,
      ipAddress: '189.4.12.89',
      createdAt: new Date(now - 30 * 60 * 1000), // há 30 min
    },
  ];

  for (const log of mockLogs) {
    await prisma.auditLog.create({
      data: {
        userId: log.userId,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId || null,
        details: log.details,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
      },
    });
  }

  console.log(`✓ ${mockLogs.length} eventos gravados na trilha de auditoria.`);
  console.log('Seeding de Auditoria concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
