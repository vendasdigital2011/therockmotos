const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('🎯 Semeando Funil de Vendas CRM Avançado, Interações e Atividades (PRD 08)...');

  const motos = await prisma.motorcycle.findMany({ take: 5 });
  const vendedor = await prisma.user.findFirst({ where: { role: 'VENDEDOR' } });
  const gerente = await prisma.user.findFirst({ where: { role: 'GERENTE' } });

  const crmLeads = [
    {
      name: 'Thiago Alcantara',
      phone: '(48) 99188-7722',
      email: 'thiago.alcantara@hotmail.com',
      source: 'VITRINE_SITE',
      stage: 'NOVO',
      motorcycleId: motos[0]?.id || null,
      assignedToId: vendedor?.id || null,
      budget: 55000,
      nextAction: 'Ligar para primeiro contato e entender forma de pagamento',
      nextActionDate: new Date(Date.now() + 1000 * 60 * 60 * 2), // daqui a 2 horas
      message: 'Olá, tenho interesse na BMW F 850 GS. Aceitam moto na troca?',
      notes: 'Cliente interessado em dar uma Fazer 250 na troca.',
    },
    {
      name: 'Mariana Duarte',
      phone: '(48) 98833-2211',
      email: 'mari.duarte.arq@gmail.com',
      source: 'WHATSAPP',
      stage: 'CONTATO',
      motorcycleId: motos[1]?.id || null,
      assignedToId: vendedor?.id || null,
      budget: 45000,
      nextAction: 'Enviar simulação de financiamento Santander em 36x e 48x',
      nextActionDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // amanhã
      message: 'Gostaria de saber o valor da parcela com R$ 15.000 de entrada.',
      notes: 'Score bom, já aprovou crédito antes pelo Santander.',
    },
    {
      name: 'Felipe Silveira',
      phone: '(48) 99944-5566',
      email: 'felipe.silveira@tech.com',
      source: 'WEBMOTORS',
      stage: 'VISITA_AGENDADA',
      motorcycleId: motos[2]?.id || null,
      assignedToId: vendedor?.id || null,
      budget: 68000,
      nextAction: 'Recepcionar cliente no Showroom para Test-Ride às 10h',
      nextActionDate: new Date(Date.now() + 1000 * 60 * 60 * 48), // sábado
      message: 'Vi o anúncio na Webmotors. A moto ainda está disponível no showroom?',
      notes: 'Visita agendada para sábado às 10h com test-ride.',
    },
    {
      name: 'Rodrigo Santoro Ramos',
      phone: '(48) 98455-1234',
      email: 'rodrigo.ramos@adv.com.br',
      source: 'BALCAO_PRESENCIAL',
      stage: 'PROPOSTA',
      motorcycleId: motos[0]?.id || null,
      assignedToId: gerente?.id || null,
      budget: 52000,
      nextAction: 'Aguardando retorno do cliente sobre proposta com emplacamento cortesia',
      nextActionDate: new Date(Date.now() + 1000 * 60 * 60 * 6),
      message: 'Proposta de R$ 52.000 à vista no PIX com transferência inclusa.',
      notes: 'Cliente decide hoje à tarde após conversar com a esposa.',
    },
    {
      name: 'Lucas Mendes',
      phone: '(48) 98811-4455',
      email: 'lucas.mendes@gmail.com',
      source: 'OLX',
      stage: 'PERDIDO',
      lossReason: 'Financiamento reprovado pelo banco (Score insuficiente)',
      motorcycleId: motos[1]?.id || null,
      assignedToId: vendedor?.id || null,
      message: 'Quero financiar sem entrada na Yamaha MT-07.',
      notes: 'Banco reprovou ficha sem entrada. Oferecido avalista mas não possui.',
    },
  ];

  for (const leadData of crmLeads) {
    const lead = await prisma.lead.create({
      data: leadData,
    });

    // Criar histórico de interações (PRD 08)
    if (lead.stage === 'CONTATO' || lead.stage === 'VISITA_AGENDADA' || lead.stage === 'PROPOSTA') {
      await prisma.leadInteraction.createMany({
        data: [
          {
            leadId: lead.id,
            type: 'WHATSAPP',
            description: 'Envio de fotos e vídeo detalhado da moto ligada no pátio.',
            authorName: vendedor?.name || 'Vendedor Lucas',
          },
          {
            leadId: lead.id,
            type: 'LIGACAO',
            description: 'Ligação telefônica alinhando condições de pagamento e agendamento.',
            authorName: vendedor?.name || 'Vendedor Lucas',
          },
        ],
      });
    }

    // Criar atividade / próxima ação (PRD 08)
    if (lead.nextAction && lead.nextActionDate) {
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          title: lead.nextAction,
          dueDate: lead.nextActionDate,
          status: 'PENDENTE',
        },
      });
    }
  }

  console.log('✅ Base de Leads e CRM enriquecida com sucesso!');
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
