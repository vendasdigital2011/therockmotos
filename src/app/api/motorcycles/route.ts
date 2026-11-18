import { NextResponse } from 'next/server';
import { requireUser, canViewFinancialCosts } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/logger';
import { publicMessage } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isPublicOnly = searchParams.get('public') === 'true';

    if (isPublicOnly) {
      // Retorna apenas dados públicos para a vitrine (sem custos internos e sem dados sensíveis como chassi/renavam)
      const motorcycles = await prisma.motorcycle.findMany({
        where: {
          isPublic: true,
          status: { in: ['DISPONIVEL', 'RESERVADA'] },
        },
        select: {
          id: true,
          brand: true,
          model: true,
          version: true,
          yearMfg: true,
          yearModel: true,
          color: true,
          mileage: true,
          displacement: true,
          fuel: true,
          condition: true,
          status: true,
          publicPrice: true,
          fipeValue: true,
          features: true,
          description: true,
          imageUrl: true,
          images: true,
          isFeatured: true,
        },
        orderBy: { entryDate: 'desc' },
      });
      return NextResponse.json(motorcycles);
    }

    // Painel interno: exige login. Custos só para perfis com acesso financeiro.
    const auth = await requireUser();
    if (auth instanceof NextResponse) return auth;

    // Painel interno: retorna dados completos com custos, tarefas/pendências, fornecedor e histórico
    const motorcycles = await prisma.motorcycle.findMany({
      include: {
        costs: {
          include: {
            supplier: {
              select: { id: true, name: true, tradeName: true, roles: true, phone: true },
            },
          },
          orderBy: { date: 'desc' },
        },
        tasks: {
          include: {
            partner: {
              select: { id: true, name: true, tradeName: true, roles: true, phone: true },
            },
          },
          orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
        },
        supplier: {
          select: { id: true, name: true, tradeName: true, document: true, phone: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { entryDate: 'desc' },
    });

    if (!canViewFinancialCosts(auth.role)) {
      return NextResponse.json(motorcycles.map((m) => ({ ...m, costs: [] })));
    }
    return NextResponse.json(motorcycles);
  } catch (error) {
    logError('Erro ao listar motos:', error);
    return NextResponse.json({ error: 'Erro ao listar motos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireUser(['ADMIN', 'GERENTE', 'ESTOQUE']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const branch = await prisma.branch.findFirst();

    if (!branch) {
      return NextResponse.json({ error: 'Nenhuma filial cadastrada' }, { status: 400 });
    }

    const {
      plate,
      brand,
      model,
      version,
      yearMfg,
      yearModel,
      color,
      mileage,
      fuel = 'Gasolina',
      displacement,
      chassis,
      renavam,
      ownership = 'PROPRIA',
      condition = 'SEMINOVA',
      status = 'DISPONIVEL',
      publicPrice,
      fipeCode,
      fipeValue,
      fipeRefMonth,
      location = 'Showroom',
      imageUrl,
      images,
      features,
      description = '',
      supplierId,
      acquisitionCost,
      isPublic: wantPublic,
    } = body;

    const missing = ['brand', 'model', 'yearMfg', 'yearModel', 'color', 'publicPrice'].filter(
      (f) => body?.[f] === undefined || body?.[f] === null || body?.[f] === ''
    );
    if (missing.length) {
      return NextResponse.json({ error: `Campos obrigatórios ausentes: ${missing.join(', ')}` }, { status: 400 });
    }

    // Pré-cadastro pode não ter placa: salva como null, sem inventar identificador.
    const cleanPlate = typeof plate === 'string' && plate.trim() ? plate.toUpperCase().trim() : null;

    // Validar se placa já existe (só quando informada)
    if (cleanPlate) {
      const existing = await prisma.motorcycle.findUnique({
        where: { plate: cleanPlate },
      });
      if (existing) {
        return NextResponse.json({ error: 'Já existe um veículo cadastrado com esta placa.' }, { status: 400 });
      }
    }

    const moto = await prisma.motorcycle.create({
      data: {
        branchId: branch.id,
        // Nova moto nasce fora da vitrine. Só ADMIN e GERENTE podem publicar já no cadastro.
        isPublic: ['ADMIN', 'GERENTE'].includes(auth.role) && wantPublic === true,
        plate: cleanPlate,
        brand,
        model,
        version,
        yearMfg: Number(yearMfg),
        yearModel: Number(yearModel),
        color,
        mileage: Number(mileage) || 0, // pré-cadastro pode não ter quilometragem ainda
        fuel,
        displacement: displacement ? Number(displacement) : null,
        chassis: chassis || null,
        renavam: renavam || null,
        ownership,
        condition,
        status,
        publicPrice: Number(publicPrice),
        fipeCode: fipeCode || null,
        fipeValue: fipeValue ? Number(fipeValue) : null,
        fipeRefMonth: fipeRefMonth || null,
        location,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop',
        images: images ? (typeof images === 'string' ? images : JSON.stringify(images)) : null,
        features: features ? (typeof features === 'string' ? features : JSON.stringify(features)) : null,
        description,
        supplierId: supplierId || null,
        costs: acquisitionCost
          ? {
              create: [
                {
                  category: 'AQUISICAO',
                  description: 'Valor de compra / aquisição do veículo',
                  amount: Number(acquisitionCost),
                  supplierId: supplierId || null,
                  createdByName: auth.name,
                },
              ],
            }
          : undefined,
        statusHistory: {
          create: [
            {
              fromStatus: 'AGUARDANDO_ENTRADA',
              toStatus: status,
              reason: 'Cadastro inicial de entrada no sistema.',
              userName: auth.name,
            },
          ],
        },
      },
      include: {
        costs: true,
        tasks: true,
        statusHistory: true,
      },
    });

    return NextResponse.json(moto, { status: 201 });
  } catch (error: any) {
    logError('Erro ao cadastrar moto:', error);
    return NextResponse.json({ error: publicMessage(error, 'Erro ao cadastrar moto') }, { status: 500 });
  }
}
