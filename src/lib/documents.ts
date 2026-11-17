export interface CompanyData {
  name: string;
  tradeName: string;
  cnpj: string;
  ie: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  managerName: string;
}

export const THE_ROCK_COMPANY: CompanyData = {
  name: 'The Rock Moto Shop Comércio de Motocicletas Ltda',
  tradeName: 'The Rock Moto Shop',
  cnpj: '45.892.103/0001-87',
  ie: '259.841.200',
  address: 'Rodovia SC-401, nº 4500, Bloco B',
  neighborhood: 'Saco Grande',
  city: 'Florianópolis',
  state: 'SC',
  zipCode: '88032-005',
  phone: '(48) 3232-9000 / (48) 99123-4567',
  email: 'contato@therockmotoshop.com.br',
  managerName: 'Cassio Silveira',
};

export interface ContractParty {
  name: string;
  document: string; // CPF ou CNPJ
  rg?: string;
  phone: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface VehicleContractData {
  brand: string;
  model: string;
  version?: string;
  yearFab: number;
  yearModel: number;
  color: string;
  plate: string;
  renavam?: string;
  chassi?: string;
  mileage: number;
  fuelType?: string;
}

export interface FinancialContractData {
  salePrice: number;
  entryAmount?: number;
  entryMethod?: string; // PIX, DINHEIRO, CARTAO
  financedAmount?: number;
  financeCompany?: string;
  financeInstallments?: number;
  tradeInAmount?: number;
  tradeInPlate?: string;
  tradeInModel?: string;
  paymentType: string;
  depositAmount?: number;
  depositDate?: string;
  reservationDeadlineDays?: number;
}

const formatCurrency = (val: number) => {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDateBr = (d?: string | Date) => {
  const date = d ? new Date(d) : new Date();
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateTimeBr = (d?: string | Date) => {
  const date = d ? new Date(d) : new Date();
  return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
};

/**
 * 1. CONTRATO DE COMPRA E VENDA DE VEÍCULO USADO
 */
export function generateSaleContractHtml(
  buyer: ContractParty,
  vehicle: VehicleContractData,
  financial: FinancialContractData,
  sellerName = 'The Rock Moto Shop'
): string {
  return `
  <div class="contract-container">
    <div class="contract-header">
      <div class="logo-title">
        <h2>THE ROCK MOTO SHOP</h2>
        <span class="sub">${THE_ROCK_COMPANY.name} • CNPJ: ${THE_ROCK_COMPANY.cnpj}</span>
      </div>
      <div class="doc-badge">CONTRATO DE COMPRA E VENDA</div>
    </div>

    <div class="doc-body">
      <h3 class="contract-title">INSTRUMENTO PARTICULAR DE COMPRA E VENDA DE VEÍCULO AUTOMOTOR USADO</h3>

      <div class="section-block">
        <h4>1. DAS PARTES CONTRATANTES</h4>
        <p><strong>VENDEDORA:</strong> <strong>${THE_ROCK_COMPANY.name}</strong>, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº ${THE_ROCK_COMPANY.cnpj}, Inscrição Estadual nº ${THE_ROCK_COMPANY.ie}, com sede na ${THE_ROCK_COMPANY.address}, Bairro ${THE_ROCK_COMPANY.neighborhood}, Florianópolis - SC, CEP ${THE_ROCK_COMPANY.zipCode}, neste ato representada por seu gestor comercial <em>${sellerName}</em>.</p>
        <p><strong>COMPRADOR(A):</strong> <strong>${buyer.name}</strong>, inscrito(a) no CPF/MF sob o nº <strong>${buyer.document || 'Não informado'}</strong>, RG: ${buyer.rg || 'Não informado'}, residente e domiciliado(a) na ${buyer.address || 'Endereço cadastral'}, ${buyer.neighborhood || ''}, ${buyer.city || 'Florianópolis'} - ${buyer.state || 'SC'}, Telefone: ${buyer.phone || 'Não informado'}.</p>
      </div>

      <div class="section-block">
        <h4>2. DO OBJETO DO CONTRATO</h4>
        <p>O presente contrato tem por objeto a alienação da seguinte motocicleta, usada, inspecionada e aceita pelo(a) COMPRADOR(A):</p>
        <table class="contract-table">
          <tr>
            <td><strong>Marca:</strong> ${vehicle.brand}</td>
            <td><strong>Modelo:</strong> ${vehicle.model} ${vehicle.version || ''}</td>
            <td><strong>Ano Fab/Mod:</strong> ${vehicle.yearFab} / ${vehicle.yearModel}</td>
          </tr>
          <tr>
            <td><strong>Cor:</strong> ${vehicle.color}</td>
            <td><strong>Placa:</strong> <span class="plate-box">${vehicle.plate}</span></td>
            <td><strong>Km no Ato:</strong> ${vehicle.mileage.toLocaleString('pt-BR')} km</td>
          </tr>
          <tr>
            <td><strong>Renavam:</strong> ${vehicle.renavam || 'Constante no CRLV'}</td>
            <td colspan="2"><strong>Chassi:</strong> ${vehicle.chassi || 'Constante no CRLV'}</td>
          </tr>
        </table>
      </div>

      <div class="section-block">
        <h4>3. DO PREÇO E CONDIÇÕES DE PAGAMENTO</h4>
        <p>O valor total e irreajustável da presente negociação é de <strong>${formatCurrency(financial.salePrice)}</strong>, acordado entre as partes para quitação conforme a composição abaixo:</p>
        <ul class="payment-list">
          ${financial.entryAmount && financial.entryAmount > 0 ? `<li><strong>Entrada / Sinal:</strong> ${formatCurrency(financial.entryAmount)} pago via ${financial.entryMethod || 'Transferência bancária / PIX'} à Vendedora nesta data.</li>` : ''}
          ${financial.financedAmount && financial.financedAmount > 0 ? `<li><strong>Financiamento Bancário:</strong> ${formatCurrency(financial.financedAmount)} através da instituição financeira parceira.</li>` : ''}
          ${financial.tradeInAmount && financial.tradeInAmount > 0 ? `<li><strong>Veículo Usado em Troca:</strong> ${formatCurrency(financial.tradeInAmount)} referente à entrega da motocicleta ${financial.tradeInModel || 'usada'} (Placa: ${financial.tradeInPlate || 'S/P'}), desembaraçada de ônus.</li>` : ''}
          ${(!financial.entryAmount && !financial.financedAmount && !financial.tradeInAmount) ? `<li><strong>Pagamento Integral à Vista:</strong> ${formatCurrency(financial.salePrice)} quitado no ato mediante transferência/PIX.</li>` : ''}
        </ul>
      </div>

      <div class="section-block">
        <h4>4. DA GARANTIA LEGAL E ESTADO DO VEÍCULO</h4>
        <p><strong>4.1.</strong> A VENDEDORA concede ao(à) COMPRADOR(A) a <strong>Garantia Legal de 90 (noventa) dias</strong> exclusivamente para <strong>MOTOR e CAIXA DE CÂMBIO</strong>, nos exatos termos do <em>Artigo 26, Inciso II do Código de Defesa do Consumidor (Lei Federal nº 8.078/1990)</em>.</p>
        <p><strong>4.2.</strong> O(A) COMPRADOR(A) declara que examinou detidamente o veículo, realizou avaliação visual e mecânica satisfatória, ciente do hodômetro e do desgaste natural de componentes consumíveis (tais como pneus, pastilhas de freio, lâmpadas, bateria e cabos), que não integram a garantia.</p>
        <p><strong>4.3.</strong> Qualquer reparo em garantia deverá ser previamente submetido à oficina credenciada da VENDEDORA, perdendo a garantia caso o veículo seja desmontado ou alterado por terceiros sem expressa anuência.</p>
      </div>

      <div class="section-block">
        <h4>5. DA TRANSFERÊNCIA DE PROPRIEDADE E RESPONSABILIDADE</h4>
        <p><strong>5.1.</strong> O(A) COMPRADOR(A) se obriga a realizar a transferência de propriedade do veículo junto ao DETRAN no prazo impreterível de <strong>30 (trinta) dias</strong> corridos a contar da assinatura da ATPV-e (Art. 123 do Código de Trânsito Brasileiro).</p>
        <p><strong>5.2.</strong> A VENDEDORA responde solidariamente por eventuais débitos, multas ou impedimentos comprovadamente anteriores à data e hora da efetiva tradição/entrega da motocicleta.</p>
        <p><strong>5.3.</strong> A partir da entrega do veículo, o(a) COMPRADOR(A) assume total e irrestrita responsabilidade civil, criminal e administrativa por quaisquer infrações de trânsito e acidentes que venham a ocorrer com o veículo.</p>
      </div>

      <div class="section-block">
        <h4>6. DO FORO</h4>
        <p>Para dirimir quaisquer dúvidas oriundas do presente instrumento, as partes elegem o Foro da Comarca de <strong>Florianópolis / SC</strong>, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>
      </div>

      <div class="closing">
        <p>E, por estarem justas e contratadas, as partes assinam o presente contrato em 2 (duas) vias de igual teor e forma, na presença de 2 (duas) testemunhas.</p>
        <p class="date-line">Florianópolis - SC, ${formatDateBr()}.</p>
      </div>

      <div class="signature-grid">
        <div class="sig-box">
          <div class="sig-line"></div>
          <strong>${THE_ROCK_COMPANY.name}</strong>
          <span>VENDEDORA • CNPJ ${THE_ROCK_COMPANY.cnpj}</span>
        </div>

        <div class="sig-box">
          <div class="sig-line"></div>
          <strong>${buyer.name}</strong>
          <span>COMPRADOR(A) • CPF ${buyer.document || ''}</span>
        </div>

        <div class="sig-box">
          <div class="sig-line"></div>
          <strong>Testemunha 1</strong>
          <span>Nome: ___________________________<br>CPF: ____________________________</span>
        </div>

        <div class="sig-box">
          <div class="sig-line"></div>
          <strong>Testemunha 2</strong>
          <span>Nome: ___________________________<br>CPF: ____________________________</span>
        </div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 2. TERMO DE ENTREGA TÉCNICA E CERTIFICADO DE GARANTIA (90 DIAS CDC)
 */
export function generateWarrantyTermHtml(
  buyer: ContractParty,
  vehicle: VehicleContractData,
  deliveryDate?: string
): string {
  return `
  <div class="contract-container">
    <div class="contract-header">
      <div class="logo-title">
        <h2>THE ROCK MOTO SHOP</h2>
        <span class="sub">${THE_ROCK_COMPANY.name} • Florianópolis - SC</span>
      </div>
      <div class="doc-badge">TERMO DE ENTREGA & GARANTIA</div>
    </div>

    <div class="doc-body">
      <h3 class="contract-title">TERMO DE ENTREGA TÉCNICA E CERTIFICADO DE GARANTIA DE 90 DIAS</h3>

      <div class="section-block">
        <p>Pelo presente instrumento, a empresa <strong>${THE_ROCK_COMPANY.name}</strong> efetua a entrega formal do veículo automotor abaixo descrito ao(à) COMPRADOR(A) <strong>${buyer.name}</strong>, CPF <strong>${buyer.document || 'Não informado'}</strong>:</p>
        <table class="contract-table">
          <tr>
            <td><strong>Motocicleta:</strong> ${vehicle.brand} ${vehicle.model}</td>
            <td><strong>Ano:</strong> ${vehicle.yearFab}/${vehicle.yearModel}</td>
            <td><strong>Placa:</strong> <span class="plate-box">${vehicle.plate}</span></td>
          </tr>
          <tr>
            <td><strong>Chassi:</strong> ${vehicle.chassi || 'Conforme vistoria'}</td>
            <td><strong>Km de Entrega:</strong> ${vehicle.mileage.toLocaleString('pt-BR')} km</td>
            <td><strong>Data/Hora de Saída:</strong> ${formatDateTimeBr(deliveryDate)}</td>
          </tr>
        </table>
      </div>

      <div class="section-block">
        <h4>CHECKLIST DE ENTREGA TÉCNICA REALIZADO NA LOJA</h4>
        <div class="checklist-grid">
          <label>☑ Nível do óleo de motor e fluidos verificados</label>
          <label>☑ Pressão dos pneus e alinhamento inspecionados</label>
          <label>☑ Sistema elétrico, farol, setas e freio testados</label>
          <label>☑ Bateria com carga nominal testada</label>
          <label>☑ Documento digital / ATPV-e comunicado ao comprador</label>
          <label>☑ Chave principal e chave reserva (quando disponível)</label>
          <label>☑ Manual do proprietário entregue (quando disponível)</label>
          <label>☑ Funcionamento do motor redondo e sem ruídos estranhos</label>
        </div>
      </div>

      <div class="section-block">
        <h4>TERMOS E CONDIÇÕES DA GARANTIA LEGAL</h4>
        <p><strong>1. Prazo:</strong> 90 (noventa) dias corridos a contar da data e hora da tradição deste termo, nos moldes do Artigo 26, II da Lei 8.078/90 (Código de Defesa do Consumidor).</p>
        <p><strong>2. Abrangência:</strong> A garantia cobre defeitos mecânicos internos estritamente de <strong>MOTOR E CAIXA DE CÂMBIO</strong>.</p>
        <p><strong>3. Hipóteses de Perda da Garantia:</strong></p>
        <ul>
          <li>Falta de nível de óleo, uso de combustível adulterado ou lubrificantes inadequados;</li>
          <li>Participação em competições, rachas, arrancadas ou uso abusivo fora de estrada;</li>
          <li>Reparo, abertura ou regulagem do motor por oficina não credenciada ou sem autorização prévia por escrito da The Rock Moto Shop;</li>
          <li>Instalação de acessórios que alterem as características elétricas ou mecânicas originais (turbocompressores, escapamentos abertos com remapeamento não homologado).</li>
        </ul>
      </div>

      <div class="closing">
        <p>Declaro para os devidos fins que recebi a motocicleta em perfeitas condições de uso, funcionamento e limpeza, acompanhada de seus acessórios e documentação, concordando plenamente com os termos de garantia supracitados.</p>
        <p class="date-line">Florianópolis - SC, ${formatDateBr(deliveryDate)}.</p>
      </div>

      <div class="signature-grid" style="grid-template-columns: 1fr 1fr; margin-top: 40px;">
        <div class="sig-box">
          <div class="sig-line"></div>
          <strong>${buyer.name}</strong>
          <span>Assinatura do(a) Comprador(a)</span>
        </div>

        <div class="sig-box">
          <div class="sig-line"></div>
          <strong>${THE_ROCK_COMPANY.name}</strong>
          <span>Entrega Técnica Realizada por The Rock</span>
        </div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 3. RECIBO DE SINAL E TERMO DE RESERVA DE MOTOCICLETA
 */
export function generateDepositReceiptHtml(
  buyer: ContractParty,
  vehicle: VehicleContractData,
  financial: FinancialContractData
): string {
  const deposit = financial.depositAmount || financial.entryAmount || 1000;
  const deadlineDays = financial.reservationDeadlineDays || 5;
  const remaining = financial.salePrice - deposit;

  return `
  <div class="contract-container">
    <div class="contract-header">
      <div class="logo-title">
        <h2>THE ROCK MOTO SHOP</h2>
        <span class="sub">${THE_ROCK_COMPANY.name} • CNPJ: ${THE_ROCK_COMPANY.cnpj}</span>
      </div>
      <div class="doc-badge">RECIBO DE SINAL & RESERVA</div>
    </div>

    <div class="doc-body">
      <h3 class="contract-title">RECIBO DE SINAL, ARRAS E TERMO DE RESERVA DE VEÍCULO</h3>

      <div class="section-block">
        <p>A empresa <strong>${THE_ROCK_COMPANY.name}</strong> declara que recebeu do(a) Sr(a). <strong>${buyer.name}</strong>, portador(a) do CPF nº <strong>${buyer.document || 'Não informado'}</strong>, a quantia de:</p>
        <div class="amount-highlight">
          ${formatCurrency(deposit)}
        </div>
        <p>A título de <strong>SINAL DE NEGÓCIO E ARRAS (Art. 417 a 420 do Código Civil Brasileiro)</strong>, para garantia e reserva exclusiva de compra da seguinte motocicleta:</p>

        <table class="contract-table">
          <tr>
            <td><strong>Motocicleta:</strong> ${vehicle.brand} ${vehicle.model}</td>
            <td><strong>Ano:</strong> ${vehicle.yearFab}/${vehicle.yearModel}</td>
            <td><strong>Cor:</strong> ${vehicle.color}</td>
          </tr>
          <tr>
            <td><strong>Placa:</strong> <span class="plate-box">${vehicle.plate}</span></td>
            <td><strong>Km Atual:</strong> ${vehicle.mileage.toLocaleString('pt-BR')} km</td>
            <td><strong>Preço Total Acordado:</strong> <strong>${formatCurrency(financial.salePrice)}</strong></td>
          </tr>
        </table>
      </div>

      <div class="section-block">
        <h4>CONDIÇÕES DA RESERVA E PRAZOS</h4>
        <p><strong>1. Prazo de Validade da Reserva:</strong> O veículo permanecerá reservado com exclusividade pelo prazo de <strong>${deadlineDays} (${deadlineDays === 5 ? 'cinco' : deadlineDays}) dias úteis</strong>, a contar desta data.</p>
        <p><strong>2. Saldo Remanescente:</strong> O saldo restante de <strong>${formatCurrency(remaining)}</strong> deverá ser quitado integralmente pelo(a) COMPRADOR(A) até o término do prazo de reserva, mediante pagamento à vista ou liberação do financiamento bancário.</p>
        <p><strong>3. Desistência ou Descumprimento:</strong></p>
        <ul>
          <li>Se o negócio não se concretizar por culpa exclusiva do(a) COMPRADOR(A) (desistência voluntária), a VENDEDORA reterá o valor das arras para ressarcimento dos custos operacionais e oportunidade de venda perdida (Art. 418 do Código Civil).</li>
          <li>Caso haja reprovação inequívoca de crédito bancário e comprovada inexistência de má-fé, as partes acordam a devolução integral do sinal no prazo de 48 horas úteis.</li>
        </ul>
      </div>

      <div class="closing">
        <p class="date-line">Florianópolis - SC, ${formatDateBr()}.</p>
      </div>

      <div class="signature-grid" style="grid-template-columns: 1fr 1fr; margin-top: 50px;">
        <div class="sig-box">
          <div class="sig-line"></div>
          <strong>${THE_ROCK_COMPANY.name}</strong>
          <span>Recebedor / The Rock Moto Shop</span>
        </div>

        <div class="sig-box">
          <div class="sig-line"></div>
          <strong>${buyer.name}</strong>
          <span>Depositante / Comprador(a)</span>
        </div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 4. TERMO DE RESPONSABILIDADE SOBRE MULTAS E INFRAÇÕES DE TRÂNSITO
 */
export function generateTrafficResponsibilityHtml(
  buyer: ContractParty,
  vehicle: VehicleContractData,
  transferDate?: string
): string {
  return `
  <div class="contract-container">
    <div class="contract-header">
      <div class="logo-title">
        <h2>THE ROCK MOTO SHOP</h2>
        <span class="sub">${THE_ROCK_COMPANY.name} • Florianópolis - SC</span>
      </div>
      <div class="doc-badge">RESPONSABILIDADE DE MULTAS</div>
    </div>

    <div class="doc-body">
      <h3 class="contract-title">TERMO DE RESPONSABILIDADE CIVIL, CRIMINAL E INFRAÇÕES DE TRÂNSITO</h3>

      <div class="section-block">
        <p>Por este instrumento, <strong>${buyer.name}</strong>, CPF <strong>${buyer.document || 'Não informado'}</strong>, RG: ${buyer.rg || 'Não informado'}, residente em ${buyer.address || 'Florianópolis - SC'}, declara ter recebido na presente data a posse e guarda da motocicleta:</p>
        <table class="contract-table">
          <tr>
            <td><strong>Marca/Modelo:</strong> ${vehicle.brand} ${vehicle.model}</td>
            <td><strong>Placa:</strong> <span class="plate-box">${vehicle.plate}</span></td>
            <td><strong>Ano:</strong> ${vehicle.yearFab}/${vehicle.yearModel}</td>
          </tr>
          <tr>
            <td><strong>Hodômetro:</strong> ${vehicle.mileage.toLocaleString('pt-BR')} km</td>
            <td colspan="2"><strong>Data e Horário Exatos da Tradição:</strong> <strong>${formatDateTimeBr(transferDate)}</strong></td>
          </tr>
        </table>
      </div>

      <div class="section-block">
        <h4>DECLARAÇÃO DE RESPONSABILIDADE</h4>
        <p>O(A) COMPRADOR(A) declara-se ciente e concorda expressamente que:</p>
        <p><strong>1.</strong> Assume, a partir da data e horário exatos acima indicados, <strong>TOTAL E EXCLUSIVA RESPONSABILIDADE CIVIL, CRIMINAL E ADMINISTRATIVA</strong> por quaisquer infrações de trânsito, pontuação em CNH, pedágios, acidentes, danos a terceiros ou quaisquer atos ilícitos cometidos na condução da referida motocicleta.</p>
        <p><strong>2.</strong> Autoriza expressamente a <strong>${THE_ROCK_COMPANY.name}</strong> a apresentar o presente documento aos órgãos de trânsito competentes (DETRAN, Polícia Rodoviária Federal, Prefeituras) para fins de <em>Comunicação de Venda e Indicação de Real Infrator / Condutor</em>, na hipótese de autuações ocorridas após a entrega.</p>
        <p><strong>3.</strong> Compromete-se a efetivar a transferência de propriedade perante o DETRAN dentro do prazo legal de 30 (trinta) dias, sob pena de responder pelas sanções do Código de Trânsito Brasileiro.</p>
      </div>

      <div class="closing">
        <p class="date-line">Florianópolis - SC, ${formatDateBr(transferDate)}.</p>
      </div>

      <div class="signature-grid" style="grid-template-columns: 1fr 1fr; margin-top: 50px;">
        <div class="sig-box">
          <div class="sig-line"></div>
          <strong>${buyer.name}</strong>
          <span>Condutor(a) / Comprador(a) • CPF ${buyer.document || ''}</span>
        </div>

        <div class="sig-box">
          <div class="sig-line"></div>
          <strong>${THE_ROCK_COMPANY.name}</strong>
          <span>Vendedora / The Rock Moto Shop</span>
        </div>
      </div>
    </div>
  </div>
  `;
}
