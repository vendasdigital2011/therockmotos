const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Semeando Provedores de Portais (PRD 11) ---');

  const providers = [
    {
      code: 'WEBMOTORS',
      name: 'Webmotors',
      isActive: true,
      environment: 'HOMOLOGACAO',
      apiKey: process.env.WEBMOTORS_API_KEY || '',
      settings: JSON.stringify({ autoSyncPhotos: true, highlightGold: true }),
    },
    {
      code: 'OLX',
      name: 'OLX Brasil',
      isActive: true,
      environment: 'HOMOLOGACAO',
      apiKey: process.env.OLX_API_KEY || '',
      settings: JSON.stringify({ category: 'Motos', replyWithChatbot: true }),
    },
    {
      code: 'ICARROS',
      name: 'iCarros Itaú',
      isActive: true,
      environment: 'HOMOLOGACAO',
      apiKey: process.env.ICARROS_API_KEY || '',
      settings: JSON.stringify({ itauFinancingBanner: true }),
    },
    {
      code: 'MERCADOLIVRE',
      name: 'Mercado Livre Veículos',
      isActive: false,
      environment: 'HOMOLOGACAO',
      apiKey: process.env.MERCADOLIVRE_API_KEY || '',
      settings: JSON.stringify({ listingType: 'gold_special' }),
    },
  ];

  for (const prov of providers) {
    await prisma.integrationProvider.upsert({
      where: { code: prov.code },
      update: prov,
      create: prov,
    });
  }

  // Pegar motos disponíveis para criar anúncios piloto
  const motos = await prisma.motorcycle.findMany({
    where: { status: 'DISPONIVEL' },
    take: 3,
  });

  const wmProvider = await prisma.integrationProvider.findUnique({ where: { code: 'WEBMOTORS' } });
  const olxProvider = await prisma.integrationProvider.findUnique({ where: { code: 'OLX' } });

  if (motos.length > 0 && wmProvider && olxProvider) {
    // Anúncio 1 no Webmotors
    await prisma.portalListing.upsert({
      where: { id: 'listing-wm-pilot-01' },
      update: {},
      create: {
        id: 'listing-wm-pilot-01',
        providerId: wmProvider.id,
        motorcycleId: motos[0].id,
        externalId: 'WM-8829104',
        externalUrl: 'https://www.webmotors.com.br/comprar/moto/honda-cb-650r',
        status: 'PUBLISHED',
        publishedPrice: motos[0].publicPrice,
        syncAttempts: 1,
        lastSyncAt: new Date(),
      },
    });

    // Anúncio 2 no OLX
    await prisma.portalListing.upsert({
      where: { id: 'listing-olx-pilot-01' },
      update: {},
      create: {
        id: 'listing-olx-pilot-01',
        providerId: olxProvider.id,
        motorcycleId: motos[0].id,
        externalId: 'OLX-9948271',
        externalUrl: 'https://sp.olx.com.br/autos-e-pecas/motos/honda-cb-650r-9948271',
        status: 'PUBLISHED',
        publishedPrice: motos[0].publicPrice,
        syncAttempts: 1,
        lastSyncAt: new Date(),
      },
    });

    console.log('Anúncios piloto Webmotors e OLX semeados com sucesso!');
  }

  console.log('Provedores semeados com sucesso!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
