import { api } from './client';

export interface Ingreso {
  id: number;
  descripcion: string;
  monto: number;
  fecha: string;
  cuentaId?: number;
  cuenta?: { id: number; nombre: string } | null;
  usuarioId: number;
  creadoEn: string;
  actualizadoEn: string;
}

export const IngresosAPI = {
  listar: () => api.get<Ingreso[]>('/ingresos'),
  crear: (data: any) => api.post<Ingreso>('/ingresos', data),
  actualizar: (id: number, data: any) => api.patch<Ingreso>(`/ingresos/${id}`, data),
  eliminar: (id: number) => api.delete(`/ingresos/${id}`),
};
