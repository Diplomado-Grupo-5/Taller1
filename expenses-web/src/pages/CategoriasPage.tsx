import { useState } from 'react';
import { useCategorias, useCreateCategoria, useUpdateCategoria, useDeleteCategoria } from '../api/categorias.queries';

type EditingState = {
  id: number;
  nombre: string;
};

export default function CategoriasPage() {
  const { data: categorias = [], isLoading } = useCategorias();
  const createMut = useCreateCategoria();
  const updateMut = useUpdateCategoria();
  const deleteMut = useDeleteCategoria();

  const [nombre, setNombre] = useState("");
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    await createMut.mutateAsync(nombre.trim());
    setNombre("");
  }

  async function handleUpdate() {
    if (!editing || !editing.nombre.trim()) return;
    await updateMut.mutateAsync({ id: editing.id, nombre: editing.nombre.trim() });
    setEditing(null);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Categorías</h1>
        <p className="text-slate-500 mt-1">Organiza tus gastos e ingresos con categorías personalizadas.</p>
      </div>

      {/* Formulario de Creación */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <form onSubmit={handleCreate} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1 tracking-wider">
              Nueva Categoría
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Ej: Comida, Transporte, Salud..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={createMut.isPending}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {createMut.isPending ? "Agregando..." : "Agregar"}
          </button>
        </form>
        {createMut.isError && <p className="text-red-500 text-xs mt-2">Error al crear: {String(createMut.error)}</p>}
      </div>

      {/* Lista de Categorías */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Nombre</th>
              <th className="px-6 py-4 font-semibold text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-500 italic">Cargando categorías...</td></tr>
            ) : categorias.length === 0 ? (
              <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-500 italic">No hay categorías registradas.</td></tr>
            ) : (
              categorias.map((c) => (
                <tr key={c.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    {editing?.id === c.id ? (
                      <input
                        autoFocus
                        className="w-full rounded border border-indigo-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        value={editing.nombre}
                        onChange={(e) => setEditing({ ...editing, nombre: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdate();
                          if (e.key === 'Escape') setEditing(null);
                        }}
                      />
                    ) : (
                      <span className="text-slate-700 font-medium">{c.nombre}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {editing?.id === c.id ? (
                        <>
                          <button onClick={handleUpdate} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs uppercase tracking-tight">Guardar</button>
                          <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600 font-medium text-xs uppercase tracking-tight">Cancelar</button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditing({ id: c.id, nombre: c.nombre })}
                            className="text-slate-400 hover:text-indigo-600 p-1"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          {confirmDelete === c.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  deleteMut.mutate(c.id);
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
                              onClick={() => setConfirmDelete(c.id)}
                              className="text-slate-400 hover:text-red-600 p-1"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
