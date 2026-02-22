import { useMemo, useState } from 'react';
import { useGastos } from '../api/gastos.queries';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  }).format(n);
}

export default function ReportsPage() {
  const { data: gastos = [] } = useGastos();
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const filtered = useMemo(() => {
    return (gastos ?? []).filter((e) => new Date(e.fecha).toISOString().slice(0, 7) === month);
  }, [gastos, month]);

  const totalsByCategory = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((e) => {
      const key = e.categoria?.nombre ?? 'Sin categoría';
      map.set(key, (map.get(key) ?? 0) + Number(e.monto));
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const totalsByDay = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((e) => {
      const key = new Date(e.fecha).toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + Number(e.monto));
    });
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }, [filtered]);

  const maxCategory = Math.max(1, ...totalsByCategory.map(([, v]) => v));
  const maxDay = Math.max(1, ...totalsByDay.map(([, v]) => v));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Reportes</h1>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-500 uppercase tracking-wider">Mes</label>
              <input
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                aria-label="Mes para reportes"
              />
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Gasto Total</p>
              <p className="text-2xl font-bold text-rose-600">
                {formatCurrency(filtered.reduce((s, e) => s + Number(e.monto), 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Totales por categoría</h2>
          <div className="space-y-4">
            {totalsByCategory.map(([name, total]) => {
              const pct = Math.round((total / maxCategory) * 100);
              return (
                <div key={name} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-slate-700 truncate">{name}</div>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                      aria-label={`Barra ${name} ${pct}%`}
                    />
                  </div>
                  <div className="w-28 text-right text-sm font-bold text-slate-900">{formatCurrency(total)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Totales diarios</h2>
          <div className="space-y-3">
            {totalsByDay.map(([day, total]) => {
              const pct = Math.round((total / maxDay) * 100);
              return (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-24 text-xs font-medium text-slate-500">{day}</div>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                      aria-label={`Barra ${day} ${pct}%`}
                    />
                  </div>
                  <div className="w-24 text-right text-xs font-bold text-slate-700">{formatCurrency(total)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
