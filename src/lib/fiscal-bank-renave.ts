import { prisma } from './prisma';
import { logAudit } from './audit';

// ==========================================
// 12A — FISCAL: NF-e SIMULATION & DANFE
// ==========================================

export interface NFeSimulationParams {
  type: 'NFE_ENTRADA_1102' | 'NFE_SAIDA_5102';
  motorcycleId: string;
  customerId?: string;
  saleId?: string;
  valorTotal: number;
  operatorName?: string;
}

export function generate44DigitChaveAcesso(uf: string, anoMes: string, cnpj: string, mod: string, serie: string, numero: number): string {
  const cleanCnpj = cnpj.replace(/\D/g, '').padStart(14, '0');
  const numStr = String(numero).padStart(9, '0');
  const serieStr = serie.padStart(3, '0');
  const cNF = Math.floor(10000000 + Math.random() * 90000000); // 8 dígitos código aleatório
  const partial = `${uf}${anoMes}${cleanCnpj}${mod}${serieStr}${numStr}1${cNF}`; // 1 = emissão normal (43 dígitos)
  
  // Cálculo dígito verificador módulo 11
  let soma = 0;
  let peso = 2;
  for (let i = partial.length - 1; i >= 0; i--) {
    soma += parseInt(partial[i], 10) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const resto = soma % 11;
  const dv = (resto === 0 || resto === 1) ? 0 : 11 - resto;
  return `${partial}${dv}`;
}

export async function issueFiscalDocument(params: NFeSimulationParams) {
  const { type, motorcycleId, customerId, saleId, valorTotal, operatorName = 'Sistema' } = params;

  const moto = await prisma.motorcycle.findUnique({
    where: { id: motorcycleId },
  });

  if (!moto) {
    throw new Error('Motocicleta não encontrada para emissão fiscal.');
  }

  let customer = null;
  if (customerId) {
    customer = await prisma.customer.findUnique({ where: { id: customerId } });
  }

  // Obter próximo número sequencial de NF-e
  const lastDoc = await prisma.fiscalDocument.findFirst({
    orderBy: { number: 'desc' },
  });
  const nextNumber = (lastDoc?.number || 100) + 1;

  const now = new Date();
  const anoMes = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const chaveAcesso = generate44DigitChaveAcesso('35', anoMes, '48920112000194', '55', '001', nextNumber);
  const protocol = `1352600${Math.floor(100000000 + Math.random() * 900000000)}`;

  const cfop = type === 'NFE_SAIDA_5102' ? '5.102' : '1.102';
  const natOp = type === 'NFE_SAIDA_5102' ? 'Venda de veículo usado próprio' : 'Entrada / Compra de veículo usado para revenda';

  // Simulação de XML oficial assinado (PRD 12A)
  const xmlSimulado = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe${chaveAcesso}" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <natOp>${natOp}</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>${nextNumber}</nNF>
        <dhEmi>${now.toISOString()}</dhEmi>
        <tpNF>${type === 'NFE_SAIDA_5102' ? 1 : 0}</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <tpAmb>2</tpAmb> <!-- Homologação -->
        <finNFe>1</finNFe>
      </ide>
      <emit>
        <CNPJ>48920112000194</CNPJ>
        <xNome>THE ROCK MOTO SHOP COMERCIO DE VEICULOS LTDA</xNome>
        <xFant>THE ROCK MOTO SHOP</xFant>
        <IE>112345678110</IE>
        <CRT>1</CRT> <!-- Simples Nacional -->
      </emit>
      <dest>
        <xNome>${customer ? customer.name : 'CONSUMIDOR FINAL'}</xNome>
        <CPF>${customer?.document?.replace(/\D/g, '') || '00000000000'}</CPF>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>MOTO-${moto.plate}</cProd>
          <xProd>${moto.brand} ${moto.model} ${moto.yearModel} Placa ${moto.plate} Chassi ${moto.chassis || 'NÃO INFORMADO'}</xProd>
          <NCM>87112010</NCM>
          <CFOP>${cfop.replace('.', '')}</CFOP>
          <uCom>UN</uCom>
          <qCom>1.0000</qCom>
          <vUnCom>${valorTotal.toFixed(2)}</vUnCom>
          <vProd>${valorTotal.toFixed(2)}</vProd>
        </prod>
        <imposto>
          <ICMS><ICMSSN102><orig>0</orig><CSOSN>102</CSOSN></ICMSSN102></ICMS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>0.00</vBC>
          <vICMS>0.00</vICMS>
          <vProd>${valorTotal.toFixed(2)}</vProd>
          <vNF>${valorTotal.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>2</tpAmb>
      <chNFe>${chaveAcesso}</chNFe>
      <dhRecbto>${now.toISOString()}</dhRecbto>
      <nProt>${protocol}</nProt>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e (Ambiente Homologacao)</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;

  const doc = await prisma.fiscalDocument.create({
    data: {
      number: nextNumber,
      series: 1,
      type,
      status: 'AUTORIZADA',
      motorcycleId: moto.id,
      customerId: customer?.id || null,
      saleId: saleId || null,
      chNFe: chaveAcesso,
      protocolNumber: protocol,
      naturezaOperacao: natOp,
      cfop,
      valorTotal,
      xmlContent: xmlSimulado,
      environment: 'HOMOLOGACAO',
      issuedAt: now,
    },
  });

  // Auditoria transversal (PRD 10)
  await logAudit({
    action: 'FISCAL_ISSUE',
    entity: 'FiscalDocument',
    entityId: doc.id,
    details: `NF-e nº ${nextNumber} (${type} - CFOP ${cfop}) emitida para moto ${moto.brand} ${moto.model} (${moto.plate}). Valor: R$ ${valorTotal.toFixed(2)}. Chave: ${chaveAcesso}. Operador: ${operatorName}`,
  });

  return doc;
}

// ==========================================
// 12B — BANCOS: PIX DINÂMICO & WEBHOOK
// ==========================================

export async function createDynamicPixCharge(params: {
  financialEntryId?: string;
  amount: number;
  customerName?: string;
  customerDoc?: string;
  provider?: string;
}) {
  const {
    financialEntryId,
    amount,
    customerName = 'Cliente The Rock',
    customerDoc = '000.000.000-00',
    provider = 'BANCO_INTER',
  } = params;

  const txid = `TRK${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
  
  // EMV Copia e Cola formatado
  const pixCopiaCola = `00020101021226840014br.gov.bcb.pix2562pix-h.bancointer.com.br/qr/v2/${txid}520400005303986540${amount.toFixed(2).length}${amount.toFixed(2)}5802BR5918THE ROCK MOTO SHOP6009SAO PAULO62070503***6304ABCD`;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 3); // Vencimento em 3 dias

  const charge = await prisma.bankCharge.create({
    data: {
      financialEntryId: financialEntryId || null,
      provider,
      chargeType: 'PIX_DINAMICO',
      status: 'PENDENTE',
      txid,
      amount,
      customerName,
      customerDoc,
      qrCodeText: pixCopiaCola,
      dueDate,
    },
  });

  return charge;
}

export async function processBankWebhook(payload: {
  txid: string;
  endToEndId?: string;
  valorPago?: number;
  dataPagamento?: string;
}) {
  const { txid, endToEndId, valorPago, dataPagamento } = payload;

  const charge = await prisma.bankCharge.findUnique({
    where: { txid },
    include: { financialEntry: true },
  });

  if (!charge) {
    throw new Error(`Cobrança com TXID ${txid} não encontrada.`);
  }

  if (charge.status === 'PAGO') {
    return {
      status: 'ALREADY_PAID',
      message: 'Cobrança já baixada anteriormente. Idempotência preservada (PRD 12B).',
      charge,
    };
  }

  const now = new Date(dataPagamento || new Date());

  // Atualiza cobrança bancária
  const updatedCharge = await prisma.bankCharge.update({
    where: { id: charge.id },
    data: {
      status: 'PAGO',
      endToEndId: endToEndId || `E00416968${Date.now()}TRK`,
      paidAt: now,
      webhookReceivedAt: new Date(),
    },
  });

  // Se houver lançamento financeiro atrelado, faz a baixa automática!
  if (charge.financialEntryId) {
    await prisma.financialEntry.update({
      where: { id: charge.financialEntryId },
      data: {
        status: 'PAGO',
        paymentDate: now,
        paidAmount: valorPago || charge.amount,
        notes: `Baixa automática via Webhook Pix Bancário (TXID: ${txid}, E2E: ${updatedCharge.endToEndId})`,
      },
    });
  }

  // Registra auditoria
  await logAudit({
    action: 'BANK_WEBHOOK_LIQUIDATION',
    entity: 'BankCharge',
    entityId: charge.id,
    details: `Cobrança Pix liquidada automaticamente: TXID ${txid}, Valor: R$ ${(valorPago || charge.amount).toFixed(2)}. Entrada financeira ${charge.financialEntryId || 'N/A'} baixada com sucesso.`,
  });

  return {
    status: 'SETTLED',
    message: 'Cobrança bancária baixada e conciliada com sucesso!',
    charge: updatedCharge,
  };
}

// ==========================================
// 12C — RENAVE: ENTRADA & SAÍDA DE ESTOQUE
// ==========================================

export async function registerRenaveOperation(params: {
  motorcycleId: string;
  operationType: 'ENTRADA_ESTOQUE' | 'SAIDA_VENDA';
  crvNumero?: string;
  operatorName?: string;
}) {
  const { motorcycleId, operationType, crvNumero = '123456789012', operatorName = 'Sistema' } = params;

  const moto = await prisma.motorcycle.findUnique({
    where: { id: motorcycleId },
  });

  if (!moto) {
    throw new Error('Motocicleta não encontrada para operação RENAVE.');
  }

  const renavam = moto.renavam || '00129847192';
  const chassis = moto.chassis || '9C2JCXXXXXXXXX';
  const now = new Date();
  const protocol = `RNV-2026-SP-${Math.floor(100000 + Math.random() * 900000)}`;

  const op = await prisma.renaveOperation.create({
    data: {
      motorcycleId: moto.id,
      operationType,
      status: 'INTEGRADO',
      renavam,
      chassis,
      crvNumero,
      protocolo: protocol,
      codRetorno: '00',
      mensagemRetorno: operationType === 'ENTRADA_ESTOQUE'
        ? 'Veículo integrado ao estoque do estabelecimento no RENAVE com sucesso.'
        : 'Saída por venda registrada no RENAVE com sucesso.',
      operatorName,
    },
  });

  await logAudit({
    action: `RENAVE_${operationType}`,
    entity: 'RenaveOperation',
    entityId: op.id,
    details: `Registro RENAVE (${operationType}) para ${moto.brand} ${moto.model} (${moto.plate}). Protocolo: ${protocol}. Operador: ${operatorName}`,
  });

  return op;
}
