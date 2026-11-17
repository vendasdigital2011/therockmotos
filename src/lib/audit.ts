import { prisma } from './prisma';

export interface AuditLogParams {
  userId?: string | null;
  action: string; // PRICE_CHANGE, STATUS_CHANGE, COST_ADD, COST_CANCEL, SALE_CREATE, FINANCIAL_BAIXA, FINANCIAL_CANCEL, LEAD_STAGE, LEAD_LOSS, DOCUMENT_CREATE, DOCUMENT_SIGN, LOGIN, SWITCH_USER, ACCESS_SENSITIVE
  entity: string; // Motorcycle, MotorcycleCost, Sale, FinancialEntry, Lead, DocumentContract, User
  entityId?: string | null;
  details: string;
  ipAddress?: string | null;
}

/**
 * Registra um evento na trilha de auditoria e conformidade (PRD 10).
 * Execução não-bloqueante para não interromper a operação de negócio caso ocorra falha.
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        details: params.details,
        ipAddress: params.ipAddress || '127.0.0.1',
      },
    });
  } catch (error) {
    console.error('Falha ao registrar AuditLog:', error);
  }
}

/**
 * Helper para extrair o IP do cliente a partir da Request
 */
export function extractClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
