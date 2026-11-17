const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding initial MotoFlow data...');

  // 1. Criar Organização
  const org = await prisma.organization.create({
    data: {
      name: 'The Rock Moto Shop',
      document: '12.345.678/0001-90',
    },
  });

  // 2. Criar Filial
  const branch = await prisma.branch.create({
    data: {
      organizationId: org.id,
      name: 'Unidade Florianópolis',
      city: 'Florianópolis',
      state: 'SC',
      phone: '(48) 99123-4567',
    },
  });

  // 3. Criar Usuário Admin
  const admin = await prisma.user.create({
    data: {
      organizationId: org.id,
      branchId: branch.id,
      name: 'Cassio Tenorio',
      email: 'cassio@therockmotos.com.br',
      passwordHash: 'PENDING_RESET', // não permite login; rode: node scripts/reset_passwords.js
      role: 'ADMIN',
    },
  });

  // 4. Criar Motos com Custos
  const m1 = await prisma.motorcycle.create({
    data: {
      branchId: branch.id,
      plate: 'RDX4F37',
      brand: 'BMW',
      model: 'F 850 GS Premium',
      version: 'TFT Abs',
      yearMfg: 2020,
      yearModel: 2020,
      color: 'Branca',
      mileage: 38400,
      status: 'DISPONIVEL',
      publicPrice: 56900,
      location: 'Showroom · Box 04',
      description: 'Moto em estado de zero km, revisada com pneus novos e manual/chave reserva.',
      isFeatured: true,
      entryDate: new Date('2026-06-17'),
      costs: {
        create: [
          { category: 'AQUISICAO', description: 'Compra direta de particular', amount: 46500 },
          { category: 'PREPARACAO_REVISAO', description: 'Revisão geral oficina MotoSul', amount: 1680 },
          { category: 'DOCUMENTACAO', description: 'Transferência e despachante', amount: 720 },
        ],
      },
    },
  });

  const m2 = await prisma.motorcycle.create({
    data: {
      branchId: branch.id,
      plate: 'QJU1159',
      brand: 'Honda',
      model: 'CB 500F ABS',
      version: 'ABS',
      yearMfg: 2022,
      yearModel: 2022,
      color: 'Vermelha',
      mileage: 18400,
      status: 'DISPONIVEL',
      publicPrice: 38900,
      location: 'Showroom · Box 02',
      description: 'Excelente moto urbana para o dia a dia e viagens curtas.',
      isFeatured: true,
      entryDate: new Date('2026-09-12'),
      costs: {
        create: [
          { category: 'AQUISICAO', description: 'Entrada na troca', amount: 30500 },
          { category: 'PREPARACAO_REVISAO', description: 'Polimento e troca de óleo', amount: 880 },
          { category: 'DOCUMENTACAO', description: 'Taxa de vistoria e documento', amount: 400 },
        ],
      },
    },
  });

  const m3 = await prisma.motorcycle.create({
    data: {
      branchId: branch.id,
      plate: 'JBH4F98',
      brand: 'BMW',
      model: 'G 310 GS',
      version: 'Rallye ABS',
      yearMfg: 2022,
      yearModel: 2022,
      color: 'Preta',
      mileage: 12100,
      status: 'RESERVADA',
      publicPrice: 31900,
      location: 'Pátio interno',
      description: 'Compacta de aventura, garantia até 2025.',
      entryDate: new Date('2026-10-24'),
      costs: {
        create: [
          { category: 'AQUISICAO', description: 'Compra de revenda parceira', amount: 24200 },
          { category: 'PREPARACAO_REVISAO', description: 'Lavagem técnica e lubrificação', amount: 650 },
          { category: 'DOCUMENTACAO', description: 'Emissão ATPV-e', amount: 550 },
        ],
      },
    },
  });

  const m4 = await prisma.motorcycle.create({
    data: {
      branchId: branch.id,
      plate: 'FTF1J71',
      brand: 'Harley-Davidson',
      model: 'Electra Glide Ultra Limited',
      version: '107ci',
      yearMfg: 2021,
      yearModel: 2021,
      color: 'Preta / Prata',
      mileage: 21200,
      status: 'EM_PREPARACAO',
      publicPrice: 86900,
      location: 'Oficina de personalização',
      description: 'Touring de alta performance para longas distâncias.',
      entryDate: new Date('2026-07-10'),
      costs: {
        create: [
          { category: 'AQUISICAO', description: 'Compra em lote', amount: 69000 },
          { category: 'PREPARACAO_REVISAO', description: 'Cromagem e revisão elétrica', amount: 2500 },
          { category: 'DOCUMENTACAO', description: 'Regularização e taxas Detran', amount: 800 },
        ],
      },
    },
  });

  // 5. Criar Leads para teste do CRM
  await prisma.lead.createMany({
    data: [
      {
        motorcycleId: m1.id,
        name: 'Marcos Souza',
        phone: '(48) 99887-1122',
        email: 'marcos.souza@gmail.com',
        source: 'VITRINE_SITE',
        stage: 'NOVO',
        message: 'Aceita minha Triumph Tiger 800 na troca pela F 850 GS?',
        assignedToId: admin.id,
      },
      {
        motorcycleId: m2.id,
        name: 'Ana Ferreira',
        phone: '(48) 98765-4321',
        email: 'ana.ferreira@hotmail.com',
        source: 'WHATSAPP',
        stage: 'CONTATO',
        message: 'Visita agendada para amanhã às 10h para ver a CB 500F.',
        assignedToId: admin.id,
      },
      {
        motorcycleId: m3.id,
        name: 'Rafael Costa',
        phone: '(48) 99112-3344',
        email: 'rafael.costa@empresa.com.br',
        source: 'WEBMOTORS',
        stage: 'PROPOSTA',
        message: 'Proposta de financiamento pré-aprovada pelo Santander.',
        assignedToId: admin.id,
      },
    ],
  });

  // 6. Criar Títulos Financeiros
  await prisma.financialEntry.createMany({
    data: [
      {
        motorcycleId: m2.id,
        type: 'RECEITA',
        category: 'VENDA_MOTO',
        description: 'Entrada reserva · CB 500F',
        amount: 8400,
        dueDate: new Date(),
        status: 'PENDENTE',
      },
      {
        motorcycleId: m1.id,
        type: 'DESPESA',
        category: 'MANUTENCAO',
        description: 'Oficina MotoSul · Revisão F 850 GS',
        amount: 1680,
        dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000),
        status: 'PENDENTE',
      },
      {
        type: 'DESPESA',
        category: 'DESPESA_OPERACIONAL',
        description: 'Aluguel do Showroom Florianópolis',
        amount: 6200,
        dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
        status: 'PENDENTE',
      },
    ],
  });

  console.log('✅ Seed executado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
