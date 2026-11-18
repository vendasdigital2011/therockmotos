import { prisma } from './prisma';
import { logAudit } from './audit';
import { AppError } from './errors';

export interface CreateServiceOrderParams {
  motorcycleId: string;
  customerId: string;
  type?: string; // GARANTIA_90D_CDC, MANUTENCAO_REVISAO, ACESSORIOS
  complaintDescription: string;
  mechanicName?: string;
  items?: Array<{
    type: 'PECA' | 'SERVICO';
    description: string;
    quantity: number;
    unitCost: number;
  }>;
  operatorName?: string;
}

export async function checkWarrantyEligibility(motorcycleId: string): Promise<{
  isEligible: boolean;
  saleDate?: Date;
  daysSinceSale?: number;
  remainingDays?: number;
}> {
  const sale = await prisma.sale.findFirst({
    where: { motorcycleId },
    orderBy: { saleDate: 'desc' },
  });

  if (!sale) {
    return { isEligible: false };
  }

  const saleDate = new Date(sale.saleDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - saleDate.getTime());
  const daysSinceSale = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const remainingDays = 90 - daysSinceSale;

  return {
    isEligible: daysSinceSale <= 90,
    saleDate,
    daysSinceSale,
    remainingDays: remainingDays > 0 ? remainingDays : 0,
  };
}

export async function createServiceOrder(params: CreateServiceOrderParams) {
  const {
    motorcycleId,
    customerId,
    type = 'GARANTIA_90D_CDC',
    complaintDescription,
    mechanicName = 'Oficina Parceira Rock',
    items = [],
    operatorName = 'Sistema',
  } = params;

  const count = await prisma.serviceOrder.count();
  const code = `OS-2026-${String(count + 1).padStart(4, '0')}`;

  // Calcula totais
  let totalParts = 0;
  let totalLabor = 0;
  items.forEach((item) => {
    const cost = item.quantity * item.unitCost;
    if (item.type === 'PECA') totalParts += cost;
    if (item.type === 'SERVICO') totalLabor += cost;
  });
  const totalCost = totalParts + totalLabor;

  // Verifica elegibilidade de garantia CDC 90 dias
  const warrantyCheck = await checkWarrantyEligibility(motorcycleId);

  const os = await prisma.serviceOrder.create({
    data: {
      code,
      motorcycleId,
      customerId,
      type,
      status: 'ABERTA',
      complaintDescription,
      mechanicName,
      warrantyApproved: type === 'GARANTIA_90D_CDC' ? warrantyCheck.isEligible : false,
      totalParts,
      totalLabor,
      totalCost,
      checklistDelivery: JSON.stringify({
        fluidLevels: true,
        brakePads: true,
        tirePressure: true,
        roadTest: true,
        cleaned: true,
      }),
      items: {
        create: items.map((i) => ({
          type: i.type,
          description: i.description,
          quantity: i.quantity,
          unitCost: i.unitCost,
          totalCost: i.quantity * i.unitCost,
        })),
      },
    },
    include: {
      items: true,
      motorcycle: true,
      customer: true,
    },
  });

  await logAudit({
    action: 'SERVICE_ORDER_CREATE',
    entity: 'ServiceOrder',
    entityId: os.id,
    details: `Ordem de Serviço ${code} aberta para moto ${os.motorcycle.brand} ${os.motorcycle.model} (${os.motorcycle.plate}). Motivo: ${complaintDescription}. Garantia 90D: ${warrantyCheck.isEligible ? 'Coberta' : 'Não Coberta'}. Operador: ${operatorName}`,
  });

  return os;
}

export async function finalizeServiceOrder(
  orderId: string,
  solutionNotes: string,
  operatorName: string = 'Sistema'
) {
  const os = await prisma.serviceOrder.findUnique({
    where: { id: orderId },
    include: { motorcycle: true, customer: true, items: true },
  });

  if (!os) {
    throw new AppError('SERVICE_ORDER_NOT_FOUND', 'Ordem de serviço não encontrada', 404);
  }

  const now = new Date();
  const updated = await prisma.serviceOrder.update({
    where: { id: orderId },
    data: {
      status: 'FINALIZADA',
      solutionNotes,
      closedAt: now,
    },
  });

  // PRD 13: Custo de garantia NÃO entra no custo de estoque da moto (que já foi vendida),
  // e sim como despesa de pós-venda/garantia no DRE da loja!
  if (os.totalCost > 0) {
    await prisma.financialEntry.create({
      data: {
        motorcycleId: os.motorcycleId,
        customerId: os.customerId,
        type: 'DESPESA',
        category: 'OFICINA_MECANICA',
        costCenter: 'OFICINA',
        description: `Pós-Venda / Garantia OS ${os.code} · ${os.motorcycle.brand} ${os.motorcycle.model} (${solutionNotes.slice(0, 50)})`,
        amount: os.totalCost,
        dueDate: now,
        paymentDate: now,
        status: 'PAGO',
        notes: `Despesa contábil de garantia pós-venda da OS ${os.code}. Não altera o custo histórico do veículo vendido.`,
      },
    });
  }

  await logAudit({
    action: 'SERVICE_ORDER_CLOSE',
    entity: 'ServiceOrder',
    entityId: os.id,
    details: `Ordem de Serviço ${os.code} finalizada. Custo total registrado no financeiro: R$ ${os.totalCost.toFixed(2)}. Solução: ${solutionNotes}. Operador: ${operatorName}`,
  });

  return updated;
}
