const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('🌱 Seeding people, clients, and partners...');

  const people = [
    {
      name: 'Oficina MotoSul Especializada',
      tradeName: 'MotoSul Racing',
      personType: 'PJ',
      roles: 'OFICINA,PARCEIRO',
      document: '22.333.444/0001-55',
      phone: '(48) 3244-8899',
      email: 'contato@motosul.com.br',
      address: 'Rua das Oficinas, 450',
      neighborhood: 'Estreito',
      city: 'Florianópolis',
      state: 'SC',
      notes: 'Parceiro homologado para revisões de entrada e preparação de motos esportivas e big trails.',
    },
    {
      name: 'Despachante Ilha Bela Ltda',
      tradeName: 'Ilha Bela Despachante Detran',
      personType: 'PJ',
      roles: 'DESPACHANTE,PARCEIRO',
      document: '33.444.555/0001-66',
      phone: '(48) 3222-1100',
      email: 'atendimento@ilhabeladespachante.com.br',
      address: 'Av. Mauro Ramos, 1200',
      neighborhood: 'Centro',
      city: 'Florianópolis',
      state: 'SC',
      notes: 'Responsável pelas transferências, ATPV-e e vistorias cautelares da loja.',
    },
    {
      name: 'Auto Leilões Santa Catarina',
      tradeName: 'SC Leilões',
      personType: 'PJ',
      roles: 'FORNECEDOR',
      document: '44.555.666/0001-77',
      phone: '(48) 3388-7700',
      email: 'faturamento@scleiloes.com.br',
      address: 'Rodovia BR-101, Km 205',
      neighborhood: 'Distrito Industrial',
      city: 'São José',
      state: 'SC',
      notes: 'Fornecedor de frotas e lotes com garantia de procedência.',
    },
    {
      name: 'Guilherme Boari',
      personType: 'PF',
      roles: 'FORNECEDOR,CLIENTE',
      document: '111.222.333-44',
      phone: '(48) 99122-3344',
      email: 'guilherme.boari@gmail.com',
      address: 'Rua Bocaiúva, 88',
      neighborhood: 'Centro',
      city: 'Florianópolis',
      state: 'SC',
      notes: 'Vendeu a BMW F 850 GS para a loja e tem interesse em adquirir uma Harley-Davidson futuramente.',
    },
  ];

  for (const p of people) {
    const existing = await prisma.customer.findFirst({
      where: { phone: p.phone },
    });

    if (!existing) {
      await prisma.customer.create({ data: p });
    }
  }

  console.log('✅ People seeded successfully!');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
