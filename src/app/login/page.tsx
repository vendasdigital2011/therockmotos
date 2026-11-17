'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bike, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('cassio@therockmotos.com.br');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const targetEmail = customEmail || email;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin');
      } else {
        setError(data.error || 'Credenciais inválidas');
      }
    } catch {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    handleLogin(undefined, demoEmail);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Luz de fundo */}
      <div className="absolute w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20"></div>
      <div className="absolute w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20"></div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 relative z-10">
        {/* Header do Login */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-[#6d3df5] to-[#8f6bff] rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-purple-500/30">
            <Bike className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            moto<span className="text-[#6d3df5]">flow</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            The Rock Moto Shop · Acesso Seguro
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              E-mail de Acesso
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-500/20 transition">
              <Mail className="w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@therockmotos.com.br"
                className="w-full bg-transparent text-xs text-slate-800 outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Senha
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-500/20 transition">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-xs text-slate-800 outline-none font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#6d3df5] hover:bg-[#5b32d0] text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? 'Validando Acesso...' : 'Entrar no Sistema'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Atalhos Rápidos para Testar Perfis (PRD 01) */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-3">
            Acesso Rápido por Perfil (Ambiente de Testes)
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('cassio@therockmotos.com.br')}
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-800 font-bold text-left transition flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <strong className="block text-[11px]">Cassio (Admin)</strong>
                <span className="text-[9px] text-purple-600 font-normal">Acesso a Custos & Lucros</span>
              </div>
            </button>

            <button
              onClick={() => handleQuickLogin('lucas.vendedor@therockmotos.com.br')}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-left transition flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <strong className="block text-[11px]">Lucas (Vendedor)</strong>
                <span className="text-[9px] text-slate-500 font-normal">Custos Bloqueados</span>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
          >
            ← Voltar para a Vitrine Pública
          </Link>
        </div>
      </div>
    </div>
  );
}
