import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isValidDocument, maskDocument } from '@/lib/documents-br';

// Perfis que veem o CPF/CNPJ completo. Os demais veem só os 2 últimos dígitos (LGPD).
const SEE_FULL_DOCUMENT = ['ADMIN', 'GERENTE', 'FINANCEIRO'];

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const role = searchParams.get('role'); // CLIENTE, FORNECEDOR, OFICINA, DESPACHANTE

    const canSeeDoc = SEE_FULL_DOCUMENT.includes(auth.role);
    const where: any = { active: true };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { tradeName: { contains: search } },
        // Documento só entra na busca para quem vê o documento completo: evita
        // descobrir CPFs por tentativa (busca) com dado mascarado.
        ...(canSeeDoc ? [{ document: { contains: search } }] : []),
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (role && role !== 'ALL') {
      where.roles = { contains: role };
    }

    const people = await prisma.customer.findMany({
      where,
      include: {
        sales: {
          select: {
            id: true,
            saleDate: true,
            salePrice: true,
            motorcycle: { select: { brand: true, model: true, plate: true } },
          },
        },
        leads: {
          select: {
            id: true,
            stage: true,
            source: true,
            createdAt: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(canSeeDoc ? people : people.map((p) => ({ ...p, document: maskDocument(p.document) })));
  } catch (error: any) {
    console.error('Erro ao listar pessoas:', error);
    return NextResponse.json({ error: 'Erro ao listar pessoas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const {
      name,
      tradeName,
      personType = 'PF',
      roles = 'CLIENTE',
      document,
      phone,
      email,
      postalCode,
      address,
      neighborhood,
      city = 'Florianópolis',
      state = 'SC',
      notes,
    } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Nome e telefone são obrigatórios' }, { status: 400 });
    }

    // Detecção de duplicidades (PRD 02 Critério de aceite)
    const cleanPhone = phone.trim();
    const cleanDoc = document ? String(document).trim() : null;
    if (cleanDoc && !isValidDocument(cleanDoc)) {
      return NextResponse.json({ error: 'CPF/CNPJ inválido. Verifique os números digitados.' }, { status: 400 });
    }

    if (cleanDoc) {
      const existingDoc = await prisma.customer.findFirst({
        where: { document: cleanDoc },
      });
      if (existingDoc) {
        return NextResponse.json(
          { error: `Já existe um cadastro com este CPF/CNPJ: ${existingDoc.name}` },
          { status: 409 }
        );
      }
    }

    const existingPhone = await prisma.customer.findFirst({
      where: { phone: cleanPhone },
    });
    if (existingPhone) {
      return NextResponse.json(
        { error: `Já existe um cadastro com este telefone: ${existingPhone.name}` },
        { status: 409 }
      );
    }

    const person = await prisma.customer.create({
      data: {
        name,
        tradeName: tradeName || null,
        personType,
        roles,
        document: cleanDoc,
        phone: cleanPhone,
        email: email ? email.trim().toLowerCase() : null,
        postalCode,
        address,
        neighborhood,
        city,
        state,
        notes,
      },
    });

    return NextResponse.json(person, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao cadastrar pessoa' }, { status: 500 });
  }
}
