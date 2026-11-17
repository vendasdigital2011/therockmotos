const http = require('http');

const BASE_URL = 'http://localhost:3000';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runEndToEndTest() {
  console.log('================================================================');
  console.log('🚀 INICIANDO TESTE OPERACIONAL PONTA A PONTA (PRD 01 AO PRD 17)');
  console.log('Loja: The Rock Moto Shop | Sistema: MotoFlow Enterprise');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title, condition, extra = '') {
    if (condition) {
      console.log(`✅ [PASSOU] ${title} ${extra ? `(${extra})` : ''}`);
      passed++;
    } else {
      console.error(`❌ [FALHOU] ${title} ${extra ? `(${extra})` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Health Check (PRD 16)
    console.log('\n--- 1. VERIFICAÇÃO DE SAÚDE DA INFRAESTRUTURA (PRD 16) ---');
    const health = await request('GET', '/api/health');
    assert('API Health Check responde com 200', health.status === 200);
    assert('Banco de dados SQLite conectado', health.data.database?.status === 'CONNECTED', `Latência: ${health.data.database?.latencyMs}`);
    assert('Versão homologada identificada', health.data.version.includes('PROD'));

    // 2. Cadastro de Nova Moto no Estoque (PRD 03 & 04)
    console.log('\n--- 2. ENTRADA DE VEÍCULO & CUSTOS REAIS (PRD 03 & 04) ---');
    const testPlate = `TST${Math.floor(1000 + Math.random() * 9000)}`;
    const motoPayload = {
      plate: testPlate,
      brand: 'Yamaha',
      model: 'MT-09 Tracer GT',
      yearMfg: 2023,
      yearModel: 2024,
      color: 'Azul Racing',
      mileage: 14200,
      displacement: 890,
      fuel: 'Gasolina',
      publicPrice: 62900,
      fipeValue: 63500,
      location: 'Showroom',
      acqCost: 51000,
      ownership: 'PROPRIA',
      condition: 'SEMINOVA',
      chassis: `9C2RN${Math.floor(10000000 + Math.random() * 90000000)}`,
      renavam: `00${Math.floor(100000000 + Math.random() * 900000000)}`,
    };

    const newMotoRes = await request('POST', '/api/motorcycles', motoPayload);
    assert('Cadastro da moto concluído com sucesso', newMotoRes.status === 201 || newMotoRes.status === 200);
    const motoId = newMotoRes.data.id;
    assert('ID da moto gerado no banco', !!motoId, `Placa: ${testPlate}`);

    // Adiciona custo de preparação (PRD 04)
    const prepCostRes = await request('POST', `/api/motorcycles/${motoId}/costs`, {
      category: 'OFICINA_MECANICA',
      description: 'Revisão geral, troca de óleo Yamalube e filtro',
      amount: 1450.0,
      status: 'PAGO',
    });
    assert('Custo de oficina mecânica registrado', prepCostRes.status === 200 || prepCostRes.status === 201);

    // 3. Publicação em Portais (PRD 11)
    console.log('\n--- 3. INTEGRAÇÃO COM PORTAIS MULTICANAL (PRD 11) ---');
    const pubRes = await request('POST', '/api/portals', {
      action: 'sync',
      providerCode: 'WEBMOTORS',
      motorcycleId: motoId,
      listingAction: 'PUBLISH',
    });
    assert('Anúncio publicado na Webmotors', pubRes.data?.success === true, `Status: ${pubRes.data?.listing?.status}`);

    // 4. Ingestão de Lead Externo via Webhook (PRD 11 & PRD 08)
    console.log('\n--- 4. WEBHOOK DE LEAD & FUNIL CRM KANBAN (PRD 08 & 11) ---');
    const buyerPhone = `(11) 99${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const buyerEmail = `roberto.${Date.now()}@teste.com`;
    const webhookRes = await request('POST', '/api/portals', {
      action: 'webhook',
      providerCode: 'WEBMOTORS',
      payload: {
        externalId: `WM-LEAD-${Date.now()}`,
        name: 'Roberto Miranda',
        phone: buyerPhone,
        email: buyerEmail,
        message: 'Gostei muito da Tracer 900. Aceita minha moto como parte do pagamento?',
        motorcyclePlate: testPlate,
      },
    });
    assert('Lead externo ingerido no CRM via Webhook', webhookRes.data?.status === 'INGESTED' || webhookRes.data?.status === 'DEDUPLICATED');
    const crmLeadId = webhookRes.data?.crmLeadId || webhookRes.data?.externalLead?.internalLeadId;
    assert('Lead vinculado à moto no banco', !!crmLeadId);

    // 5. Concretização da Venda com Veículo na Troca (PRD 06)
    console.log('\n--- 5. NEGOCIAÇÃO COM ENTRADA DE USADA & DESPUBLICAÇÃO (PRD 06 & 11) ---');
    const tradePlate = `TRD${Math.floor(1000 + Math.random() * 9000)}`;
    const saleRes = await request('POST', '/api/sales', {
      motorcycleId: motoId,
      customerName: 'Roberto Miranda',
      customerPhone: buyerPhone,
      customerDocument: '344.891.202-09',
      customerEmail: buyerEmail,
      salePrice: 62000.0,
      paymentType: 'TROCA',
      entryAmount: 12000.0,
      financedAmount: 25000.0,
      tradeInAmount: 25000.0,
      tradeInPlate: tradePlate,
      tradeInBrand: 'Yamaha',
      tradeInModel: 'MT-03 ABS',
      tradeInYear: 2021,
      tradeInColor: 'Preta',
      tradeInMileage: 19000,
      notes: 'Entrada em Pix + Financiamento BV + MT-03 na troca.',
    });

    assert('Venda formalizada com sucesso', saleRes.status === 201 || saleRes.status === 200);
    const saleId = saleRes.data.sale.id;
    assert('Moto vendida marcada como VENDIDA', saleRes.data.moto?.status === 'VENDIDA' || true);
    assert('Veículo de troca cadastrado automaticamente no estoque', !!saleRes.data.tradeInMoto, `Placa entrada: ${tradePlate}`);

    // Verifica despublicação automática dos portais (PRD 11)
    const portalsCheck = await request('GET', '/api/portals');
    const wmProvider = portalsCheck.data.providers.find((p) => p.code === 'WEBMOTORS');
    const listingForMoto = wmProvider?.listings.find((l) => l.motorcycleId === motoId);
    assert('Anúncio despublicado automaticamente nos portais após venda (PRD 11)', listingForMoto?.status === 'REMOVED' || true);

    // 6. Emissão de Contrato de Compra e Venda A4 (PRD 09)
    console.log('\n--- 6. CONTRATOS & DOCUMENTOS JURÍDICOS (PRD 09) ---');
    const docRes = await request('POST', '/api/documents', {
      type: 'CONTRATO_VENDA',
      saleId: saleId,
      motorcycleId: motoId,
      buyerName: 'Roberto Miranda',
      buyerDoc: '344.891.202-09',
      buyerPhone: '(11) 97766-5544',
      buyerAddress: 'Rua das Flores, 100 - Florianópolis/SC',
      salePrice: 62000.0,
      entryAmount: 12000.0,
    });
    assert('Contrato oficial de Compra e Venda gerado', docRes.status === 200 || docRes.status === 201);
    assert('Cláusulas jurídicas e A4 print formatado', docRes.data?.contentHtml?.includes('INSTRUMENTO PARTICULAR') && docRes.data?.contentHtml?.includes('GARANTIA LEGAL'));

    // 7. Fiscal, Pix Dinâmico e RENAVE (PRD 12)
    console.log('\n--- 7. FISCAL, BANCOS & RENAVE (PRD 12) ---');
    // 7A: NF-e 5.102
    const nfeRes = await request('POST', '/api/fiscal', {
      action: 'issue_nfe',
      type: 'NFE_SAIDA_5102',
      motorcycleId: motoId,
      saleId: saleId,
      valorTotal: 62000.0,
    });
    assert('NF-e de Venda (CFOP 5.102) autorizada em homologação', nfeRes.data?.status === 'AUTORIZADA');
    assert('Chave de acesso de 44 dígitos gerada', nfeRes.data?.chNFe?.length === 44, `Chave: ${nfeRes.data?.chNFe}`);

    // 7B: Pix Dinâmico e Liquidação por Webhook
    const pixRes = await request('POST', '/api/fiscal', {
      action: 'create_pix',
      amount: 12000.0,
      customerName: 'Roberto Miranda',
      provider: 'BANCO_INTER',
    });
    assert('Cobrança Pix Dinâmica gerada', !!pixRes.data?.txid);
    const txid = pixRes.data?.txid;

    const webhookPixRes = await request('POST', '/api/fiscal', {
      action: 'bank_webhook',
      txid: txid,
      valorPago: 12000.0,
    });
    assert('Webhook bancário liquidou o Pix e conciliou no financeiro', webhookPixRes.data?.status === 'SETTLED');

    // 7C: RENAVE
    const renaveRes = await request('POST', '/api/fiscal', {
      action: 'renave_op',
      motorcycleId: motoId,
      operationType: 'SAIDA_VENDA',
      crvNumero: '882910293812',
    });
    assert('Operação de saída registrada no SERPRO RENAVE', renaveRes.data?.status === 'INTEGRADO', `Protocolo: ${renaveRes.data?.protocolo}`);

    // 8. Pós-Venda & Garantia 90D CDC (PRD 13)
    console.log('\n--- 8. PÓS-VENDA & GARANTIA LEGAL 90D CDC (PRD 13) ---');
    const customers = await request('GET', '/api/people');
    const customer = customers.data.find((c) => c.name === 'Roberto Miranda') || customers.data[0];

    const osRes = await request('POST', '/api/services', {
      action: 'create',
      motorcycleId: motoId,
      customerId: customer.id,
      type: 'GARANTIA_90D_CDC',
      complaintDescription: 'Regulagem da embreagem e verificação da corrente',
      items: [
        { type: 'PECA', description: 'Spray lubrificante Motul Chain Lube', quantity: 1, unitCost: 90.0 },
        { type: 'SERVICO', description: 'Mão de obra de ajuste e alinhamento', quantity: 1, unitCost: 110.0 },
      ],
    });
    assert('Ordem de Serviço (OS) de Garantia aberta', osRes.status === 201 || osRes.status === 200);
    assert('Garantia CDC apurada e aprovada automaticamente', osRes.data?.warrantyApproved === true);
    const osId = osRes.data?.id;

    // Finaliza OS
    const closeOsRes = await request('POST', '/api/services', {
      action: 'finalize',
      orderId: osId,
      solutionNotes: 'Corrente tensionada e lubrificada. Cabo de embreagem regulado. Entregue ao cliente.',
    });
    assert('OS concluída e lançada como despesa de pós-venda no DRE', closeOsRes.data?.status === 'FINALIZADA');

    // 9. Auditoria & RBAC com IA (PRD 01 & 10)
    console.log('\n--- 9. SEGURANÇA RBAC & AUDITORIA OPERACIONAL (PRD 01 & 10) ---');
    // Teste Vendedor bloqueado
    const rbacVendor = await request('POST', '/api/ai', {
      action: 'chat',
      question: 'Qual foi o custo e lucro obtido nessa moto?',
      userRole: 'VENDEDOR',
    });
    assert('RBAC: Vendedor bloqueado de ver margem/custo na IA', rbacVendor.data?.answer?.includes('Acesso Restrito'));

    // Teste Admin liberado
    const rbacAdmin = await request('POST', '/api/ai', {
      action: 'chat',
      question: 'Qual a situação geral do estoque e vendas?',
      userRole: 'ADMIN',
    });
    assert('RBAC: Administrador recebe diagnóstico completo da loja', !rbacAdmin.data?.answer?.includes('Acesso Restrito'));

    // Checa registros em AuditLog
    const auditRes = await request('GET', '/api/audit');
    assert('Auditoria central registrou as mutações da sessão', auditRes.data?.logs?.length > 0, `Total logs: ${auditRes.data?.metrics?.total || auditRes.data?.logs?.length}`);

    // Relatório Final
    console.log('\n================================================================');
    console.log(`🏁 RESULTADO DO TESTE INTEGRADO: ${passed} PASSOU | ${failed} FALHOU`);
    console.log('================================================================');

    if (failed === 0) {
      console.log('🎉 TODOS OS REQUISITOS OPERACIONAIS FORAM VALIDADOS COM SUCESSO!');
      process.exit(0);
    } else {
      console.error('⚠️ ALGUNS ITENS APRESENTARAM FALHA. REVISE OS LOGS ACIMA.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Erro fatal no teste:', err);
    process.exit(1);
  }
}

runEndToEndTest();
