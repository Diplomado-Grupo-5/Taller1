import { useState, useMemo } from 'react';
import { useCategorias } from '../api/categorias.queries';
import { useGastos } from '../api/gastos.queries';
import { usePresupuestos, useCreatePresupuesto, useDeletePresupuesto } from '../api/presupuestos.queries';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  }).format(n);
}

export default function PresupuestosPage() {
  const [cantidad, setCantidad] = useState('');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data: presupuestos = [], isLoading } = usePresupuestos(anio, mes);
  const { data: categorias = [] } = useCategorias();
  const { data: gastos = [] } = useGastos();

  const createMut = useCreatePresupuesto();
  const deleteMut = useDeletePresupuesto();

  const gastosDelMes = useMemo(() => {
    return gastos.filter(g => {
      const fecha = new Date(g.fecha);
      return fecha.getMonth() + 1 === mes && fecha.getFullYear() === anio;
    });
  }, [gastos, mes, anio]);

  const gastosPorCategoria = useMemo(() => {
    const map = new Map<number, number>();
    gastosDelMes.forEach(g => {
      if (g.categoriaId) {
        const actual = map.get(g.categoriaId) || 0;
        map.set(g.categoriaId, actual + Number(g.monto));
      }
    });
    return map;
  }, [gastosDelMes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cantidad || categoriaId === "") return;
    
    await createMut.mutateAsync({
      cantidad: parseFloat(cantidad),
      mes,
      anio,
      categoriaId: Number(categoriaId)
    });

    setCantidad('');
    setCategoriaId('');
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Presupuestos</h1>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <div className="w-2 h-6 bg-indigo-500 rounded-sm"></div>
          Definir Presupuesto Mensual
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Categoría</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value === "" ? "" : Number(e.target.value))}
              required
            >
              <option value="">Seleccionar Categoría</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Cantidad</label>
            <input
              type="number"
              placeholder="0.00"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              min="0"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Mes</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
            >
              {meses.map((m, idx) => (
                <option key={m} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Año</label>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={anio}
              min="2000"
              onChange={(e) => setAnio(parseInt(e.target.value))}
              required
            />
          </div>
          <button
            type="submit"
            disabled={createMut.isPending}
            className="md:col-span-4 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium shadow-sm"
          >
            {createMut.isPending ? 'Guardando...' : 'Establecer Presupuesto'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-semibold text-slate-800">
            Presupuestos de {meses[mes - 1]} {anio}
          </h2>
          <div className="flex gap-2">
             <select 
              value={mes} 
              onChange={(e) => setMes(parseInt(e.target.value))}
              className="text-xs border rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              {meses.map((m, idx) => (
                <option key={m} value={idx + 1}>{m}</option>
              ))}
            </select>
            <input 
              type="number" 
              value={anio} 
              min="2000"
              onChange={(e) => setAnio(parseInt(e.target.value))}
              className="text-xs border rounded-md px-2 py-1 w-20 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Categoría</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px] text-right">Límite</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px] text-right">Gastado</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Progreso</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px] text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">Cargando presupuestos...</td></tr>
              ) : presupuestos.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">No hay presupuestos definidos para este periodo.</td></tr>
              ) : (
                presupuestos.map((p) => {
                  const gastado = gastosPorCategoria.get(p.categoriaId) || 0;
                  const porcentaje = Math.min((gastado / Number(p.cantidad)) * 100, 100);
                  const excedido = gastado > Number(p.cantidad);
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {categorias.find(c => c.id === p.categoriaId)?.nombre || 'Sin categoría'}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-600">
                        {formatCurrency(Number(p.cantidad))}
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold ${excedido ? 'text-red-600' : 'text-emerald-600'}`}>
                        {formatCurrency(gastado)}
                      </td>
                      <td className="px-6 py-4 min-w-[150px]">
                        <div className="flex flex-col gap-1">
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${excedido ? 'bg-red-500' : 'bg-emerald-500'}`}
                              style={{ width: `${porcentaje}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-bold uppercase ${excedido ? 'text-red-500' : 'text-slate-400'}`}>
                            {excedido ? '¡Presupuesto excedido!' : `${Math.round(porcentaje)}% utilizado`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {confirmDelete === p.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  deleteMut.mutate(p.id);
                                  setConfirmDelete(null);
                                }}
                                className="text-[10px] font-bold text-red-600 hover:bg-red-50 px-2 py-1 rounded border border-red-100 uppercase"
                              >
                                Si
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="text-[10px] font-bold text-slate-500 hover:bg-slate-50 px-2 py-1 rounded border border-slate-100 uppercase"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(p.id)}
                              className="text-slate-400 hover:text-red-600 p-1"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
