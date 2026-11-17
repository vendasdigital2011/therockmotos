const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Documentos e Contratos (PRD 09)...');

  const sales = await prisma.sale.findMany({
    include: {
      motorcycle: true,
      customer: true,
      seller: true,
    },
  });

  console.log(`Encontradas ${sales.length} vendas para geração de contratos.`);

  // Vamos importar os geradores
  // Como são em TS no src/lib, vamos compilar ou instanciar direto em JS
  const company = {
    name: 'The Rock Moto Shop Comércio de Motocicletas Ltda',
    cnpj: '45.892.103/0001-87',
    address: 'Rodovia SC-401, nº 4500, Bloco B, Saco Grande, Florianópolis - SC',
  };

  for (const s of sales) {
    const moto = s.motorcycle;
    const cust = s.customer;
    if (!moto || !cust) continue;

    // 1. Contrato de Compra e Venda
    const contractHtml = `
    <div class="contract-container">
      <div class="contract-header">
        <div class="logo-title">
          <h2>THE ROCK MOTO SHOP</h2>
          <span class="sub">${company.name} • CNPJ: ${company.cnpj}</span>
        </div>
        <div class="doc-badge">CONTRATO DE COMPRA E VENDA</div>
      </div>
      <div class="doc-body">
        <h3 class="contract-title">INSTRUMENTO PARTICULAR DE COMPRA E VENDA DE VEÍCULO AUTOMOTOR USADO</h3>
        <div class="section-block">
          <h4>1. DAS PARTES</h4>
          <p><strong>VENDEDORA:</strong> ${company.name}, inscrita no CNPJ sob o nº ${company.cnpj}, com sede em ${company.address}.</p>
          <p><strong>COMPRADOR(A):</strong> <strong>${cust.name}</strong>, inscrito(a) no CPF sob o nº <strong>${cust.document || '000.000.000-00'}</strong>, Telefone: ${cust.phone}, Cidade: ${cust.city || 'Florianópolis'}/${cust.state || 'SC'}.</p>
        </div>
        <div class="section-block">
          <h4>2. DO OBJETO</h4>
          <p>Alienada a motocicleta usada <strong>${moto.brand} ${moto.model}</strong>, Ano <strong>${moto.yearFab}/${moto.yearModel}</strong>, Cor <strong>${moto.color}</strong>, Placa <strong>${moto.plate}</strong>, Chassi: ${moto.chassi || 'Constante no CRLV'}, Km no ato: ${moto.mileage.toLocaleString('pt-BR')} km.</p>
        </div>
        <div class="section-block">
          <h4>3. PREÇO E CONDIÇÕES</h4>
          <p>Valor total de <strong>R$ ${s.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>, quitado mediante ${s.paymentType.replace('_', ' ')} (Entrada: R$ ${(s.entryAmount || 0).toLocaleString('pt-BR')}, Financiamento: R$ ${(s.financedAmount || 0).toLocaleString('pt-BR')}).</p>
        </div>
        <div class="section-block">
          <h4>4. DA GARANTIA LEGAL DE 90 DIAS</h4>
          <p>A Vendedora concede garantia legal de 90 (noventa) dias exclusivamente para MOTOR e CÂMBIO, nos termos do Art. 26 do Código de Defesa do Consumidor.</p>
        </div>
        <div class="section-block">
          <h4>5. DA TRANSFERÊNCIA E RESPONSABILIDADE</h4>
          <p>O Comprador se obriga a transferir o veículo junto ao DETRAN em até 30 dias corridos e assume toda responsabilidade civil e criminal por infrações de trânsito a partir da entrega.</p>
        </div>
        <div class="closing">
          <p class="date-line">Florianópolis - SC, ${new Date(s.saleDate).toLocaleDateString('pt-BR')}.</p>
        </div>
        <div class="signature-grid">
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong>${company.name}</strong>
            <span>Vendedora</span>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong>${cust.name}</strong>
            <span>Comprador(a)</span>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong>Testemunha 1</strong>
            <span>CPF: ___________________</span>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong>Testemunha 2</strong>
            <span>CPF: ___________________</span>
          </div>
        </div>
      </div>
    </div>
    `;

    // 2. Termo de Garantia 90 dias
    const warrantyHtml = `
    <div class="contract-container">
      <div class="contract-header">
        <div class="logo-title">
          <h2>THE ROCK MOTO SHOP</h2>
          <span class="sub">${company.name} • Florianópolis - SC</span>
        </div>
        <div class="doc-badge">TERMO DE GARANTIA 90D</div>
      </div>
      <div class="doc-body">
        <h3 class="contract-title">CERTIFICADO DE GARANTIA LEGAL E ENTREGA TÉCNICA (ART. 26 CDC)</h3>
        <p>A The Rock Moto Shop certifica a entrega e garantia para o cliente <strong>${cust.name}</strong> referente à moto <strong>${moto.brand} ${moto.model} (${moto.plate})</strong>.</p>
        <div class="section-block">
          <h4>CHECKLIST DE REVISÃO E ENTREGA</h4>
          <p>☑ Nível de óleo conferido | ☑ Bateria testada | ☑ Pneus e freios aprovados | ☑ Teste dinâmico realizado | ☑ Chave e CRLV entregues.</p>
        </div>
        <div class="section-block">
          <h4>COBERTURA DA GARANTIA</h4>
          <p>Garantia válida por 90 dias corridos a partir desta data, cobrindo componentes internos lubrificados de motor e caixa de câmbio.</p>
        </div>
        <div class="closing">
          <p class="date-line">Florianópolis - SC, ${new Date(s.saleDate).toLocaleDateString('pt-BR')}.</p>
        </div>
        <div class="signature-grid" style="grid-template-columns: 1fr 1fr;">
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong>${cust.name}</strong>
            <span>Comprador(a)</span>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong>The Rock Moto Shop</strong>
            <span>Vendedora</span>
          </div>
        </div>
      </div>
    </div>
    `;

    // Cria os documentos se não existirem
    const existing = await prisma.documentContract.findFirst({
      where: { saleId: s.id, type: 'CONTRATO_VENDA' },
    });

    if (!existing) {
      await prisma.documentContract.create({
        data: {
          type: 'CONTRATO_VENDA',
          title: `Contrato de Compra e Venda - ${moto.brand} ${moto.model} (${moto.plate})`,
          saleId: s.id,
          motorcycleId: moto.id,
          customerId: cust.id,
          sellerId: s.sellerId,
          contentHtml: contractHtml,
          status: 'ASSINADO',
          signDate: new Date(s.saleDate),
          witness1Name: 'Marcos Vinicius',
          witness1Doc: '045.192.839-01',
          witness2Name: 'Juliana Costa',
          witness2Doc: '112.493.582-77',
        },
      });

      await prisma.documentContract.create({
        data: {
          type: 'TERMO_GARANTIA',
          title: `Termo de Entrega Técnica & Garantia 90D - ${moto.brand} ${moto.model} (${moto.plate})`,
          saleId: s.id,
          motorcycleId: moto.id,
          customerId: cust.id,
          sellerId: s.sellerId,
          contentHtml: warrantyHtml,
          status: 'ASSINADO',
          signDate: new Date(s.saleDate),
        },
      });

      console.log(`✓ Contrato e Termo de Garantia criados para Venda ${s.id} (${moto.model})`);
    }
  }

  // Também criar um Recibo de Sinal para uma moto em estoque (reserva ativa)
  const availableMoto = await prisma.motorcycle.findFirst({
    where: { status: 'DISPONIVEL' },
  });

  if (availableMoto) {
    const depositHtml = `
    <div class="contract-container">
      <div class="contract-header">
        <div class="logo-title">
          <h2>THE ROCK MOTO SHOP</h2>
          <span class="sub">${company.name} • Florianópolis - SC</span>
        </div>
        <div class="doc-badge">RECIBO DE SINAL & RESERVA</div>
      </div>
      <div class="doc-body">
        <h3 class="contract-title">RECIBO DE SINAL, ARRAS E RESERVA EXCLUSIVA</h3>
        <p>Recebemos de <strong>Rodrigo Albuquerque</strong>, CPF <strong>847.291.039-11</strong>, a quantia de <strong>R$ 2.000,00 (Dois mil reais)</strong> a título de sinal e princípio de pagamento para reserva da moto <strong>${availableMoto.brand} ${availableMoto.model} (Placa ${availableMoto.plate})</strong>.</p>
        <p>Validade da reserva: 5 (cinco) dias úteis para liberação de crédito bancário.</p>
        <div class="closing">
          <p class="date-line">Florianópolis - SC, ${new Date().toLocaleDateString('pt-BR')}.</p>
        </div>
        <div class="signature-grid" style="grid-template-columns: 1fr 1fr;">
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong>The Rock Moto Shop</strong>
            <span>Recebedora</span>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong>Rodrigo Albuquerque</strong>
            <span>Comprador</span>
          </div>
        </div>
      </div>
    </div>
    `;

    await prisma.documentContract.create({
      data: {
        type: 'RECIBO_SINAL',
        title: `Recibo de Sinal & Reserva - ${availableMoto.brand} ${availableMoto.model} (${availableMoto.plate})`,
        motorcycleId: availableMoto.id,
        contentHtml: depositHtml,
        status: 'GERADO',
      },
    });

    console.log(`✓ Recibo de sinal gerado para moto disponível ${availableMoto.model}`);
  }

  console.log('Seeding de Documentos concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
