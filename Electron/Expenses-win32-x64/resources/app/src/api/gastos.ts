import { api } from './client';

export type Gasto = {
  id: number;
  descripcion: string;
  monto: number;
  fecha: string;
  categoriaId: number | null;
  categoria?: { id: number; nombre: string } | null;
  cuentaId: number | null;
  cuenta?: { id: number; nombre: string } | null;
  comercio?: string | null;
  creadoEn: string;
  actualizadoEn: string;
};

export const GastosAPI = {
  listar: () => api.get<Gasto[]>('/gastos'),
  crear: (data: {
    descripcion: string;
    monto: number;
    fecha: string;
    categoriaId?: number | null;
    cuentaId?: number | null;
    comercio?: string | null;
    usuarioId?: number | null;
  }) =>
    api.post<Gasto>('/gastos', data),
  actualizar: (
    id: number,
    data: Partial<{
      descripcion: string;
      monto: number;
      fecha: string;
      categoriaId: number | null;
      cuentaId: number | null;
      comercio?: string | null;
      usuarioId?: number | null;
    }>,
  ) =>
    api.patch<Gasto>(`/gastos/${id}`, data),
  eliminar: (id: number) => api.delete<void>(`/gastos/${id}`),
};
