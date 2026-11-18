import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { validateVehicleImport, executeVehicleImportBatch } from '@/lib/data-importer';
import { logError } from '@/lib/logger';
import { publicMessage } from '@/lib/errors';

export async function POST(request: Request) {
  const auth = await requireUser(['ADMIN', 'GERENTE']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { action, rows } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Nenhum dado fornecido para importação' }, { status: 400 });
    }
    if (rows.length > 1000) {
      return NextResponse.json({ error: 'Máximo de 1000 linhas por importação' }, { status: 400 });
    }

    const userName = auth.name;

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
    logError('Erro na importação de dados:', error);
    return NextResponse.json({ error: publicMessage(error, 'Erro ao importar dados') }, { status: 500 });
  }
}
