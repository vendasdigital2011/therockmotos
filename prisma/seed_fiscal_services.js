const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Semeando Dados Fiscais, Bancários e de Serviços (PRD 12, 13) ---');

  const motos = await prisma.motorcycle.findMany({ take: 3 });
  const customers = await prisma.customer.findMany({ take: 3 });

  if (motos.length === 0 || customers.length === 0) {
    console.log('Sem motos ou clientes para associar');
    return;
  }

  // 1. NF-e emitida
  await prisma.fiscalDocument.upsert({
    where: { chNFe: '35261148920112000194550010000001011882910405' },
    update: {},
    create: {
      number: 101,
      series: 1,
      type: 'NFE_SAIDA_5102',
      status: 'AUTORIZADA',
      motorcycleId: motos[0].id,
      customerId: customers[0].id,
      chNFe: '35261148920112000194550010000001011882910405',
      protocolNumber: '135260084920114',
      naturezaOperacao: 'Venda de veículo usado próprio',
      cfop: '5.102',
      valorTotal: motos[0].publicPrice,
      xmlContent: '<nfeProc versao="4.00"><NFe><infNFe Id="NFe35261148920112000194550010000001011882910405"></infNFe></NFe></nfeProc>',
      environment: 'HOMOLOGACAO',
    },
  });

  // 2. Cobrança Pix
  await prisma.bankCharge.upsert({
    where: { txid: 'TRK2026110900199' },
    update: {},
    create: {
      txid: 'TRK2026110900199',
      provider: 'BANCO_INTER',
      chargeType: 'PIX_DINAMICO',
      status: 'PENDENTE',
      amount: 5000.0,
      customerName: customers[0].name,
      customerDoc: customers[0].document || '388.921.408-11',
      qrCodeText: '00020101021226840014br.gov.bcb.pix2562pix-h.bancointer.com.br/qr/v2/TRK20261109001995204000053039865405000.005802BR5918THE ROCK MOTO SHOP6009SAO PAULO62070503***6304ABCD',
      dueDate: new Date(Date.now() + 86400000 * 3),
    },
  });

  // 3. RENAVE
  await prisma.renaveOperation.upsert({
    where: { id: 'renave-pilot-01' },
    update: {},
    create: {
      id: 'renave-pilot-01',
      motorcycleId: motos[0].id,
      operationType: 'ENTRADA_ESTOQUE',
      status: 'INTEGRADO',
      renavam: motos[0].renavam || '00981726354',
      chassis: motos[0].chassis || '9C2JCXXXXXXXXX',
      crvNumero: '982716253412',
      protocolo: 'RNV-2026-SP-918273',
      codRetorno: '00',
      mensagemRetorno: 'Entrada no estoque autorizada e confirmada no SERPRO / RENAVE.',
      operatorName: 'Robson Santos',
    },
  });

  // 4. Ordem de Serviço de Garantia 90D CDC (PRD 13)
  await prisma.serviceOrder.upsert({
    where: { code: 'OS-2026-0001' },
    update: {},
    create: {
      code: 'OS-2026-0001',
      motorcycleId: motos[0].id,
      customerId: customers[0].id,
      type: 'GARANTIA_90D_CDC',
      status: 'FINALIZADA',
      complaintDescription: 'Ruído de pastilha de freio dianteiro após 15 dias de retirada da loja.',
      diagnosis: 'Pastilha dianteira desgastada de forma irregular. Substituição efetuada.',
      solutionNotes: 'Troca de pastilhas de freio dianteiras e sangria do fluido de freio DOT 4. Teste de rodagem OK.',
      mechanicName: 'Oficina do Carlão - Especialista Honda',
      warrantyApproved: true,
      totalParts: 140.0,
      totalLabor: 80.0,
      totalCost: 220.0,
      openedAt: new Date(Date.now() - 86400000 * 5),
      closedAt: new Date(Date.now() - 86400000 * 4),
      items: {
        create: [
          { type: 'PECA', description: 'Jogo Pastilha Freio Dianteiro Cobreq Racing', quantity: 1, unitCost: 140.0, totalCost: 140.0 },
          { type: 'SERVICO', description: 'Mão de obra substituição e sangria DOT 4', quantity: 1, unitCost: 80.0, totalCost: 80.0 },
        ],
      },
    },
  });

  console.log('✅ Dados fiscais e de serviço semeados com sucesso!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
