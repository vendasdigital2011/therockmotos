const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('🚀 Enriquecendo estoque com PRD 03 & 04 (FIPE, Opcionais, Custos Detalhados e Pendências)...');

  // Buscar parceiros
  const oficina = await prisma.customer.findFirst({ where: { roles: { contains: 'OFICINA' } } });
  const despachante = await prisma.customer.findFirst({ where: { roles: { contains: 'DESPACHANTE' } } });
  const fornecedor = await prisma.customer.findFirst({ where: { roles: { contains: 'FORNECEDOR' } } });

  const motos = await prisma.motorcycle.findMany();

  const mockDataByModel = {
    'MT-07': {
      displacement: 689,
      fipeCode: '005399-6',
      fipeValue: 45800,
      fipeRefMonth: 'Novembro/2026',
      features: JSON.stringify(['Freios ABS', 'Painel Digital LCD', 'Iluminação Full LED', 'Refrigeração Líquida', 'Slider Lateral Procton']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop'
      ]),
      ownership: 'PROPRIA',
      condition: 'SEMINOVA'
    },
    'Tiger 900': {
      displacement: 888,
      fipeCode: '047055-4',
      fipeValue: 68900,
      fipeRefMonth: 'Novembro/2026',
      features: JSON.stringify(['Freios Brembo Stylema', 'Painel TFT 7"', 'Modos de Pilotagem', 'Aquecedor de Manoplas', 'Controle de Tração', 'Protetor de Motor', 'Quickshifter']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop'
      ]),
      ownership: 'CONSIGNADA',
      condition: 'SEMINOVA'
    },
    'CB 500F': {
      displacement: 471,
      fipeCode: '004423-7',
      fipeValue: 36200,
      fipeRefMonth: 'Novembro/2026',
      features: JSON.stringify(['Freios ABS Duplo', 'Suspensão Invertida Showa SFF-BP', 'Iluminação Full LED', 'Embreagem Deslizante', 'Computador de Bordo']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop'
      ]),
      ownership: 'PROPRIA',
      condition: 'SEMINOVA'
    },
    'F 850 GS': {
      displacement: 853,
      fipeCode: '009252-5',
      fipeValue: 64500,
      fipeRefMonth: 'Novembro/2026',
      features: JSON.stringify(['Painel TFT Conectividade', 'Keyless Ride', 'Farol em LED com DRL', 'Controle Dinâmico de Tração (DTC)', 'ABS Pro em Curvas', 'Suporte de Malas']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop'
      ]),
      ownership: 'PROPRIA',
      condition: 'SEMINOVA'
    },
    'Z900': {
      displacement: 948,
      fipeCode: '019056-0',
      fipeValue: 53900,
      fipeRefMonth: 'Novembro/2026',
      features: JSON.stringify(['4 Cilindros em Linha', 'Painel TFT Colorido', 'Modos de Potência', 'Controle de Tração KTRC', 'Conectividade Bluetooth RIDEOLOGY']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop'
      ]),
      ownership: 'PROPRIA',
      condition: 'SEMINOVA'
    },
    'CG 160 Titan': {
      displacement: 162,
      fipeCode: '004445-8',
      fipeValue: 17200,
      fipeRefMonth: 'Novembro/2026',
      features: JSON.stringify(['Freios CBS', 'Partida Elétrica', 'Injeção Eletrônica PGM-FI', 'Painel Digital Blackout', 'Rodas de Liga Leve']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop'
      ]),
      ownership: 'PROPRIA',
      condition: 'USADA'
    }
  };

  for (const moto of motos) {
    const key = Object.keys(mockDataByModel).find(k => moto.model.includes(k) || moto.brand.includes(k));
    const enrichment = key ? mockDataByModel[key] : {
      displacement: 300,
      fipeCode: '001234-5',
      fipeValue: moto.publicPrice * 1.05,
      fipeRefMonth: 'Novembro/2026',
      features: JSON.stringify(['Freios ABS', 'Injeção Eletrônica', 'Partida Elétrica']),
      images: JSON.stringify([moto.imageUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop']),
      ownership: 'PROPRIA',
      condition: 'SEMINOVA'
    };

    await prisma.motorcycle.update({
      where: { id: moto.id },
      data: {
        displacement: enrichment.displacement,
        fipeCode: enrichment.fipeCode,
        fipeValue: enrichment.fipeValue,
        fipeRefMonth: enrichment.fipeRefMonth,
        features: enrichment.features,
        images: enrichment.images,
        ownership: enrichment.ownership,
        condition: enrichment.condition,
        supplierId: fornecedor?.id || null,
      }
    });

    // Criar histórico de entrada
    const existingHist = await prisma.motorcycleStatusHistory.findFirst({ where: { motorcycleId: moto.id } });
    if (!existingHist) {
      await prisma.motorcycleStatusHistory.create({
        data: {
          motorcycleId: moto.id,
          fromStatus: 'AGUARDANDO_ENTRADA',
          toStatus: moto.status,
          reason: 'Entrada física no estoque e conferência de chassi/motor.',
          userName: 'Carlos Silva (Gerente)',
        }
      });
    }

    // Criar pendências operacionais (PRD 04)
    const existingTasks = await prisma.motorcycleTask.count({ where: { motorcycleId: moto.id } });
    if (existingTasks === 0) {
      if (moto.status === 'EM_PREPARACAO') {
        await prisma.motorcycleTask.createMany({
          data: [
            {
              motorcycleId: moto.id,
              type: 'REVISAO_MECANICA',
              title: 'Revisão preventiva: troca de óleo e filtro',
              description: 'Realizar troca de óleo Motul 5100 e filtro original.',
              priority: 'ALTA',
              status: 'EM_ANDAMENTO',
              assignedTo: 'Mecânico Chefe Roberto',
              partnerId: oficina?.id || null,
              costEstimate: 280,
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // daqui a 2 dias
            },
            {
              motorcycleId: moto.id,
              type: 'ESTETICA',
              title: 'Polimento técnico e vitrificação de pintura',
              description: 'Remoção de micro riscos e higienização do motor.',
              priority: 'MEDIA',
              status: 'ABERTA',
              assignedTo: 'Studio Detailing',
              costEstimate: 350,
              dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            },
            {
              motorcycleId: moto.id,
              type: 'DOCUMENTAL',
              title: 'Emissão de Laudo Cautelar e ATPV-e',
              description: 'Vistoria de procedência e checklist Detran.',
              priority: 'URGENTE',
              status: 'ABERTA',
              partnerId: despachante?.id || null,
              costEstimate: 180,
              dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            }
          ]
        });
      } else {
        await prisma.motorcycleTask.create({
          data: {
            motorcycleId: moto.id,
            type: 'REVISAO_MECANICA',
            title: 'Checklist de entrega e lubrificação de corrente',
            description: 'Conferência de calibragem de pneus e aperto de porcas.',
            priority: 'MEDIA',
            status: 'CONCLUIDA',
            completedAt: new Date(),
            assignedTo: 'Roberto Mecânico',
            partnerId: oficina?.id || null,
            costEstimate: 120,
          }
        });
      }
    }

    // Criar custos adicionais (PRD 04: Oficina, Peças, Documentação)
    const existingPrepCost = await prisma.motorcycleCost.findFirst({
      where: { motorcycleId: moto.id, category: 'OFICINA_MECANICA' }
    });
    if (!existingPrepCost) {
      await prisma.motorcycleCost.createMany({
        data: [
          {
            motorcycleId: moto.id,
            category: 'OFICINA_MECANICA',
            description: 'Troca de pastilhas de freio e fluido DOT 4',
            amount: 320.0,
            status: 'PAGO',
            isCredit: false,
            supplierId: oficina?.id || null,
            createdByName: 'Carlos Silva',
          },
          {
            motorcycleId: moto.id,
            category: 'DOCUMENTACAO',
            description: 'Taxa Detran transferência e laudo cautelar',
            amount: 240.0,
            status: 'PAGO',
            isCredit: false,
            supplierId: despachante?.id || null,
            createdByName: 'Juliana Costa',
          }
        ]
      });
    }
  }

  console.log('✅ Estoque atualizado com sucesso com todos os parâmetros do PRD 03 & 04!');
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
