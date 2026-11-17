import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateVehicleImport, executeVehicleImportBatch } from '@/lib/data-importer';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, rows } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Nenhum dado fornecido para importação' }, { status: 400 });
    }

    let userName = 'Operador';
    try {
      const cookieStore = await cookies();
      const email = cookieStore.get('motoflow_session')?.value;
      if (email) {
        const u = await prisma.user.findUnique({ where: { email } });
        if (u) userName = u.name;
      }
    } catch {}

    // 1. Simulação / Validação Prévia (Dry Run)
    if (action === 'dry_run') {
      const result = await validateVehicleImport(rows);
      return NextResponse.json(result);
    }

    // 2. Execução Efetiva com Transação Atômica
    if (action === 'execute') {
      const result = await executeVehicleImportBatch(rows, userName);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro na importação de dados:', error);
    return NextResponse.json({ error: error.message || 'Erro ao importar dados' }, { status: 500 });
  }
}
