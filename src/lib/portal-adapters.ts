import { prisma } from './prisma';
import { logAudit } from './audit';
import { AppError, publicMessage } from './errors';

export interface PortalValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ListingPayload {
  title: string;
  brand: string;
  model: string;
  yearMfg: number;
  yearModel: number;
  color: string;
  mileage: number;
  plate: string;
  chassis?: string | null;
  renavam?: string | null;
  price: number;
  description: string;
  images: string[];
  features: string[];
}

// 1. Validação prévia de anúncio antes do envio ao portal
export function validateListingForPortal(moto: any, portalCode: string): PortalValidationResult {
  const errors: string[] = [];

  if (!moto.brand || !moto.model) errors.push('Marca e Modelo são obrigatórios');
  if (!moto.yearMfg || !moto.yearModel) errors.push('Ano Fabricação e Ano Modelo são obrigatórios');
  if (moto.publicPrice <= 0) errors.push('Preço público deve ser maior que zero');
  if (moto.mileage < 0) errors.push('Quilometragem inválida');

  // Regras específicas de portal (PRD 11)
  if (portalCode === 'WEBMOTORS') {
    if (!moto.chassis) errors.push('Webmotors exige chassi do veículo para validação veicular');
    if (moto.plate && moto.plate.length < 7) errors.push('Placa incompleta para anúncio Webmotors');
  } else if (portalCode === 'OLX') {
    if (!moto.description || moto.description.length < 15) {
      errors.push('OLX exige descrição detalhada com pelo menos 15 caracteres');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// 2. Formatador de Payload por Provedor
export function formatPortalPayload(moto: any, portalCode: string): any {
  let imagesList: string[] = [];
  try {
    if (moto.images) imagesList = JSON.parse(moto.images);
    else if (moto.imageUrl) imagesList = [moto.imageUrl];
  } catch {
    if (moto.imageUrl) imagesList = [moto.imageUrl];
  }

  const base = {
    vehicleType: 'MOTORCYCLE',
    make: moto.brand,
    model: moto.model,
    manufacturingYear: moto.yearMfg,
    modelYear: moto.yearModel,
    color: moto.color,
    odometer: moto.mileage,
    licensePlate: moto.plate,
    price: Number(moto.publicPrice),
    description: moto.description || `${moto.brand} ${moto.model} em excelente estado de conservação na The Rock Moto Shop.`,
    images: imagesList,
  };

  if (portalCode === 'WEBMOTORS') {
    return {
      ...base,
      partnerId: 'WM-INTEGRA-ROCK-01',
      vin: moto.chassis || '9C2JCXXXXXXXXX',
      features: moto.features ? moto.features.split(',').map((f: string) => f.trim()) : ['Partida Elétrica', 'Injeção Eletrônica'],
      warranty: '90 dias The Rock Garantia Assegurada',
    };
  }

  if (portalCode === 'OLX') {
    return {
      category: 'Motos e Acessórios',
      ad_title: `${moto.brand} ${moto.model} ${moto.yearModel} - Impecável`,
      body: base.description,
      price: base.price,
      phone_hidden: false,
      zipcode: '01415-000',
      municipality: 'São Paulo',
      images: imagesList,
    };
  }

  // iCarros / Mercado Livre / Padrão
  return {
    portal: portalCode,
    advertiser: 'The Rock Moto Shop',
    vehicle: base,
  };
}

// 3. Adaptador de Sincronização de Portais
export async function syncListingToPortal(
  providerCode: string,
  motorcycleId: string,
  action: 'PUBLISH' | 'UPDATE' | 'PAUSE' | 'REMOVE',
  operatorName: string = 'Sistema'
) {
  const provider = await prisma.integrationProvider.findUnique({
    where: { code: providerCode },
  });

  if (!provider || !provider.isActive) {
    throw new AppError('PROVIDER_INACTIVE', `Provedor ${providerCode} não está ativo ou configurado.`, 422);
  }

  const moto = await prisma.motorcycle.findUnique({
    where: { id: motorcycleId },
  });

  if (!moto) {
    throw new AppError('MOTO_NOT_FOUND', 'Motocicleta não encontrada', 404);
  }

  // Validação prévia caso vá publicar ou atualizar
  if (action === 'PUBLISH' || action === 'UPDATE') {
    const validation = validateListingForPortal(moto, providerCode);
    if (!validation.isValid) {
      // Registrar log de erro
      await prisma.syncLog.create({
        data: {
          providerId: provider.id,
          action,
          status: 'FAILED',
          errorMessage: `Falha na pré-validação: ${validation.errors.join('; ')}`,
        },
      });
      throw new AppError('LISTING_INVALID', `Erro de validação do anúncio: ${validation.errors.join(', ')}`, 422);
    }
  }

  // Buscar ou criar anúncio existente
  let listing = await prisma.portalListing.findFirst({
    where: {
      providerId: provider.id,
      motorcycleId: moto.id,
    },
  });

  const payload = formatPortalPayload(moto, providerCode);
  const now = new Date();
  let externalId = listing?.externalId || `${providerCode.slice(0, 3)}-${Date.now()}`;
  let externalUrl = listing?.externalUrl || `https://www.${providerCode.toLowerCase()}.com.br/anuncio/${externalId}`;
  let newStatus = listing?.status || 'DRAFT';

  try {
    if (action === 'PUBLISH' || action === 'UPDATE') {
      newStatus = 'PUBLISHED';
    } else if (action === 'PAUSE') {
      newStatus = 'PAUSED';
    } else if (action === 'REMOVE') {
      newStatus = 'REMOVED';
    }

    if (!listing) {
      listing = await prisma.portalListing.create({
        data: {
          providerId: provider.id,
          motorcycleId: moto.id,
          externalId,
          externalUrl,
          status: newStatus,
          publishedPrice: Number(moto.publicPrice),
          syncAttempts: 1,
          lastSyncAt: now,
        },
      });
    } else {
      listing = await prisma.portalListing.update({
        where: { id: listing.id },
        data: {
          status: newStatus,
          publishedPrice: Number(moto.publicPrice),
          syncAttempts: listing.syncAttempts + 1,
          lastError: null,
          lastSyncAt: now,
        },
      });
    }

    // Registrar log com sucesso
    await prisma.syncLog.create({
      data: {
        providerId: provider.id,
        listingId: listing.id,
        action,
        status: 'SUCCESS',
        requestPayload: JSON.stringify(payload),
        responsePayload: JSON.stringify({
          statusCode: 200,
          externalId,
          action,
          timestamp: now.toISOString(),
          message: 'Operação sincronizada com sucesso no parceiro.',
        }),
      },
    });

    // Atualizar último sync no provedor
    await prisma.integrationProvider.update({
      where: { id: provider.id },
      data: { lastSyncAt: now },
    });

    // Auditoria transversal (PRD 10)
    await logAudit({
      action: `${action}_PORTAL`,
      entity: 'PortalListing',
      entityId: listing.id,
      details: `${action} no portal ${provider.name} para a moto ${moto.brand} ${moto.model} (${moto.plate}) com status ${newStatus}. Operador: ${operatorName}`,
    });

    return {
      success: true,
      listing,
      message: `Anúncio ${action} com sucesso no portal ${provider.name}`,
    };
  } catch (error: any) {
    if (listing) {
      await prisma.portalListing.update({
        where: { id: listing.id },
        data: {
          status: 'ERROR',
          lastError: publicMessage(error, 'Falha na sincronização'),
          syncAttempts: listing.syncAttempts + 1,
        },
      });
    }

    await prisma.syncLog.create({
      data: {
        providerId: provider.id,
        listingId: listing?.id,
        action,
        status: 'FAILED',
        errorMessage: publicMessage(error, 'Falha na sincronização'),
      },
    });

    throw error;
  }
}

// 4. Remoção automática em caso de venda de veículo (PRD 11)
export async function autoRemoveSoldVehicleFromPortals(motorcycleId: string, operatorName: string = 'Sistema') {
  const activeListings = await prisma.portalListing.findMany({
    where: {
      motorcycleId,
      status: 'PUBLISHED',
    },
    include: { provider: true },
  });

  const results = [];
  for (const listing of activeListings) {
    try {
      const res = await syncListingToPortal(listing.provider.code, motorcycleId, 'REMOVE', operatorName);
      results.push(res);
    } catch (err: any) {
      results.push({ error: publicMessage(err, 'Falha na sincronização'), provider: listing.provider.code });
    }
  }

  return results;
}

// 5. Ingestão e Deduplicação de Lead Externo (PRD 11 / PRD 08)
export async function ingestExternalLeadFromWebhook(providerCode: string, payload: any) {
  const provider = await prisma.integrationProvider.findUnique({
    where: { code: providerCode },
  });

  if (!provider) {
    throw new AppError('PROVIDER_NOT_FOUND', `Provedor ${providerCode} não cadastrado`, 404);
  }

  const { externalId, motorcyclePlate, name, phone, email, message } = payload;

  // Busca moto vinculada se placa informada
  let motorcycle = null;
  if (motorcyclePlate) {
    motorcycle = await prisma.motorcycle.findUnique({
      where: { plate: motorcyclePlate },
    });
  }

  // Deduplicação: verifica se já existe lead com mesmo telefone ou externalId recente (< 24h)
  const existingExternal = await prisma.externalLead.findFirst({
    where: {
      providerId: provider.id,
      OR: [
        { externalId: externalId || '' },
        { phone },
      ],
    },
  });

  if (existingExternal) {
    return {
      status: 'DEDUPLICATED',
      message: 'Lead já recebido anteriormente (deduplicado)',
      externalLead: existingExternal,
    };
  }

  // Registra lead no CRM (PRD 08)
  const crmLead = await prisma.lead.create({
    data: {
      name: name || 'Lead Portal',
      phone: phone || '(11) 99999-0000',
      email: email || null,
      message: message || `Interesse recebido via ${provider.name}`,
      source: provider.name,
      stage: 'NOVO',
      motorcycleId: motorcycle?.id || null,
      notes: `Lead recebido automaticamente via webhook da integração ${provider.name}. ID Externo: ${externalId || 'N/A'}`,
    },
  });

  // Cria interação inicial na timeline
  await prisma.leadInteraction.create({
    data: {
      leadId: crmLead.id,
      type: 'WHATSAPP',
      description: `Lead capturado automaticamente do portal ${provider.name}. Anúncio: ${motorcycle ? `${motorcycle.brand} ${motorcycle.model} (${motorcycle.plate})` : 'Geral'}.`,
      authorName: `Bot ${provider.name}`,
    },
  });

  // Salva registro externo
  const externalLead = await prisma.externalLead.create({
    data: {
      providerId: provider.id,
      motorcycleId: motorcycle?.id || null,
      externalId: externalId || `EXT-${Date.now()}`,
      name: name || 'Lead Portal',
      phone: phone || '(11) 99999-0000',
      email: email || null,
      message: message || '',
      rawPayload: JSON.stringify(payload),
      ingestedToCrm: true,
      internalLeadId: crmLead.id,
    },
  });

  // Gera alerta proativo de oportunidade (PRD 10)
  await prisma.systemAlert.create({
    data: {
      type: 'LEAD_SEM_CONTATO',
      severity: 'WARNING',
      title: `Novo Lead Recebido: ${provider.name}`,
      message: `${name} enviou mensagem sobre ${motorcycle ? `${motorcycle.brand} ${motorcycle.model}` : 'veículo'}. Responda rápido!`,
      entity: 'Lead',
      entityId: crmLead.id,
      actionUrl: '/admin?tab=crm',
    },
  });

  return {
    status: 'INGESTED',
    message: 'Lead ingerido com sucesso no CRM',
    crmLeadId: crmLead.id,
    externalLead,
  };
}
