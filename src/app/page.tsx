'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bike, 
  Search, 
  Phone, 
  ShieldCheck, 
  SlidersHorizontal, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Lock 
} from 'lucide-react';

interface MotoPublic {
  id: string;
  brand: string;
  model: string;
  version: string | null;
  yearMfg: number;
  yearModel: number;
  color: string;
  mileage: number;
  status: string;
  publicPrice: number;
  description: string | null;
  imageUrl: string | null;
}

export default function VitrinePage() {
  const [motos, setMotos] = useState<MotoPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [selectedMoto, setSelectedMoto] = useState<MotoPublic | null>(null);

  // Form de lead
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadMsg, setLeadMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/motorcycles?public=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMotos(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const brands = ['ALL', ...Array.from(new Set(motos.map((m) => m.brand)))];

  const filteredMotos = motos.filter((m) => {
    const matchesSearch =
      m.model.toLowerCase().includes(search.toLowerCase()) ||
      m.brand.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = brandFilter === 'ALL' || m.brand === brandFilter;
    return matchesSearch && matchesBrand;
  });

  const handleOpenModal = (moto: MotoPublic) => {
    setSelectedMoto(moto);
    setLeadMsg(`Olá! Gostei da ${moto.brand} ${moto.model} (${moto.yearMfg}/${moto.yearModel}) e gostaria de mais detalhes.`);
    setLeadSuccess(false);
  };

  const handleSendLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone || !selectedMoto) return;

    setSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName,
          phone: leadPhone,
          message: leadMsg,
          motorcycleId: selectedMoto.id,
          source: 'VITRINE_SITE',
        }),
      });
      setLeadSuccess(true);
      setTimeout(() => {
        // Redireciona para o WhatsApp após salvar o lead
        const text = encodeURIComponent(`Olá! Meu nome é ${leadName}. Tenho interesse na ${selectedMoto.brand} ${selectedMoto.model} (R$ ${selectedMoto.publicPrice.toLocaleString('pt-BR')}). ${leadMsg}`);
        window.open(`https://wa.me/5548991234567?text=${text}`, '_blank');
      }, 1000);
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar contato. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Topo / Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-purple-700 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
                The Rock <span className="text-purple-600">Moto Shop</span>
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                Florianópolis · SC <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Estoque verificado
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/5548991234567"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition"
            >
              <Phone className="w-4 h-4 text-emerald-600" /> (48) 99123-4567
            </a>

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-purple-900 rounded-xl shadow-sm transition"
            >
              <Lock className="w-4 h-4" /> Acessar Painel
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-4 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Motos Premium Revisadas & Prontas para Rodar
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Encontre a moto ideal para sua próxima aventura
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 font-normal">
            Todas as motos passam por inspeção de mais de 50 itens, com procedência garantida e documentação 100% regularizada.
          </p>

          {/* Barra de Busca rápida */}
          <div className="bg-white p-2.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto text-slate-800">
            <div className="flex-1 flex items-center gap-2.5 px-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por modelo (ex: BMW F 850, CB 500F...)"
                className="w-full bg-transparent border-0 outline-none text-sm placeholder:text-slate-400 font-medium"
              />
            </div>
            <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 ml-1" />
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none pr-4 py-2 cursor-pointer"
              >
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b === 'ALL' ? 'Todas as marcas' : b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Motos */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Motos no Estoque</h2>
            <p className="text-sm text-slate-500">
              {filteredMotos.length} {filteredMotos.length === 1 ? 'moto disponível' : 'motos disponíveis'} hoje
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Carregando motos disponíveis...
          </div>
        ) : filteredMotos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 max-w-md mx-auto">
            <Bike className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">Nenhuma moto encontrada</h3>
            <p className="text-sm text-slate-500 mb-4">Tente mudar o termo de busca ou o filtro de marca.</p>
            <button
              onClick={() => { setSearch(''); setBrandFilter('ALL'); }}
              className="px-4 py-2 text-sm font-semibold text-purple-700 bg-purple-50 rounded-lg"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMotos.map((moto) => (
              <div
                key={moto.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Imagem / Card visual */}
                <div className="h-52 bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden text-white">
                  <Bike className="w-24 h-24 text-slate-700 group-hover:scale-110 transition duration-300" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white/90 text-slate-900 shadow">
                      {moto.brand}
                    </span>
                    {moto.status === 'RESERVADA' ? (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 text-white shadow">
                        Reservada
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500 text-white shadow">
                        Disponível
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 text-xs bg-black/60 px-2 py-0.5 rounded text-slate-300">
                    {moto.mileage.toLocaleString('pt-BR')} km
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-purple-600 transition">
                      {moto.model}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4 flex items-center gap-2">
                      <span>Ano: <b>{moto.yearMfg}/{moto.yearModel}</b></span>
                      <span>•</span>
                      <span>Cor: <b>{moto.color}</b></span>
                    </p>

                    {moto.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {moto.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Preço à vista</span>
                      <span className="text-2xl font-black text-slate-900">
                        R$ {moto.publicPrice.toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenModal(moto)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 transition cursor-pointer"
                    >
                      Tenho interesse <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Lead / Tenho interesse */}
      {selectedMoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setSelectedMoto(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center bg-slate-100"
            >
              ✕
            </button>

            {leadSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
                <h3 className="text-2xl font-black text-slate-900 mb-2">Proposta Registrada!</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Seu interesse na <b>{selectedMoto.brand} {selectedMoto.model}</b> foi gravado no nosso sistema.
                  Estamos redirecionando você para o WhatsApp do nosso consultor...
                </p>
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 block mb-1">
                    Fale com nosso consultor
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    Interesse: {selectedMoto.brand} {selectedMoto.model}
                  </h3>
                  <p className="text-sm font-semibold text-emerald-600 mt-1">
                    Preço especial: R$ {selectedMoto.publicPrice.toLocaleString('pt-BR')}
                  </p>
                </div>

                <form onSubmit={handleSendLead} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Seu Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Seu WhatsApp com DDD *</label>
                    <input
                      type="tel"
                      required
                      placeholder="(48) 99999-9999"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mensagem ou Dúvida</label>
                    <textarea
                      rows={3}
                      value={leadMsg}
                      onChange={(e) => setLeadMsg(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-[11px] text-slate-500">
                      Seus dados são protegidos e usados apenas para o atendimento desta negociação.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? 'Registrando...' : 'Confirmar e Abrir no WhatsApp'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Rodapé da Vitrine */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 The Rock Moto Shop · Florianópolis, SC. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-slate-300 hover:text-white font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" /> Acesso de Colaboradores
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
