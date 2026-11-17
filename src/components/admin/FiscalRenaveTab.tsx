'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Landmark,
  ShieldCheck,
  Plus,
  RefreshCw,
  QrCode,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileCode,
  Zap,
  Printer,
  Copy,
} from 'lucide-react';

interface Motorcycle {
  id: string;
  brand: string;
  model: string;
  plate: string;
  publicPrice: number;
}

interface Person {
  id: string;
  name: string;
  document?: string;
}

interface FiscalRenaveTabProps {
  motos: Motorcycle[];
  people: Person[];
  showToast: (msg: string) => void;
}

export default function FiscalRenaveTab({ motos, people, showToast }: FiscalRenaveTabProps) {
  const [subTab, setSubTab] = useState<'nfe' | 'pix' | 'renave'>('nfe');
  const [fiscalDocs, setFiscalDocs] = useState<any[]>([]);
  const [bankCharges, setBankCharges] = useState<any[]>([]);
  const [renaveOps, setRenaveOps] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal Emissão NFe
  const [showModalNfe, setShowModalNfe] = useState(false);
  const [nfeType, setNfeType] = useState<'NFE_SAIDA_5102' | 'NFE_ENTRADA_1102'>('NFE_SAIDA_5102');
  const [nfeMotoId, setNfeMotoId] = useState('');
  const [nfeCustomerId, setNfeCustomerId] = useState('');
  const [nfeValor, setNfeValor] = useState(0);

  // Modal Visualização DANFE / XML
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [showModalDanfe, setShowModalDanfe] = useState(false);

  // Modal Criação Pix
  const [showModalPix, setShowModalPix] = useState(false);
  const [pixAmount, setPixAmount] = useState(1500);
  const [pixCustomerName, setPixCustomerName] = useState('');
  const [createdPix, setCreatedPix] = useState<any>(null);

  // Modal Registro RENAVE
  const [showModalRenave, setShowModalRenave] = useState(false);
  const [renaveMotoId, setRenaveMotoId] = useState('');
  const [renaveType, setRenaveType] = useState<'ENTRADA_ESTOQUE' | 'SAIDA_VENDA'>('ENTRADA_ESTOQUE');
  const [renaveCrv, setRenaveCrv] = useState('123456789012');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/fiscal');
      if (res.ok) {
        const data = await res.json();
        setFiscalDocs(data.fiscalDocuments || []);
        setBankCharges(data.bankCharges || []);
        setRenaveOps(data.renaveOperations || []);
        setMetrics(data.metrics || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueNfe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nfeMotoId || nfeValor <= 0) {
      alert('Selecione uma moto e um valor válido');
      return;
    }
    try {
      const res = await fetch('/api/fiscal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'issue_nfe',
          type: nfeType,
          motorcycleId: nfeMotoId,
          customerId: nfeCustomerId || null,
          valorTotal: Number(nfeValor),
        }),
      });

      if (res.ok) {
        const doc = await res.json();
        showToast(`NF-e nº ${doc.number} emitida e autorizada na SEFAZ (Ambiente Homologação)!`);
        setShowModalNfe(false);
        loadData();
        setSelectedDoc(doc);
        setShowModalDanfe(true);
      } else {
        const err = await res.json();
        alert(err.error || 'Erro na emissão fiscal');
      }
    } catch {
      alert('Erro de conexão');
    }
  };

  const handleCreatePix = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/fiscal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_pix',
          amount: Number(pixAmount),
          customerName: pixCustomerName || 'Cliente Balcão',
          provider: 'BANCO_INTER',
        }),
      });

      if (res.ok) {
        const charge = await res.json();
        setCreatedPix(charge);
        showToast('Cobrança Pix Dinâmica gerada com sucesso!');
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateWebhookPix = async (txid: string, amount: number) => {
    try {
      const res = await fetch('/api/fiscal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bank_webhook',
          txid,
          valorPago: amount,
          endToEndId: `E00416968${Date.now()}SIMULADO`,
        }),
      });

      if (res.ok) {
        showToast('Webhook bancário recebido: Pix liquidado e conciliado no Financeiro!');
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterRenave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renaveMotoId) {
      alert('Selecione uma moto');
      return;
    }
    try {
      const res = await fetch('/api/fiscal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'renave_op',
          motorcycleId: renaveMotoId,
          operationType: renaveType,
          crvNumero: renaveCrv,
        }),
      });

      if (res.ok) {
        const op = await res.json();
        showToast(`Operação RENAVE integrada com sucesso! Protocolo: ${op.protocolo}`);
        setShowModalRenave(false);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-purple-600" /> Fiscal, Bancos & RENAVE (PRD 12)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Emissão de NF-e (1.102/5.102), cobranças Pix dinâmicas com liquidação por Webhook e SERPRO RENAVE
          </p>
        </div>

        <div className="flex items-center gap-2">
          {subTab === 'nfe' && (
            <button
              onClick={() => setShowModalNfe(true)}
              className="px-3.5 py-2 bg-[#6d3df5] hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Emitir NF-e
            </button>
          )}

          {subTab === 'pix' && (
            <button
              onClick={() => {
                setCreatedPix(null);
                setShowModalPix(true);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <QrCode className="w-4 h-4" /> Gerar Pix Dinâmico
            </button>
          )}

          {subTab === 'renave' && (
            <button
              onClick={() => setShowModalRenave(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Registrar RENAVE
            </button>
          )}

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">NF-e Autorizadas</span>
          <span className="text-2xl font-black text-slate-900">{metrics?.totalNFeIssued || 0}</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">CFOP 5.102 / 1.102</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Pix Pendentes</span>
          <span className="text-2xl font-black text-amber-600">{metrics?.totalPixPending || 0}</span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">Aguardando liquidação</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Pix Conciliados</span>
          <span className="text-2xl font-black text-emerald-600">{metrics?.totalPixPaid || 0}</span>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">Baixa automática via Webhook</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Operações RENAVE</span>
          <span className="text-2xl font-black text-blue-600">{metrics?.totalRenaveActive || 0}</span>
          <span className="text-[10px] text-blue-700 font-semibold block mt-1">Integradas com SERPRO</span>
        </div>
      </div>

      {/* Sub-tabs Selector */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setSubTab('nfe')}
          className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            subTab === 'nfe'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" /> 12A — Notas Fiscais (NF-e)
        </button>

        <button
          onClick={() => setSubTab('pix')}
          className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            subTab === 'pix'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Landmark className="w-4 h-4" /> 12B — Bancos & Pix Conciliado
        </button>

        <button
          onClick={() => setSubTab('renave')}
          className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            subTab === 'renave'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> 12C — RENAVE (SERPRO)
        </button>
      </div>

      {/* SUB-TAB 12A: NF-e */}
      {subTab === 'nfe' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">Documentos Fiscais Eletrônicos</h3>
            <span className="text-xs text-slate-400 font-semibold">{fiscalDocs.length} documentos emitidos</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Número / Série</th>
                  <th className="py-3 px-4">Tipo & CFOP</th>
                  <th className="py-3 px-4">Veículo / Destinatário</th>
                  <th className="py-3 px-4">Valor Total</th>
                  <th className="py-3 px-4">Status & Protocolo</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fiscalDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      NF-e {doc.number} / {doc.series}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-purple-700 block">{doc.naturezaOperacao}</span>
                      <span className="text-[10px] text-slate-400 font-mono">CFOP {doc.cfop}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">
                        {doc.motorcycle?.brand} {doc.motorcycle?.model} ({doc.motorcycle?.plate})
                      </div>
                      <div className="text-[11px] text-slate-400">{doc.customer?.name || 'Consumidor Final'}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      R$ {doc.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1">
                        {doc.status}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono">Prot: {doc.protocolNumber}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedDoc(doc);
                          setShowModalDanfe(true);
                        }}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> Ver DANFE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 12B: Bancos & Pix */}
      {subTab === 'pix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">Cobranças Pix Dinâmicas (Banco Inter)</h3>
            <span className="text-xs text-slate-400 font-semibold">{bankCharges.length} cobranças registradas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">TXID</th>
                  <th className="py-3 px-4">Pagador</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Vencimento / Baixa</th>
                  <th className="py-3 px-4 text-right">Simulação Webhook</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bankCharges.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{c.txid}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{c.customerName || 'Cliente'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.customerDoc}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      R$ {c.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'PAGO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      {c.paidAt
                        ? `Pago em ${new Date(c.paidAt).toLocaleString('pt-BR')}`
                        : `Vence ${new Date(c.dueDate).toLocaleDateString('pt-BR')}`}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {c.status === 'PENDENTE' && (
                        <button
                          onClick={() => handleSimulateWebhookPix(c.txid, c.amount)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Zap className="w-3.5 h-3.5 text-emerald-600" /> Simular Pagamento Webhook
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 12C: RENAVE */}
      {subTab === 'renave' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">Operações Oficiais RENAVE (SERPRO)</h3>
            <span className="text-xs text-slate-400 font-semibold">{renaveOps.length} registros no SERPRO</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Protocolo RENAVE</th>
                  <th className="py-3 px-4">Operação</th>
                  <th className="py-3 px-4">Veículo / Placa</th>
                  <th className="py-3 px-4">Renavam / Chassi</th>
                  <th className="py-3 px-4">Status SERPRO</th>
                  <th className="py-3 px-4">Data Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {renaveOps.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{op.protocolo}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {op.operationType === 'ENTRADA_ESTOQUE' ? 'Entrada no Estoque' : 'Saída por Venda'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        {op.motorcycle?.brand} {op.motorcycle?.model}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">{op.motorcycle?.plate}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      <div>Renavam: {op.renavam}</div>
                      <div>Chassi: {op.chassis}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                        {op.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(op.createdAt).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Emitir NF-e */}
      {showModalNfe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-purple-600" /> Emitir NF-e Avulsa (Homologação SEFAZ)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Gera a NF-e oficial com chave de 44 dígitos, protocolo SEFAZ e DANFE automático.
            </p>

            <form onSubmit={handleIssueNfe} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Operação</label>
                <select
                  value={nfeType}
                  onChange={(e: any) => setNfeType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  <option value="NFE_SAIDA_5102">Saída / Venda de Veículo Usado (CFOP 5.102)</option>
                  <option value="NFE_ENTRADA_1102">Entrada / Compra de Veículo para Revenda (CFOP 1.102)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motocicleta</label>
                <select
                  required
                  value={nfeMotoId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setNfeMotoId(id);
                    const moto = motos.find((m) => m.id === id);
                    if (moto) setNfeValor(moto.publicPrice);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  <option value="">Selecione o veículo...</option>
                  {motos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.brand} {m.model} ({m.plate}) - R$ {m.publicPrice?.toLocaleString('pt-BR')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destinatário / Cliente</label>
                <select
                  value={nfeCustomerId}
                  onChange={(e) => setNfeCustomerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                >
                  <option value="">Consumidor Final (Sem cadastro)</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.document || 'Sem CPF/CNPJ'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Valor Total da Nota (R$)</label>
                <input
                  type="number"
                  required
                  value={nfeValor}
                  onChange={(e) => setNfeValor(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModalNfe(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                >
                  Transmitir NF-e SEFAZ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal DANFE / Visualização Fiscal */}
      {showModalDanfe && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" /> DANFE - Documento Auxiliar da NF-e
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Chave: {selectedDoc.chNFe}</span>
              </div>
              <button
                onClick={() => setShowModalDanfe(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 font-sans text-xs">
              <div className="flex justify-between border-b pb-2">
                <div>
                  <div className="font-extrabold text-sm">THE ROCK MOTO SHOP LTDA</div>
                  <div className="text-slate-500">CNPJ: 48.920.112/0001-94 · IE: 112.345.678.110</div>
                  <div className="text-slate-500">Av. das Nações, 1420 - Florianópolis/SC</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-700">DANFE NF-e Nº {selectedDoc.number}</div>
                  <div className="font-mono text-slate-500">SÉRIE: {selectedDoc.series}</div>
                  <div className="font-mono text-[10px] text-emerald-700">PROTOCOLO: {selectedDoc.protocolNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <b>Natureza da Operação:</b> {selectedDoc.naturezaOperacao}
                </div>
                <div>
                  <b>CFOP:</b> {selectedDoc.cfop}
                </div>
                <div>
                  <b>Destinatário:</b> {selectedDoc.customer?.name || 'CONSUMIDOR FINAL'}
                </div>
                <div>
                  <b>Veículo:</b> {selectedDoc.motorcycle?.brand} {selectedDoc.motorcycle?.model} (Placa: {selectedDoc.motorcycle?.plate})
                </div>
              </div>

              <div className="border-t pt-2 flex justify-between font-bold text-sm text-slate-900">
                <span>VALOR TOTAL DA NOTA FISCAL</span>
                <span>R$ {selectedDoc.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="mt-4 p-3 bg-white border border-slate-200 rounded-lg">
                <span className="font-bold text-[11px] text-slate-700 block mb-1">XML da NF-e Simulado (PRD 12A)</span>
                <pre className="text-[9px] font-mono bg-slate-900 text-emerald-400 p-3 rounded overflow-x-auto max-h-36">
                  {selectedDoc.xmlContent}
                </pre>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir DANFE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criação Pix */}
      {showModalPix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" /> Gerar Cobrança Pix Dinâmica (PRD 12B)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Gera payload EMV com conciliação automática por Webhook.
            </p>

            {!createdPix ? (
              <form onSubmit={handleCreatePix} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Pagador</label>
                  <input
                    type="text"
                    required
                    value={pixCustomerName}
                    onChange={(e) => setPixCustomerName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    required
                    value={pixAmount}
                    onChange={(e) => setPixAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModalPix(false)}
                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                  >
                    Gerar Pix
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left text-xs font-mono">
                  <div className="font-bold text-emerald-900 mb-1">TXID: {createdPix.txid}</div>
                  <div className="text-emerald-700">Valor: R$ {createdPix.amount.toFixed(2)}</div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 text-left">
                    Código Pix Copia e Cola:
                  </label>
                  <textarea
                    readOnly
                    rows={3}
                    value={createdPix.qrCodeText}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px] select-all"
                  />
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdPix.qrCodeText);
                    showToast('Código Pix copiado!');
                  }}
                  className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Copiar Código Pix
                </button>

                <button
                  onClick={() => {
                    handleSimulateWebhookPix(createdPix.txid, createdPix.amount);
                    setShowModalPix(false);
                  }}
                  className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5" /> Simular Pagamento Imediato (Webhook)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Registro RENAVE */}
      {showModalRenave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> Registrar Movimentação RENAVE
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Integração com SERPRO / Ministério dos Transportes para entrada e saída de veículos.
            </p>

            <form onSubmit={handleRegisterRenave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Operação</label>
                <select
                  value={renaveType}
                  onChange={(e: any) => setRenaveType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  <option value="ENTRADA_ESTOQUE">Entrada de Veículo em Estoque</option>
                  <option value="SAIDA_VENDA">Saída de Veículo por Venda</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motocicleta</label>
                <select
                  required
                  value={renaveMotoId}
                  onChange={(e) => setRenaveMotoId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  <option value="">Selecione o veículo...</option>
                  {motos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.brand} {m.model} ({m.plate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Número do CRV / ATPV-e</label>
                <input
                  type="text"
                  required
                  value={renaveCrv}
                  onChange={(e) => setRenaveCrv(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModalRenave(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                >
                  Enviar ao SERPRO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
