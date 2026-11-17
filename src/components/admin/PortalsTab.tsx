'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Share2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  PauseCircle,
  PlayCircle,
  Trash2,
  Plus,
  Send,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface Motorcycle {
  id: string;
  brand: string;
  model: string;
  plate: string;
  yearModel: number;
  publicPrice: number;
  status: string;
  imageUrl?: string;
  chassis?: string;
  description?: string;
}

interface PortalsTabProps {
  motos: Motorcycle[];
  showToast: (msg: string) => void;
}

export default function PortalsTab({ motos, showToast }: PortalsTabProps) {
  const [providers, setProviders] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Modal / Form Publicação
  const [selectedMotoId, setSelectedMotoId] = useState('');
  const [targetPortal, setTargetPortal] = useState('WEBMOTORS');

  // Modal Ingestão de Lead Webhook Simulado
  const [showModalWebhook, setShowModalWebhook] = useState(false);
  const [simLeadName, setSimLeadName] = useState('Lucas Silveira');
  const [simLeadPhone, setSimLeadPhone] = useState('(11) 98844-3322');
  const [simLeadEmail, setSimLeadEmail] = useState('lucas.silveira@gmail.com');
  const [simLeadMsg, setSimLeadMsg] = useState('Boa tarde! Tenho interesse nessa moto. Aceita carro como entrada?');
  const [simLeadPlate, setSimLeadPlate] = useState('');

  const loadPortalData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/portals');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
        setLogs(data.recentLogs || []);
        setMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, []);

  const handleSyncAction = async (providerCode: string, motorcycleId: string, listingAction: string) => {
    try {
      setSyncing(true);
      const res = await fetch('/api/portals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          providerCode,
          motorcycleId,
          listingAction,
        }),
      });

      if (res.ok) {
        showToast(`Operação ${listingAction} sincronizada com o parceiro ${providerCode}!`);
        loadPortalData();
      } else {
        const err = await res.json();
        alert(err.error || 'Erro na sincronização');
      }
    } catch {
      alert('Erro de comunicação com a integração.');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleProvider = async (providerId: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/portals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_provider',
          providerId,
          isActive: !currentActive,
        }),
      });
      if (res.ok) {
        showToast('Status do canal de integração atualizado.');
        loadPortalData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateWebhookLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/portals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'webhook',
          providerCode: targetPortal,
          payload: {
            externalId: `WH-LEAD-${Date.now()}`,
            name: simLeadName,
            phone: simLeadPhone,
            email: simLeadEmail,
            message: simLeadMsg,
            motorcyclePlate: simLeadPlate || (motos[0]?.plate || ''),
          },
        }),
      });

      if (res.ok) {
        const result = await res.json();
        showToast(`Webhook processado! Lead criado no CRM com sucesso (${result.status})`);
        setShowModalWebhook(false);
        loadPortalData();
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao processar webhook');
      }
    } catch {
      alert('Erro de conexão');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-600" /> Integração com Portais & Anúncios (PRD 11)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Publicação multicanal unificada em Webmotors, OLX e iCarros com despublicação automática na venda
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModalWebhook(true)}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-purple-200 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-purple-600" /> Simular Webhook de Lead
          </button>
          <button
            onClick={loadPortalData}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition cursor-pointer"
            title="Recarregar dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Canais Conectados</span>
          <span className="text-2xl font-black text-slate-900">
            {providers.filter((p) => p.isActive).length} / {providers.length}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">APIs Homologadas ativas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Anúncios no Ar</span>
          <span className="text-2xl font-black text-purple-600">{metrics?.totalActiveListings || 0}</span>
          <span className="text-[10px] text-slate-500 font-semibold block mt-1">Sincronizados em tempo real</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Erros de Sincronização</span>
          <span className="text-2xl font-black text-rose-600">{metrics?.totalErrors || 0}</span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">Retentativa automática ativa</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Despublicação Automática</span>
          <span className="text-2xl font-black text-emerald-600">Ativa</span>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">Despublica moto na venda</span>
        </div>
      </div>

      {/* Provedores Conectados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {providers.map((p) => (
          <div
            key={p.id}
            className={`p-4 rounded-2xl border transition ${
              p.isActive ? 'bg-white border-purple-200 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-sm text-slate-900">{p.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {p.isActive ? 'ATIVO' : 'PAUSADO'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Ambiente: <b>{p.environment}</b>
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-[10px] text-slate-400 font-mono">
                {p.listings?.length || 0} anúncio(s)
              </span>
              <button
                onClick={() => handleToggleProvider(p.id, p.isActive)}
                className="text-[11px] text-purple-600 hover:text-purple-800 font-bold cursor-pointer"
              >
                {p.isActive ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Publicador Rápido de Estoque */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-purple-600" /> Publicar Veículo nos Portais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Selecione a Moto do Estoque</label>
            <select
              value={selectedMotoId}
              onChange={(e) => setSelectedMotoId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
            >
              <option value="">Selecione uma moto...</option>
              {motos
                .filter((m) => m.status === 'DISPONIVEL')
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.brand} {m.model} ({m.plate}) - R$ {m.publicPrice?.toLocaleString('pt-BR')}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Canal de Destino</label>
            <select
              value={targetPortal}
              onChange={(e) => setTargetPortal(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
            >
              <option value="WEBMOTORS">Webmotors (Homologação)</option>
              <option value="OLX">OLX Brasil (Homologação)</option>
              <option value="ICARROS">iCarros Itaú (Homologação)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                if (!selectedMotoId) {
                  alert('Selecione uma moto primeiro');
                  return;
                }
                handleSyncAction(targetPortal, selectedMotoId, 'PUBLISH');
              }}
              disabled={syncing || !selectedMotoId}
              className="w-full py-2.5 bg-[#6d3df5] hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <Zap className="w-4 h-4" /> Enviar Anúncio ao Portal
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Anúncios Ativos nos Portais */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900">Anúncios Sincronizados nos Portais</h3>
          <span className="text-xs text-slate-400 font-semibold">
            {providers.reduce((acc, p) => acc + (p.listings?.length || 0), 0)} anúncios registrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Portal</th>
                <th className="py-3 px-4">Veículo</th>
                <th className="py-3 px-4">Preço Anunciado</th>
                <th className="py-3 px-4">Status Portal</th>
                <th className="py-3 px-4">Última Sincronização</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {providers.flatMap((p) =>
                (p.listings || []).map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-bold text-purple-700">{p.name}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        {l.motorcycle?.brand} {l.motorcycle?.model}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">{l.motorcycle?.plate}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      R$ {l.publishedPrice?.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          l.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : l.status === 'PAUSED'
                            ? 'bg-amber-100 text-amber-800'
                            : l.status === 'REMOVED'
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {l.lastSyncAt ? new Date(l.lastSyncAt).toLocaleString('pt-BR') : 'Pendente'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {l.status === 'PUBLISHED' ? (
                        <button
                          onClick={() => handleSyncAction(p.code, l.motorcycleId, 'PAUSE')}
                          className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-[11px] font-bold cursor-pointer"
                        >
                          Pausar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSyncAction(p.code, l.motorcycleId, 'PUBLISH')}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-bold cursor-pointer"
                        >
                          Reativar
                        </button>
                      )}
                      <button
                        onClick={() => handleSyncAction(p.code, l.motorcycleId, 'REMOVE')}
                        className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-bold cursor-pointer"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log de Sincronizações e Webhooks */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-600" /> Log de Comunicação e Idempotência (PRD 11)
        </h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                <span className="font-bold text-slate-800">[{log.provider?.name}]</span>
                <span className="text-purple-700 font-semibold">{log.action}</span>
                <span className="text-slate-500">{log.status}</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {new Date(log.createdAt).toLocaleTimeString('pt-BR')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Simular Webhook de Lead */}
      {showModalWebhook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" /> Simular Webhook de Lead Externo
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Dispara a ingestão de um lead externo como se viesse da API da Webmotors ou OLX.
            </p>

            <form onSubmit={handleSimulateWebhookLead} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Lead</label>
                <input
                  type="text"
                  required
                  value={simLeadName}
                  onChange={(e) => setSimLeadName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    required
                    value={simLeadPhone}
                    onChange={(e) => setSimLeadPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={simLeadEmail}
                    onChange={(e) => setSimLeadEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Placa do Veículo</label>
                <input
                  type="text"
                  placeholder="Ex: BRA2E19"
                  value={simLeadPlate}
                  onChange={(e) => setSimLeadPlate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mensagem</label>
                <textarea
                  rows={2}
                  value={simLeadMsg}
                  onChange={(e) => setSimLeadMsg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModalWebhook(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Disparar Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
