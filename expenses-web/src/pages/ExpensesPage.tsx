import { useMemo, useState, useDeferredValue } from 'react';
import { useCategorias } from '../api/categorias.queries';
import { useCuentas } from '../api/cuentas.queries';
import { useGastos, useCreateGasto, useUpdateGasto, useDeleteGasto } from '../api/gastos.queries';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
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
  categoriaId: number | "";
  cuentaId: number | "";
  comercio: string;
};

export default function ExpensesPage() {
  const { data: categorias = [] } = useCategorias();
  const { data: gastos = [], isLoading: expensesLoading, isError: expensesError, error: errorGastos } = useGastos();
  const { data: cuentas = [] } = useCuentas();

  const createMut = useCreateGasto();
  const updateMut = useUpdateGasto();
  const deleteMut = useDeleteGasto();

  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [cuentaId, setCuentaId] = useState<number | "">("");
  const [comercio, setComercio] = useState("");

  const [editing, setEditing] = useState<EditingState | null>(null);
  const [filters] = useState({ start: '', end: '', categoriaId: '', min: '', max: '' });
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
      categoriaId: categoriaId !== "" ? Number(categoriaId) : null,
      cuentaId: cuentaId !== "" ? Number(cuentaId) : null,
      comercio: comercio.trim() || null,
    });

    setDescripcion("");
    setMonto("");
    setFecha(new Date().toISOString().slice(0, 10));
    setCategoriaId("");
    setCuentaId("");
    setComercio("");
  }

  function startEdit(g: any) {
    setEditing({
      id: g.id,
      descripcion: g.descripcion,
      monto: String(g.monto),
      fecha: new Date(g.fecha).toISOString().slice(0, 10),
      categoriaId: g.categoriaId ?? "",
      cuentaId: g.cuentaId ?? "",
      comercio: g.comercio ?? "",
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
        categoriaId: editing.categoriaId !== "" ? Number(editing.categoriaId) : null,
        cuentaId: editing.cuentaId !== "" ? Number(editing.cuentaId) : null,
        comercio: editing.comercio.trim() || null,
      },
    });

    setEditing(null);
  }

  const filteredExpenses = useMemo(() => {
    const start = filters.start ? new Date(filters.start) : null;
    const end = filters.end ? new Date(filters.end) : null;
    const min = filters.min ? parseAmount(filters.min) : null;
    const max = filters.max ? parseAmount(filters.max) : null;
    const search = deferredSearch.toLowerCase().trim();

    return gastos.filter((e) => {
      const d = new Date(e.fecha);
      const afterStart = start ? d >= start : true;
      const beforeEnd = end ? d <= end : true;
      const byCategory = filters.categoriaId ? e.categoriaId === Number(filters.categoriaId) : true;
      const amt = Number(e.monto);
      const aboveMin = min !== null ? amt >= min : true;
      const belowMax = max !== null ? amt <= max : true;
      
      const matchesSearch = !search || 
        e.descripcion.toLowerCase().includes(search) || 
        (e.comercio?.toLowerCase().includes(search) ?? false);

      return afterStart && beforeEnd && byCategory && aboveMin && belowMax && matchesSearch;
    });
  }, [gastos, filters, deferredSearch]);

  const totalFiltered = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + Number(e.monto), 0);
  }, [filteredExpenses]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Gastos</h1>
        <div className="text-sm font-medium bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          Total filtrado: <span className="text-emerald-600 font-bold">{formatCurrency(totalFiltered)}</span>
        </div>
      </div>

      <form onSubmit={handleCreate} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <div className="w-2 h-6 bg-emerald-500 rounded-sm"></div>
          Registrar Gasto
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Descripción</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Compra supermercado"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Monto</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Categoría</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Cuenta</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
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

          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Comercio</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              value={comercio}
              onChange={(e) => setComercio(e.target.value)}
              placeholder="Ej. Éxito, Jumbo..."
            />
          </div>
        </div>

        <button
          className="rounded-lg bg-emerald-600 px-6 py-2.5 text-white font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
          disabled={createMut.isPending}
        >
          {createMut.isPending ? "Guardando..." : "Guardar Gasto"}
        </button>

        {createMut.isError && (
          <p className="text-sm text-red-600">Error al crear: {String(createMut.error)}</p>
        )}
      </form>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
          <h2 className="font-semibold text-slate-800 whitespace-nowrap">Historial de Gastos</h2>
          
          <div className="flex-1 w-full max-w-md relative">
            <input
              type="text"
              placeholder="Buscar por descripción o comercio..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <p className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 whitespace-nowrap">
            {filteredExpenses.length} registros
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Descripción</th>
                <th className="px-5 py-3">Categoría</th>
                <th className="px-5 py-3 text-right">Monto</th>
                <th className="px-5 py-3 text-center w-48">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {expensesLoading && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">Cargando gastos…</td>
                </tr>
              )}
              {expensesError && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-red-500">Error: {String(errorGastos)}</td>
                </tr>
              )}
              {!expensesLoading && !expensesError && filteredExpenses.map((g) => {
                const isEditing = editing?.id === g.id;

                return (
                  <tr key={g.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <input
                          type="date"
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                          value={editing.fecha}
                          onChange={(e) => setEditing(prev => prev ? { ...prev, fecha: e.target.value } : prev)}
                        />
                      ) : (
                        new Date(g.fecha).toISOString().slice(0, 10)
                      )}
                    </td>

                    <td className="px-5 py-3 text-slate-800 font-medium">
                      {isEditing ? (
                        <input
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                          value={editing.descripcion}
                          onChange={(e) => setEditing(prev => prev ? { ...prev, descripcion: e.target.value } : prev)}
                        />
                      ) : (
                        <div>
                          {g.descripcion}
                          {g.comercio && <div className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">{g.comercio}</div>}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      {isEditing ? (
                        <select
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs bg-white"
                          value={editing.categoriaId}
                          onChange={(e) => setEditing(prev => prev ? { ...prev, categoriaId: e.target.value === "" ? "" : Number(e.target.value) } : prev)}
                        >
                          <option value="">Sin categoría</option>
                          {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nombre}
                            </option>
                          ))}
                        </select>
                      ) : (
                        g.categoria ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {g.categoria.nombre}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Sin categoría</span>
                        )
                      )}
                    </td>

                    <td className="px-5 py-3 text-right font-bold text-slate-700 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-24 rounded border border-slate-300 px-2 py-1 text-xs text-right"
                          value={editing.monto}
                          onChange={(e) => setEditing(prev => prev ? { ...prev, monto: e.target.value } : prev)}
                        />
                      ) : (
                        formatCurrency(g.monto)
                      )}
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex justify-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              className="rounded bg-slate-800 px-3 py-1 text-white text-xs font-medium hover:bg-black transition-colors disabled:opacity-50"
                              onClick={saveEdit}
                              disabled={updateMut.isPending}
                            >
                              {updateMut.isPending ? "..." : "Guardar"}
                            </button>
                            <button
                              className="rounded border border-slate-300 px-3 py-1 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                              onClick={cancelEdit}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="rounded border border-slate-200 px-3 py-1 text-indigo-600 text-xs font-medium hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                              onClick={() => startEdit(g)}
                            >
                              Editar
                            </button>
                            <button
                              className="rounded bg-red-50 px-3 py-1 text-red-600 text-xs font-medium hover:bg-red-600 hover:text-white transition-all border border-red-100"
                              onClick={() => {
                                if (!confirm("¿Eliminar este gasto?")) return;
                                deleteMut.mutate(g.id);
                              }}
                              disabled={deleteMut.isPending}
                            >
                              Borrar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!expensesLoading && !expensesError && filteredExpenses.length === 0 && (
                <tr>
                  <td className="p-10 text-center text-slate-500" colSpan={5}>
                    No se encontraron gastos. Registra el primero arriba.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(updateMut.isError || deleteMut.isError) && (
          <div className="p-4 border-t border-red-100 bg-red-50">
            {updateMut.isError && <p className="text-xs text-red-600 font-medium">Error al actualizar: {String(updateMut.error)}</p>}
            {deleteMut.isError && <p className="text-xs text-red-600 font-medium">Error al eliminar: {String(deleteMut.error)}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
