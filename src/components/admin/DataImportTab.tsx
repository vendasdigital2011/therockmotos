'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldCheck,
  FileText,
} from 'lucide-react';

interface DataImportTabProps {
  onSuccess: () => void;
  showToast: (msg: string) => void;
}

export default function DataImportTab({ onSuccess, showToast }: DataImportTabProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [dryRunResult, setDryRunResult] = useState<any>(null);
  const [loadingDryRun, setLoadingDryRun] = useState(false);
  const [executing, setExecuting] = useState(false);

  const sampleVehicles = [
    {
      plate: 'MTO2026',
      brand: 'Kawasaki',
      model: 'Ninja 400 KRT',
      yearMfg: 2023,
      yearModel: 2024,
      color: 'Verde Lime',
      mileage: 8200,
      publicPrice: 34900,
      costPrice: 28500,
      chassis: '9K2EX400GPA001928',
      renavam: '00982138271',
    },
    {
      plate: 'TRK9921',
      brand: 'Triumph',
      model: 'Tiger 900 Rally Pro',
      yearMfg: 2022,
      yearModel: 2022,
      color: 'Branca',
      mileage: 18500,
      publicPrice: 66900,
      costPrice: 57000,
      chassis: '9TRT900RPMA091822',
      renavam: '00817263541',
    },
    {
      plate: 'BMW1A23',
      brand: 'BMW',
      model: 'F 850 GS Adventure',
      yearMfg: 2023,
      yearModel: 2023,
      color: 'Triple Black',
      mileage: 12000,
      publicPrice: 72000,
      costPrice: 62000,
      chassis: '9BMF850GSNA991029',
      renavam: '00718293041',
    },
  ];

  const handleLoadSample = () => {
    setJsonInput(JSON.stringify(sampleVehicles, null, 2));
    setDryRunResult(null);
  };

  const handleDryRun = async () => {
    if (!jsonInput.trim()) {
      alert('Insira os dados antes de simular a importação');
      return;
    }

    try {
      setLoadingDryRun(true);
      let parsedRows;
      try {
        parsedRows = JSON.parse(jsonInput);
      } catch {
        alert('Formato JSON inválido. Verifique a sintaxe.');
        setLoadingDryRun(false);
        return;
      }

      if (!Array.isArray(parsedRows)) {
        alert('Os dados devem ser um array de veículos');
        setLoadingDryRun(false);
        return;
      }

      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dry_run',
          rows: parsedRows,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setDryRunResult(result);
        if (result.invalidRows === 0) {
          showToast(`Simulação aprovada: ${result.validRows} linhas validadas sem erros!`);
        } else {
          showToast(`Atenção: ${result.invalidRows} linhas possuem inconsistências.`);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Erro na simulação');
      }
    } catch {
      alert('Erro de conexão ao simular importação');
    } finally {
      setLoadingDryRun(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!dryRunResult || dryRunResult.invalidRows > 0) {
      alert('Execute o Dry-Run e corrija os erros antes de importar');
      return;
    }

    try {
      setExecuting(true);
      const parsedRows = JSON.parse(jsonInput);

      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute',
          rows: parsedRows,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        showToast(`Sucesso! ${result.importedCount} veículos importados no estoque!`);
        setJsonInput('');
        setDryRunResult(null);
        onSuccess();
      } else {
        const err = await res.json();
        alert(err.error || 'Erro na execução da importação');
      }
    } catch {
      alert('Erro de conexão ao executar importação');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-purple-600" /> Importação & Qualidade de Dados (PRD 14)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Ingestão em lote com validação prévia obrigatória (Dry-Run), prevenção de duplicidades e rollback atômico
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl transition cursor-pointer border border-purple-200"
          >
            Carregar Lote de Exemplo
          </button>
        </div>
      </div>

      {/* Editor / Entrada de Dados */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4 text-purple-600" /> Dados para Carga (JSON / Planilha)
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            Campos: plate, brand, model, yearMfg, yearModel, color, mileage, publicPrice, costPrice, chassis, renavam
          </span>
        </div>

        <textarea
          rows={8}
          placeholder="Cole aqui o JSON de veículos a importar..."
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            setDryRunResult(null);
          }}
          className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white transition"
        />

        <div className="flex gap-3">
          <button
            onClick={handleDryRun}
            disabled={loadingDryRun || !jsonInput.trim()}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Play className="w-4 h-4" /> 1. Simular Importação (Dry-Run)
          </button>

          <button
            onClick={handleExecuteImport}
            disabled={executing || !dryRunResult || dryRunResult.invalidRows > 0}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <ShieldCheck className="w-4 h-4" /> 2. Executar Importação Atômica
          </button>
        </div>
      </div>

      {/* Resultado do Dry-Run */}
      {dryRunResult && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Relatório de Validação e Qualidade
            </h3>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                ✓ {dryRunResult.validRows} Válidas
              </span>
              <span
                className={`px-2.5 py-1 rounded-lg border ${
                  dryRunResult.invalidRows > 0
                    ? 'text-rose-700 bg-rose-50 border-rose-200'
                    : 'text-slate-500 bg-slate-50 border-slate-200'
                }`}
              >
                ✕ {dryRunResult.invalidRows} Inconsistentes
              </span>
            </div>
          </div>

          {dryRunResult.errors.length > 0 ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
              <span className="text-xs font-bold text-rose-900 block">
                Erros identificados que impedem a importação:
              </span>
              <ul className="text-xs text-rose-800 space-y-1">
                {dryRunResult.errors.map((err: any, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    <span>
                      <b>Linha {err.rowNumber}</b> ({err.plate || 'Sem placa'}): {err.message}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Todas as {dryRunResult.validRows} linhas foram aprovadas nos testes de integridade! Nenhuma duplicidade de placa ou chassi encontrada. Pronto para importação.
            </div>
          )}

          {/* Prévia dos Dados */}
          {dryRunResult.preview?.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-600 block mb-2">Prévia das Primeiras Linhas:</span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                    <tr>
                      <th className="py-2 px-3">Placa</th>
                      <th className="py-2 px-3">Veículo</th>
                      <th className="py-2 px-3">Ano Fab/Mod</th>
                      <th className="py-2 px-3">Preço Venda</th>
                      <th className="py-2 px-3">Custo Aquis.</th>
                      <th className="py-2 px-3">Status Validação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {dryRunResult.preview.map((p: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">{p.plate}</td>
                        <td className="py-2 px-3">{p.brand} {p.model}</td>
                        <td className="py-2 px-3">{p.yearMfg}/{p.yearModel}</td>
                        <td className="py-2 px-3 font-bold text-purple-700">R$ {Number(p.publicPrice).toLocaleString('pt-BR')}</td>
                        <td className="py-2 px-3 text-slate-600">R$ {Number(p.costPrice || 0).toLocaleString('pt-BR')}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {p.isValid ? 'VÁLIDO' : 'ERRO'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
