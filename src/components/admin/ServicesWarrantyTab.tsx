'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  ShieldCheck,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  User,
  Bike,
} from 'lucide-react';

interface Motorcycle {
  id: string;
  brand: string;
  model: string;
  plate: string;
  yearModel: number;
}

interface Person {
  id: string;
  name: string;
  phone: string;
}

interface ServicesWarrantyTabProps {
  motos: Motorcycle[];
  people: Person[];
  showToast: (msg: string) => void;
}

export default function ServicesWarrantyTab({ motos, people, showToast }: ServicesWarrantyTabProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Nova OS
  const [showModalNewOs, setShowModalNewOs] = useState(false);
  const [osMotoId, setOsMotoId] = useState('');
  const [osCustomerId, setOsCustomerId] = useState('');
  const [osType, setOsType] = useState('GARANTIA_90D_CDC');
  const [osComplaint, setOsComplaint] = useState('');
  const [osMechanic, setOsMechanic] = useState('Oficina Parceira Rock');
  const [osPartDesc, setOsPartDesc] = useState('');
  const [osPartCost, setOsPartCost] = useState(0);
  const [osLaborDesc, setOsLaborDesc] = useState('');
  const [osLaborCost, setOsLaborCost] = useState(0);

  // Warranty eligibility preview
  const [warrantyInfo, setWarrantyInfo] = useState<any>(null);

  // Modal Finalizar OS
  const [selectedOsForClosing, setSelectedOsForClosing] = useState<any>(null);
  const [solutionNotes, setSolutionNotes] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        setOrders(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCheckWarranty = async (motoId: string) => {
    setOsMotoId(motoId);
    if (!motoId) {
      setWarrantyInfo(null);
      return;
    }
    try {
      const res = await fetch(`/api/services?action=check_warranty&motorcycleId=${motoId}`);
      if (res.ok) {
        const info = await res.json();
        setWarrantyInfo(info);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateOs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!osMotoId || !osCustomerId || !osComplaint) {
      alert('Preencha os campos obrigatórios');
      return;
    }

    const items = [];
    if (osPartDesc && osPartCost > 0) {
      items.push({
        type: 'PECA' as const,
        description: osPartDesc,
        quantity: 1,
        unitCost: Number(osPartCost),
      });
    }
    if (osLaborDesc && osLaborCost > 0) {
      items.push({
        type: 'SERVICO' as const,
        description: osLaborDesc,
        quantity: 1,
        unitCost: Number(osLaborCost),
      });
    }

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          motorcycleId: osMotoId,
          customerId: osCustomerId,
          type: osType,
          complaintDescription: osComplaint,
          mechanicName: osMechanic,
          items,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        showToast(`Ordem de Serviço ${created.code} aberta com sucesso!`);
        setShowModalNewOs(false);
        setOsComplaint('');
        setOsPartDesc('');
        setOsPartCost(0);
        setOsLaborDesc('');
        setOsLaborCost(0);
        loadOrders();
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao abrir OS');
      }
    } catch {
      alert('Erro de conexão');
    }
  };

  const handleFinalizeOs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOsForClosing || !solutionNotes) return;

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'finalize',
          orderId: selectedOsForClosing.id,
          solutionNotes,
        }),
      });

      if (res.ok) {
        showToast(`OS ${selectedOsForClosing.code} finalizada! Custo lançado em despesas de pós-venda.`);
        setSelectedOsForClosing(null);
        setSolutionNotes('');
        loadOrders();
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao finalizar OS');
      }
    } catch {
      alert('Erro de conexão');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-purple-600" /> Pós-Venda, Serviços & Garantia 90D CDC (PRD 13)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Gestão de chamados em garantia legal, ordens de serviço (OS) e separação contábil de despesas de pós-venda
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setWarrantyInfo(null);
              setShowModalNewOs(true);
            }}
            className="px-3.5 py-2 bg-[#6d3df5] hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nova Ordem de Serviço
          </button>
          <button
            onClick={loadOrders}
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
          <span className="text-[11px] font-bold text-slate-400 block mb-1">OS Abertas / Em Execução</span>
          <span className="text-2xl font-black text-amber-600">
            {orders.filter((o) => o.status !== 'FINALIZADA' && o.status !== 'CANCELADA').length}
          </span>
          <span className="text-[10px] text-amber-700 font-semibold block mt-1">Aguardando oficina/peças</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Cobertura Garantia CDC</span>
          <span className="text-2xl font-black text-emerald-600">
            {orders.filter((o) => o.type === 'GARANTIA_90D_CDC' && o.warrantyApproved).length}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">90 dias CDC Assegurados</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Custo Total em Garantia</span>
          <span className="text-2xl font-black text-slate-900">
            R$ {orders.reduce((acc, o) => acc + (o.totalCost || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold block mt-1">Classificado como Despesa Pós-Venda</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">OS Concluídas</span>
          <span className="text-2xl font-black text-purple-600">
            {orders.filter((o) => o.status === 'FINALIZADA').length}
          </span>
          <span className="text-[10px] text-purple-700 font-semibold block mt-1">Clientes atendidos</span>
        </div>
      </div>

      {/* Lista de Ordens de Serviço */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900">Ordens de Serviço e Chamados</h3>
          <span className="text-xs text-slate-400 font-semibold">{orders.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Código / Tipo</th>
                <th className="py-3 px-4">Veículo & Cliente</th>
                <th className="py-3 px-4">Reclamação do Cliente</th>
                <th className="py-3 px-4">Mecânico / Oficina</th>
                <th className="py-3 px-4">Custo Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((os) => (
                <tr key={os.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900 block">{os.code}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        os.type === 'GARANTIA_90D_CDC'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {os.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">
                      {os.motorcycle?.brand} {os.motorcycle?.model} ({os.motorcycle?.plate})
                    </div>
                    <div className="text-[11px] text-slate-400">{os.customer?.name}</div>
                  </td>
                  <td className="py-3 px-4 max-w-xs text-slate-700">
                    <div className="line-clamp-2">{os.complaintDescription}</div>
                    {os.solutionNotes && (
                      <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">
                        Solução: {os.solutionNotes}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600">{os.mechanicName || 'Oficina Rock'}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    R$ {os.totalCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        os.status === 'FINALIZADA'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {os.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {os.status !== 'FINALIZADA' && (
                      <button
                        onClick={() => {
                          setSelectedOsForClosing(os);
                          setSolutionNotes('');
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Concluir OS
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova OS */}
      {showModalNewOs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-purple-600" /> Abertura de Ordem de Serviço (Pós-Venda)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Registra o chamado, analisa garantia CDC 90 dias e vincula custos de peças e mão de obra.
            </p>

            <form onSubmit={handleCreateOs} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motocicleta *</label>
                <select
                  required
                  value={osMotoId}
                  onChange={(e) => handleCheckWarranty(e.target.value)}
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

              {warrantyInfo && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold ${
                    warrantyInfo.isEligible
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  {warrantyInfo.isEligible ? (
                    <div>
                      🛡️ <b>Garantia Legal CDC Ativa:</b> Veículo vendido há {warrantyInfo.daysSinceSale} dias ({warrantyInfo.remainingDays} dias restantes de garantia). Cobertura aprovada!
                    </div>
                  ) : (
                    <div>
                      ⚠️ <b>Fora do Prazo CDC:</b> Veículo vendido há mais de 90 dias ou venda direta sem garantia.
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cliente Solicitante *</label>
                <select
                  required
                  value={osCustomerId}
                  onChange={(e) => setOsCustomerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  <option value="">Selecione o cliente...</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de OS</label>
                  <select
                    value={osType}
                    onChange={(e) => setOsType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="GARANTIA_90D_CDC">Garantia 90D CDC</option>
                    <option value="MANUTENCAO_REVISAO">Manutenção / Revisão</option>
                    <option value="ACESSORIOS_CUSTOM">Acessórios / Customização</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Oficina / Mecânico</label>
                  <input
                    type="text"
                    value={osMechanic}
                    onChange={(e) => setOsMechanic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Relato do Cliente (Reclamação) *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ex: Barulho na suspensão dianteira ao passar em lombadas"
                  value={osComplaint}
                  onChange={(e) => setOsComplaint(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              {/* Itens Iniciais (Peça e Mão de Obra) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">Peças e Mão de Obra Estimadas</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Descrição da Peça (ex: Retentor bengala)"
                      value={osPartDesc}
                      onChange={(e) => setOsPartDesc(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Custo (R$)"
                      value={osPartCost}
                      onChange={(e) => setOsPartCost(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Descrição Mão de Obra (ex: Troca óleo bengala)"
                      value={osLaborDesc}
                      onChange={(e) => setOsLaborDesc(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Custo (R$)"
                      value={osLaborCost}
                      onChange={(e) => setOsLaborCost(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModalNewOs(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                >
                  Abrir Ordem de Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Concluir OS */}
      {selectedOsForClosing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Conclusão da OS {selectedOsForClosing.code}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Informe a solução técnica executada. O custo de R$ {selectedOsForClosing.totalCost.toFixed(2)} será lançado como despesa de pós-venda no financeiro.
            </p>

            <form onSubmit={handleFinalizeOs} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Solução Aplicada *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Troca de pastilhas dianteiras e sangria do sistema concluída com sucesso. Teste de rodagem OK."
                  value={solutionNotes}
                  onChange={(e) => setSolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOsForClosing(null)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                >
                  Finalizar e Baixar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
