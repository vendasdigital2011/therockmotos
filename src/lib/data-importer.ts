import { prisma } from './prisma';
import { logAudit } from './audit';

export interface VehicleImportRow {
  plate: string;
  brand: string;
  model: string;
  yearMfg: number;
  yearModel: number;
  color: string;
  mileage: number;
  publicPrice: number;
  costPrice?: number;
  chassis?: string;
  renavam?: string;
  fuel?: string;
}

export interface DryRunValidationResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: Array<{
    rowNumber: number;
    plate?: string;
    field: string;
    message: string;
  }>;
  preview: any[];
}

export async function validateVehicleImport(rows: VehicleImportRow[]): Promise<DryRunValidationResult> {
  const errors: Array<{
    rowNumber: number;
    plate?: string;
    field: string;
    message: string;
  }> = [];

  const existingPlates = new Set((await prisma.motorcycle.findMany({ select: { plate: true } })).map((m) => m.plate.toUpperCase().trim()));
  const existingChassis = new Set((await prisma.motorcycle.findMany({ where: { chassis: { not: null } }, select: { chassis: true } })).map((m) => m.chassis?.toUpperCase().trim()));

  const seenInBatchPlates = new Set<string>();
  const seenInBatchChassis = new Set<string>();

  const preview: any[] = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 1;
    let rowValid = true;

    const plate = (row.plate || '').toUpperCase().trim();
    if (!plate || plate.length < 7) {
      errors.push({ rowNumber: rowNum, plate, field: 'plate', message: 'Placa inválida ou vazia.' });
      rowValid = false;
    } else if (existingPlates.has(plate)) {
      errors.push({ rowNumber: rowNum, plate, field: 'plate', message: `Placa ${plate} já existe no banco de dados.` });
      rowValid = false;
    } else if (seenInBatchPlates.has(plate)) {
      errors.push({ rowNumber: rowNum, plate, field: 'plate', message: `Placa duplicada dentro da mesma planilha.` });
      rowValid = false;
    } else {
      seenInBatchPlates.add(plate);
    }

    if (!row.brand || row.brand.trim().length === 0) {
      errors.push({ rowNumber: rowNum, plate, field: 'brand', message: 'Marca é obrigatória.' });
      rowValid = false;
    }

    if (!row.model || row.model.trim().length === 0) {
      errors.push({ rowNumber: rowNum, plate, field: 'model', message: 'Modelo é obrigatório.' });
      rowValid = false;
    }

    const yearMfg = Number(row.yearMfg);
    const yearModel = Number(row.yearModel);
    if (!yearMfg || yearMfg < 1980 || yearMfg > 2030) {
      errors.push({ rowNumber: rowNum, plate, field: 'yearMfg', message: 'Ano de Fabricação inválido.' });
      rowValid = false;
    }
    if (!yearModel || yearModel < yearMfg || yearModel > yearMfg + 1) {
      errors.push({ rowNumber: rowNum, plate, field: 'yearModel', message: 'Ano Modelo inconsistente com Ano de Fabricação.' });
      rowValid = false;
    }

    const price = Number(row.publicPrice);
    if (!price || price <= 0) {
      errors.push({ rowNumber: rowNum, plate, field: 'publicPrice', message: 'Preço de venda deve ser maior que zero.' });
      rowValid = false;
    }

    if (row.chassis) {
      const chassis = row.chassis.toUpperCase().trim();
      if (existingChassis.has(chassis)) {
        errors.push({ rowNumber: rowNum, plate, field: 'chassis', message: `Chassi ${chassis} já cadastrado no sistema.` });
        rowValid = false;
      } else if (seenInBatchChassis.has(chassis)) {
        errors.push({ rowNumber: rowNum, plate, field: 'chassis', message: 'Chassi duplicado dentro da mesma planilha.' });
        rowValid = false;
      } else {
        seenInBatchChassis.add(chassis);
      }
    }

    if (preview.length < 5) {
      preview.push({
        ...row,
        isValid: rowValid,
      });
    }
  });

  return {
    totalRows: rows.length,
    validRows: rows.length - new Set(errors.map((e) => e.rowNumber)).size,
    invalidRows: new Set(errors.map((e) => e.rowNumber)).size,
    errors,
    preview,
  };
}

export async function executeVehicleImportBatch(
  rows: VehicleImportRow[],
  operatorName: string = 'Sistema'
) {
  // 1. Dry run obrigatório
  const validation = await validateVehicleImport(rows);
  if (validation.invalidRows > 0) {
    throw new Error(
      `Importação bloqueada: ${validation.invalidRows} linhas possuem inconsistências. Corrija a planilha antes de prosseguir.`
    );
  }

  // 2. Busca filial padrão
  const branch = await prisma.branch.findFirst();
  if (!branch) {
    throw new Error('Nenhuma filial encontrada para vincular o estoque importado.');
  }

  // 3. Execução em transação atômica (Rollback garantido se qualquer linha falhar)
  const importedCount = await prisma.$transaction(async (tx) => {
    let count = 0;
    for (const r of rows) {
      const moto = await tx.motorcycle.create({
        data: {
          branchId: branch.id,
          plate: r.plate.toUpperCase().trim(),
          brand: r.brand.trim(),
          model: r.model.trim(),
          yearMfg: Number(r.yearMfg),
          yearModel: Number(r.yearModel),
          color: r.color || 'Preta',
          mileage: Number(r.mileage) || 0,
          fuel: r.fuel || 'Gasolina',
          chassis: r.chassis ? r.chassis.toUpperCase().trim() : null,
          renavam: r.renavam ? r.renavam.trim() : null,
          publicPrice: Number(r.publicPrice),
          status: 'DISPONIVEL',
          ownership: 'PROPRIA',
          description: `Veículo importado em lote via carga de dados.`,
        },
      });

      // Se informou custo de aquisição, lança na tabela de custos
      if (r.costPrice && Number(r.costPrice) > 0) {
        await tx.motorcycleCost.create({
          data: {
            motorcycleId: moto.id,
            category: 'AQUISICAO',
            description: 'Custo de aquisição inicial (Importação de dados)',
            amount: Number(r.costPrice),
            isCredit: false,
            status: 'PAGO',
            createdByName: operatorName,
          },
        });
      }

      count++;
    }
    return count;
  });

  // 4. Auditoria
  await logAudit({
    action: 'BATCH_DATA_IMPORT',
    entity: 'Motorcycle',
    details: `Importação em lote concluída: ${importedCount} motocicletas cadastradas com sucesso. Operador: ${operatorName}`,
  });

  return {
    success: true,
    importedCount,
    message: `${importedCount} veículos importados com sucesso!`,
  };
}
