import { api } from './client';

export interface Presupuesto {
  id: number;
  cantidad: number;
  mes: number;
  anio: number;
  categoriaId: number;
  categoria?: { id: number; nombre: string };
  usuarioId: number;
  creadoEn: string;
  actualizadoEn: string;
}

export const PresupuestosAPI = {
  listar: (anio?: number, mes?: number) => {
    const params = new URLSearchParams();
    if (anio) params.append('anio', anio.toString());
    if (mes) params.append('mes', mes.toString());
    const query = params.toString();
    return api.get<Presupuesto[]>(`/presupuestos${query ? `?${query}` : ''}`);
  },
  crear: (data: any) => api.post<Presupuesto>('/presupuestos', data),
  actualizar: (id: number, data: any) => api.patch<Presupuesto>(`/presupuestos/${id}`, data),
  eliminar: (id: number) => api.delete(`/presupuestos/${id}`),
};
