import { useMemo, useState, useDeferredValue } from 'react';
import { useCuentas } from '../api/cuentas.queries';
import { useIngresos, useCreateIngreso, useUpdateIngreso, useDeleteIngreso } from '../api/ingresos.queries';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  }).format(n);
}

function parseAmount(input: string) {
  const normalized = input.replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

type EditingState = {
  id: number;
  descripcion: string;
  monto: string;
  fecha: string;
  cuentaId: number | "";
};

export default function IngresosPage() {
  const { data: ingresos = [] } = useIngresos();
  const { data: cuentas = [] } = useCuentas();

  const createMut = useCreateIngreso();
  const updateMut = useUpdateIngreso();
  const deleteMut = useDeleteIngreso();

  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [cuentaId, setCuentaId] = useState<number | "">("");

  const [editing, setEditing] = useState<EditingState | null>(null);
  const [filters] = useState({ start: '', end: '', min: '', max: '' });
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const deferredSearch = useDeferredValue(debouncedSearch);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseAmount(monto);
    if (amount <= 0) return;

    await createMut.mutateAsync({
      descripcion: descripcion.trim(),
      monto: amount,
      fecha: new Date(fecha).toISOString(),
      cuentaId: cuentaId !== "" ? Number(cuentaId) : null,
    });

    setDescripcion("");
    setMonto("");
    setFecha(new Date().toISOString().slice(0, 10));
    setCuentaId("");
  }

  function startEdit(i: any) {
    setEditing({
      id: i.id,
      descripcion: i.descripcion,
      monto: String(i.monto),
      fecha: new Date(i.fecha).toISOString().slice(0, 10),
      cuentaId: i.cuentaId ?? "",
    });
  }

  function cancelEdit() {
    setEditing(null);
  }

  async function saveEdit() {
    if (!editing) return;
    const amount = parseAmount(editing.monto);

    await updateMut.mutateAsync({
      id: editing.id,
      data: {
        descripcion: editing.descripcion.trim(),
        monto: amount,
        fecha: new Date(editing.fecha).toISOString(),
        cuentaId: editing.cuentaId !== "" ? Number(editing.cuentaId) : null,
      },
    });

    setEditing(null);
  }

  const filteredIngresos = useMemo(() => {
    const start = filters.start ? new Date(filters.start) : null;
    const end = filters.end ? new Date(filters.end) : null;
    const min = filters.min ? parseAmount(filters.min) : null;
    const max = filters.max ? parseAmount(filters.max) : null;
    const search = deferredSearch.toLowerCase().trim();

    return (ingresos ?? []).filter((i) => {
      const d = new Date(i.fecha);
      const afterStart = start ? d >= start : true;
      const beforeEnd = end ? d <= end : true;
      const amt = Number(i.monto);
      const aboveMin = min !== null ? amt >= min : true;
      const belowMax = max !== null ? amt <= max : true;
      const matchesSearch = !search || i.descripcion.toLowerCase().includes(search);
      return afterStart && beforeEnd && aboveMin && belowMax && matchesSearch;
    });
  }, [ingresos, filters, deferredSearch]);

  const totalFiltered = useMemo(() => {
    return filteredIngresos.reduce((sum, i) => sum + Number(i.monto), 0);
  }, [filteredIngresos]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Ingresos</h1>
        <div className="text-sm font-medium bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          Total filtrado: <span className="text-indigo-600 font-bold">{formatCurrency(totalFiltered)}</span>
        </div>
      </div>

      <form onSubmit={handleCreate} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <div className="w-2 h-6 bg-indigo-500 rounded-sm"></div>
          Registrar Ingreso
        </h2>

        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Descripción</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Salario, Freelance..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Monto</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Fecha</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Cuenta</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              value={cuentaId}
              onChange={(e) => setCuentaId(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">Seleccionar cuenta</option>
              {cuentas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
          disabled={createMut.isPending}
        >
          {createMut.isPending ? "Guardando..." : "Guardar Ingreso"}
        </button>

        {createMut.isError && (
          <p className="text-sm text-red-600">Error al crear: {String(createMut.error)}</p>
        )}
      </form>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
          <h2 className="font-semibold text-slate-800 whitespace-nowrap">Historial de Ingresos</h2>
          
          <div className="flex-1 w-full max-w-md relative">
            <input
              type="text"
              placeholder="Buscar por descripción..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-4 h-4 absolute left-3 top-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <p className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 whitespace-nowrap">
            {filteredIngresos.length} registros
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Fecha</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Descripción</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Cuenta</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px] text-right">Monto</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px] text-center">Acciones</th>
              </tr>
            </thead>
                <tbody className="divide-y divide-slate-100">
              {filteredIngresos.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">No hay ingresos que coincidan con los filtros.</td></tr>
              ) : (
                filteredIngresos.map((i) => {
                  const isEditing = editing?.id === i.id;
                  if (isEditing) {
                    return (
                      <tr key={i.id} className="bg-indigo-50/50">
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                            value={editing.fecha}
                            onChange={(e) => setEditing({ ...editing, fecha: e.target.value })}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                            value={editing.descripcion}
                            onChange={(e) => setEditing({ ...editing, descripcion: e.target.value })}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                            value={editing.cuentaId}
                            onChange={(e) => setEditing({ ...editing, cuentaId: e.target.value === "" ? "" : Number(e.target.value) })}
                          >
                            <option value="">Sin cuenta</option>
                            {cuentas.map((a) => (
                              <option key={a.id} value={a.id}>{a.nombre}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-right outline-none focus:ring-1 focus:ring-indigo-500"
                            value={editing.monto}
                            onChange={(e) => setEditing({ ...editing, monto: e.target.value })}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={saveEdit}
                              className="rounded bg-indigo-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-indigo-700 uppercase"
                              disabled={updateMut.isPending}
                            >
                              Ok
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="rounded border border-slate-300 bg-white px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-50 uppercase"
                            >
                              X
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={i.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(i.fecha).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{i.descripcion}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {cuentas.find(a => a.id === i.cuentaId)?.nombre || "-"}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-indigo-600">
                        {formatCurrency(Number(i.monto))}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(i)}
                            className="text-slate-400 hover:text-indigo-600 p-1"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("¿Eliminar este ingreso?")) {
                                deleteMut.mutate(i.id);
                              }
                            }}
                            className="text-slate-400 hover:text-red-600 p-1"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
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
