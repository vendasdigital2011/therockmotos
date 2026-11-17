import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MotoFlow — Painel Administrativo',
  description: 'Sistema de Gestão de Motos, Custos, Estoque e CRM',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demo = process.env.DEMO_MODE === 'true';
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#172033] antialiased">
      {demo && (
        <div className="bg-amber-100 text-amber-900 text-xs font-semibold px-4 py-2 text-center border-b border-amber-200">
          Modo demonstração: dados fictícios. NF-e, RENAVE, PIX/boleto, portais e WhatsApp são simulados.
        </div>
      )}
      {children}
    </div>
  );
}
