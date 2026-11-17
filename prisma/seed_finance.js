const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('💰 Semeando Contas Bancárias, Títulos Financeiros e DRE Gerencial (PRD 07)...');

  // 1. Criar Contas Financeiras
  const accItau = await prisma.financialAccount.upsert({
    where: { id: 'itau-pj-principal' },
    update: {},
    create: {
      id: 'itau-pj-principal',
      name: 'Banco Itaú Empresas',
      type: 'BANCO',
      bankName: 'Itaú Unibanco',
      agency: '0182',
      accountNumber: '44521-9',
      currentBalance: 78540.0,
      color: '#ec5b08',
    },
  });

  const accSantander = await prisma.financialAccount.upsert({
    where: { id: 'santander-finan' },
    update: {},
    create: {
      id: 'santander-finan',
      name: 'Santander Financiamentos',
      type: 'BANCO',
      bankName: 'Banco Santander',
      agency: '3210',
      accountNumber: '10988-2',
      currentBalance: 42300.0,
      color: '#e20613',
    },
  });

  const accCaixa = await prisma.financialAccount.upsert({
    where: { id: 'caixa-loja-floripa' },
    update: {},
    create: {
      id: 'caixa-loja-floripa',
      name: 'Caixa Físico Loja (Tesouraria)',
      type: 'CAIXA_FISICO',
      bankName: 'Cofre Loja',
      currentBalance: 6450.0,
      color: '#6d3df5',
    },
  });

  // Buscar clientes, fornecedores e oficinas parceiras
  const oficina = await prisma.customer.findFirst({ where: { roles: { contains: 'OFICINA' } } });
  const despachante = await prisma.customer.findFirst({ where: { roles: { contains: 'DESPACHANTE' } } });
  const cliente = await prisma.customer.findFirst({ where: { roles: { contains: 'CLIENTE' } } });
  const motos = await prisma.motorcycle.findMany({ take: 4 });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // 2. Lançamentos Financeiros Realistas para DRE
  const entries = [
    // --- RECEITAS DE VENDAS & COMISSÕES ---
    {
      type: 'RECEITA',
      category: 'VENDA_MOTO',
      costCenter: 'SHOWROOM',
      description: 'Liquidação Venda Moto MT-07 ABS 2023 - À Vista PIX',
      amount: 45000.0,
      paidAmount: 45000.0,
      status: 'PAGO',
      paymentMethod: 'PIX',
      financialAccountId: accItau.id,
      customerId: cliente?.id || null,
      motorcycleId: motos[0]?.id || null,
      dueDate: new Date(currentYear, currentMonth, 3),
      paymentDate: new Date(currentYear, currentMonth, 3),
      competenceDate: new Date(currentYear, currentMonth, 3),
    },
    {
      type: 'RECEITA',
      category: 'VENDA_MOTO',
      costCenter: 'SHOWROOM',
      description: 'Liquidação Venda BMW F 850 GS - TED Recebida',
      amount: 56900.0,
      paidAmount: 56900.0,
      status: 'PAGO',
      paymentMethod: 'TED',
      financialAccountId: accItau.id,
      customerId: cliente?.id || null,
      motorcycleId: motos[1]?.id || null,
      dueDate: new Date(currentYear, currentMonth, 5),
      paymentDate: new Date(currentYear, currentMonth, 5),
      competenceDate: new Date(currentYear, currentMonth, 5),
    },
    {
      type: 'RECEITA',
      category: 'COMISSAO_FINANCIAMENTO',
      costCenter: 'SHOWROOM',
      description: 'Retorno Bancário Financiamento BV Financeira (Tiger 900)',
      amount: 2850.0,
      paidAmount: 2850.0,
      status: 'PAGO',
      paymentMethod: 'TED',
      financialAccountId: accSantander.id,
      dueDate: new Date(currentYear, currentMonth, 6),
      paymentDate: new Date(currentYear, currentMonth, 6),
      competenceDate: new Date(currentYear, currentMonth, 6),
    },
    {
      type: 'RECEITA',
      category: 'VENDA_MOTO',
      costCenter: 'SHOWROOM',
      description: 'Recebimento Parcela Entrada Financiamento Honda CB 500F',
      amount: 12500.0,
      status: 'PENDENTE',
      paymentMethod: 'PIX',
      financialAccountId: accItau.id,
      dueDate: new Date(currentYear, currentMonth, 15),
      competenceDate: new Date(currentYear, currentMonth, 7),
    },

    // --- CUSTOS DIRETOS / CMV ---
    {
      type: 'DESPESA',
      category: 'AQUISICAO_VEICULO',
      costCenter: 'SHOWROOM',
      description: 'Compra de Veículo no Estoque - Yamaha MT-07',
      amount: 36000.0,
      paidAmount: 36000.0,
      status: 'PAGO',
      paymentMethod: 'TED',
      financialAccountId: accItau.id,
      dueDate: new Date(currentYear, currentMonth, 2),
      paymentDate: new Date(currentYear, currentMonth, 2),
      competenceDate: new Date(currentYear, currentMonth, 2),
    },
    {
      type: 'DESPESA',
      category: 'OFICINA_MECANICA',
      costCenter: 'OFICINA',
      description: 'Revisão geral, troca de pastilhas e óleo Motul - MotoSul',
      amount: 980.0,
      paidAmount: 980.0,
      status: 'PAGO',
      paymentMethod: 'PIX',
      financialAccountId: accItau.id,
      customerId: oficina?.id || null,
      dueDate: new Date(currentYear, currentMonth, 4),
      paymentDate: new Date(currentYear, currentMonth, 4),
      competenceDate: new Date(currentYear, currentMonth, 4),
    },
    {
      type: 'DESPESA',
      category: 'DOCUMENTACAO',
      costCenter: 'ADMINISTRATIVO',
      description: 'Honorários e taxas Detran transferência lote 3 motos',
      amount: 1450.0,
      paidAmount: 1450.0,
      status: 'PAGO',
      paymentMethod: 'BOLETO',
      financialAccountId: accItau.id,
      customerId: despachante?.id || null,
      dueDate: new Date(currentYear, currentMonth, 4),
      paymentDate: new Date(currentYear, currentMonth, 4),
      competenceDate: new Date(currentYear, currentMonth, 4),
    },

    // --- DESPESAS OPERACIONAIS FIXAS & ADMINISTRATIVAS ---
    {
      type: 'DESPESA',
      category: 'ALUGUEL',
      costCenter: 'SHOWROOM',
      description: 'Aluguel do Pavilhão e Showroom Principal Florianópolis',
      amount: 6200.0,
      paidAmount: 6200.0,
      status: 'PAGO',
      paymentMethod: 'BOLETO',
      financialAccountId: accItau.id,
      dueDate: new Date(currentYear, currentMonth, 5),
      paymentDate: new Date(currentYear, currentMonth, 5),
      competenceDate: new Date(currentYear, currentMonth, 1),
    },
    {
      type: 'DESPESA',
      category: 'MARKETING_ANUNCIOS',
      costCenter: 'COMERCIAL',
      description: 'Mensalidade Webmotors Revenda Pro + OLX Autos',
      amount: 1850.0,
      paidAmount: 1850.0,
      status: 'PAGO',
      paymentMethod: 'BOLETO',
      financialAccountId: accItau.id,
      dueDate: new Date(currentYear, currentMonth, 7),
      paymentDate: new Date(currentYear, currentMonth, 7),
      competenceDate: new Date(currentYear, currentMonth, 7),
    },
    {
      type: 'DESPESA',
      category: 'DESPESA_OPERACIONAL',
      costCenter: 'ADMINISTRATIVO',
      description: 'Energia Elétrica Celesc Showroom',
      amount: 740.0,
      status: 'PENDENTE',
      paymentMethod: 'BOLETO',
      financialAccountId: accItau.id,
      dueDate: new Date(currentYear, currentMonth, 12),
      competenceDate: new Date(currentYear, currentMonth, 1),
    },
    {
      type: 'DESPESA',
      category: 'COMISSAO',
      costCenter: 'COMERCIAL',
      description: 'Comissões de Vendas Equipe Comercial (2 motos fechadas)',
      amount: 2200.0,
      status: 'PENDENTE',
      paymentMethod: 'PIX',
      financialAccountId: accItau.id,
      dueDate: new Date(currentYear, currentMonth, 15),
      competenceDate: new Date(currentYear, currentMonth, 5),
    },
    {
      type: 'DESPESA',
      category: 'IMPOSTOS',
      costCenter: 'ADMINISTRATIVO',
      description: 'Guia DAS Simples Nacional - Competência Mês Anterior',
      amount: 3420.0,
      status: 'PENDENTE',
      paymentMethod: 'BOLETO',
      financialAccountId: accItau.id,
      dueDate: new Date(currentYear, currentMonth, 20),
      competenceDate: new Date(currentYear, currentMonth, 1),
    },
  ];

  for (const entry of entries) {
    await prisma.financialEntry.create({
      data: entry,
    });
  }

  console.log('✅ Estrutura Financeira e DRE populados com sucesso!');
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
