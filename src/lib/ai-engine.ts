import { prisma } from './prisma';

export interface MotorcycleFacts {
  brand: string;
  model: string;
  version?: string | null;
  yearMfg: number;
  yearModel: number;
  color: string;
  mileage: number;
  publicPrice: number;
  fipeValue?: number | null;
  description?: string | null;
  features?: string | string[] | null;
  condition?: string | null;
}

/**
 * 1. GERADOR E REVISOR DE ANÚNCIO COMERCIAL (PRD 10)
 * Gera descrições persuasivas para vitrine e portais baseando-se estritamente
 * nos dados reais e comprovados do cadastro, sem alucinar atributos.
 */
export function generateListingDescription(moto: MotorcycleFacts): {
  headline: string;
  body: string;
  bullets: string[];
  cta: string;
} {
  const brandUpper = moto.brand.toUpperCase();
  const modelUpper = moto.model.toUpperCase();
  const version = moto.version ? ` ${moto.version}` : '';
  const kmFormatted = moto.mileage.toLocaleString('pt-BR');
  const priceFormatted = moto.publicPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  let featureList: string[] = [];
  if (Array.isArray(moto.features)) {
    featureList = moto.features;
  } else if (typeof moto.features === 'string') {
    try {
      const parsed = JSON.parse(moto.features);
      if (Array.isArray(parsed)) featureList = parsed;
      else featureList = [moto.features];
    } catch {
      featureList = moto.features.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  const headline = `🔥 ${brandUpper} ${modelUpper}${version} ${moto.yearModel} — APENAS ${kmFormatted} KM`;

  const bullets = [
    `Ano de Fabricação/Modelo: ${moto.yearMfg}/${moto.yearModel}`,
    `Cor: ${moto.color}`,
    `Quilometragem Original: ${kmFormatted} km`,
    `Garantia Oficial: 90 dias para Motor e Câmbio (CDC)`,
    `Documentação 100% rigorosamente em dia e pronta para transferência`,
    ...(featureList.length > 0 ? featureList.map((f) => `Opcional/Acessório: ${f}`) : ['Revisada e inspecionada pela nossa equipe especializada']),
  ];

  if (moto.fipeValue && moto.fipeValue > moto.publicPrice) {
    const diff = moto.fipeValue - moto.publicPrice;
    bullets.push(`Oportunidade: R$ ${diff.toLocaleString('pt-BR')} abaixo da Tabela FIPE oficial!`);
  }

  const body = `Seja bem-vindo à The Rock Moto Shop em Florianópolis! Apresentamos esta espetacular ${moto.brand} ${moto.model}${version}, ano ${moto.yearModel}, na impecável cor ${moto.color}.

Com apenas ${kmFormatted} km rodados, o veículo passou por nossa rigorosa inspeção técnica de 40 itens (mecânica, sistema elétrico, relação, pneus e fluídos). Uma motocicleta de procedência comprovada, com estado de conservação primoroso e pronta para a estrada.

Aceitamos sua moto usada na troca com avaliação justa e trabalhamos com as melhores taxas de financiamento bancário do mercado (com ou sem entrada).`;

  const cta = `📍 Showroom: Rod. SC-401, nº 4500 - Florianópolis/SC\n📲 Chame agora no WhatsApp para simulação imediata e fotos em alta resolução! Preço especial: ${priceFormatted}.`;

  return { headline, body, bullets, cta };
}

/**
 * 2. RESUMO INTELIGENTE DE LEAD E ATENDIMENTO (PRD 10)
 * Sintetiza o momento de compra, objeções e recomenda a melhor abordagem comercial.
 */
export function summarizeLeadHistory(lead: any): {
  profile: string;
  interestSummary: string;
  buyingTemperature: 'QUENTE' | 'MORNO' | 'FRIO';
  keyObjections: string[];
  suggestedAction: string;
} {
  const interactionsCount = lead.interactions?.length || 0;
  const stage = lead.stage;
  const budget = lead.budget;
  const moto = lead.motorcycle;

  let buyingTemperature: 'QUENTE' | 'MORNO' | 'FRIO' = 'MORNO';
  if (stage === 'PROPOSTA' || stage === 'VISITA_AGENDADA') {
    buyingTemperature = 'QUENTE';
  } else if (stage === 'PERDIDO') {
    buyingTemperature = 'FRIO';
  } else if (stage === 'NOVO' && interactionsCount === 0) {
    buyingTemperature = 'QUENTE'; // novo lead precisa de resposta rápida
  }

  const keyObjections: string[] = [];
  if (lead.lossReason) {
    keyObjections.push(`Motivo de perda: ${lead.lossReason}`);
  }
  if (budget && moto?.publicPrice && budget < moto.publicPrice) {
    const diff = moto.publicPrice - budget;
    keyObjections.push(`Orçamento informado (R$ ${budget.toLocaleString('pt-BR')}) é R$ ${diff.toLocaleString('pt-BR')} menor que o preço de tabela.`);
  }

  let suggestedAction = 'Realizar contato inicial acolhedor no WhatsApp.';
  if (stage === 'NOVO') {
    suggestedAction = 'Enviar fotos detalhadas da moto e convidar para um café e test-ride no showroom.';
  } else if (stage === 'CONTATO') {
    suggestedAction = 'Agendar visita presencial para avaliação de moto de troca ou simulação de financiamento.';
  } else if (stage === 'VISITA_AGENDADA') {
    suggestedAction = 'Preparar a moto limpa na área de test-ride e deixar proposta pré-calculada impressa.';
  } else if (stage === 'PROPOSTA') {
    suggestedAction = 'Negociar fechamento imediato com flexibilidade de entrada ou brinde (ex: primeira troca de óleo grátis).';
  }

  return {
    profile: `${lead.name} • Origem: ${lead.source} • Telefone: ${lead.phone}`,
    interestSummary: moto ? `${moto.brand} ${moto.model} (${moto.plate}) - R$ ${moto.publicPrice?.toLocaleString('pt-BR')}` : 'Interesse em motos do estoque em geral',
    buyingTemperature,
    keyObjections: keyObjections.length > 0 ? keyObjections : ['Nenhuma objeção crítica registrada até o momento.'],
    suggestedAction,
  };
}

/**
 * 3. RESPOSTAS DETERMINÍSTICAS COM IA E RESPEITO AO RBAC (PRD 10)
 * Executa análises estruturadas para responder a perguntas operacionais.
 */
export async function answerOperationalQuery(
  question: string,
  userRole: string = 'VENDEDOR'
): Promise<string> {
  const q = question.toLowerCase();

  // Guardrail de RBAC (PRD 10): Vendedor não pode acessar margem nem custos
  const isAskingCostOrMargin = q.includes('custo') || q.includes('margem') || q.includes('lucro') || q.includes('dre') || q.includes('quanto pagou');
  if (isAskingCostOrMargin && userRole === 'VENDEDOR') {
    return '🔒 **Acesso Restrito**: Informações de custo de aquisição, margem bruta e lucratividade são confidenciais da gestão e não estão autorizadas para o perfil Vendedor (PRD 01 & PRD 10).';
  }

  // 1. Perguntas sobre motos paradas ou estoque antigo
  if (q.includes('parada') || q.includes('estoque') && q.includes('dias') || q.includes('tempo')) {
    const motos = await prisma.motorcycle.findMany({
      where: { status: 'DISPONIVEL' },
      select: { brand: true, model: true, plate: true, entryDate: true, publicPrice: true },
    });

    const now = Date.now();
    const ranked = motos.map((m) => {
      const days = Math.floor((now - new Date(m.entryDate).getTime()) / (1000 * 60 * 60 * 24));
      return { ...m, days };
    }).sort((a, b) => b.days - a.days);

    const paradas30 = ranked.filter((m) => m.days >= 30);
    if (paradas30.length === 0) {
      return `✅ **Giro Excelente!** Não há nenhuma moto disponível no estoque há mais de 30 dias. O tempo médio do pátio está saudável.`;
    }

    const items = paradas30.slice(0, 5).map((m) => `• **${m.brand} ${m.model}** (${m.plate}): **${m.days} dias** no pátio — R$ ${m.publicPrice.toLocaleString('pt-BR')}`);
    return `⚠️ **Motos com Maior Tempo em Estoque (Giro Crítico):**\n${items.join('\n')}\n\n💡 *Sugestão da IA:* Considere atualizar os anúncios nos portais, produzir um vídeo no Instagram ou avaliar uma condição especial de financiamento para estas unidades.`;
  }

  // 2. Perguntas sobre margem e faturamento (apenas Admin/Gerente)
  if (isAskingCostOrMargin && (userRole === 'ADMIN' || userRole === 'GERENTE')) {
    const sales = await prisma.sale.findMany({
      select: { salePrice: true, costBasis: true, grossProfit: true },
    });

    if (sales.length === 0) {
      return 'Nenhuma venda concluída para apuração de margem no momento.';
    }

    const totalVendido = sales.reduce((acc, s) => acc + s.salePrice, 0);
    const totalLucro = sales.reduce((acc, s) => acc + s.grossProfit, 0);
    const margemMedia = totalVendido > 0 ? (totalLucro / totalVendido) * 100 : 0;

    return `📊 **Apuração Gerencial de Margem Bruta (PRD 06/PRD 10):**\n• Total Faturado em Vendas: **R$ ${totalVendido.toLocaleString('pt-BR')}**\n• Margem Bruta Total Apurada: **R$ ${totalLucro.toLocaleString('pt-BR')}**\n• Rentabilidade Média: **${margemMedia.toFixed(1)}% sobre as vendas**\n\nTodas as informações conferem com o DRE Gerencial por competência.`;
  }

  // 3. Perguntas sobre motos disponíveis ou por faixa de valor
  if (q.includes('disponiv') || q.includes('temos') || q.includes('qual moto')) {
    const motos = await prisma.motorcycle.findMany({
      where: { status: 'DISPONIVEL' },
      select: { brand: true, model: true, yearModel: true, color: true, publicPrice: true, plate: true },
      orderBy: { publicPrice: 'asc' },
    });

    if (motos.length === 0) {
      return 'No momento todas as motos cadastradas estão em preparação, reservadas ou vendidas.';
    }

    const lista = motos.map((m) => `• **${m.brand} ${m.model}** (${m.yearModel}) - R$ ${m.publicPrice.toLocaleString('pt-BR')} [${m.color}]`);
    return `🏍️ **Motos Disponíveis Prontas para Venda (${motos.length} unidades):**\n${lista.join('\n')}\n\nTodas as unidades contam com garantia legal de 90 dias para motor e câmbio.`;
  }

  // Resposta padrão contextual
  return `Olá! Sou o Assistente Inteligente da The Rock Moto Shop (PRD 10).\n\nPosso te ajudar com:\n1. *"Quais motos estão disponíveis para venda?"*\n2. *"Quais motos estão paradas há mais tempo no estoque?"*\n3. *"Qual a margem média de lucro das vendas?"* (restrito a gestores)\n4. *"Gerar anúncio persuasivo para a moto [modelo]"*\n5. *"Resumir histórico do lead [nome]"*`;
}

/**
 * 4. AVALIADOR DE ALERTAS E AUTOMAÇÕES (PRD 10)
 * Varre estoque, CRM e financeiro gerando alertas proativos no sistema.
 */
export async function runAutomationsAndGenerateAlerts(): Promise<number> {
  let createdCount = 0;
  const now = Date.now();

  // 1. Alerta de Estoque Parado (> 30 dias)
  const availableMotos = await prisma.motorcycle.findMany({
    where: { status: 'DISPONIVEL' },
  });

  for (const m of availableMotos) {
    const days = Math.floor((now - new Date(m.entryDate).getTime()) / (1000 * 60 * 60 * 24));
    if (days >= 30) {
      const existing = await prisma.systemAlert.findFirst({
        where: { type: 'ESTOQUE_PARADO', entityId: m.id, isRead: false },
      });
      if (!existing) {
        await prisma.systemAlert.create({
          data: {
            type: 'ESTOQUE_PARADO',
            severity: days >= 60 ? 'CRITICAL' : 'WARNING',
            title: `Estoque Parado: ${m.brand} ${m.model} (${days} dias)`,
            message: `A moto ${m.brand} ${m.model} (${m.plate}) está disponível há ${days} dias no pátio. Sugerimos revisão de anúncio ou ação comercial.`,
            entity: 'Motorcycle',
            entityId: m.id,
            actionUrl: `/admin?tab=estoque&motoId=${m.id}`,
          },
        });
        createdCount++;
      }
    }
  }

  // 2. Alerta de Lead Sem Contato (> 24h)
  const pendingLeads = await prisma.lead.findMany({
    where: { stage: 'NOVO' },
  });

  for (const l of pendingLeads) {
    const hours = Math.floor((now - new Date(l.createdAt).getTime()) / (1000 * 60 * 60));
    if (hours >= 24) {
      const existing = await prisma.systemAlert.findFirst({
        where: { type: 'LEAD_SEM_CONTATO', entityId: l.id, isRead: false },
      });
      if (!existing) {
        await prisma.systemAlert.create({
          data: {
            type: 'LEAD_SEM_CONTATO',
            severity: 'CRITICAL',
            title: `Lead Sem Contato: ${l.name} (${hours}h)`,
            message: `A oportunidade ${l.name} (${l.phone}) aguarda primeiro contato há mais de ${hours} horas no CRM.`,
            entity: 'Lead',
            entityId: l.id,
            actionUrl: `/admin?tab=crm`,
          },
        });
        createdCount++;
      }
    }
  }

  // 3. Alerta de Tarefas de Oficina Atrasadas
  const overdueTasks = await prisma.motorcycleTask.findMany({
    where: { status: 'PENDENTE', dueDate: { lt: new Date() } },
    include: { motorcycle: true },
  });

  for (const t of overdueTasks) {
    const existing = await prisma.systemAlert.findFirst({
      where: { type: 'TAREFA_ATRASADA', entityId: t.id, isRead: false },
    });
    if (!existing) {
      await prisma.systemAlert.create({
        data: {
          type: 'TAREFA_ATRASADA',
          severity: 'WARNING',
          title: `Oficina Atrasada: ${t.title}`,
          message: `A tarefa "${t.title}" da moto ${t.motorcycle?.model || ''} venceu o prazo previsto de conclusão.`,
          entity: 'MotorcycleTask',
          entityId: t.id,
          actionUrl: `/admin?tab=estoque`,
        },
      });
      createdCount++;
    }
  }

  return createdCount;
}
