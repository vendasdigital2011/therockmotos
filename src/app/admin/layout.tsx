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
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#172033] antialiased">
      {children}
    </div>
  );
}
