import { api } from './client';

export type Cuenta = {
  id: number;
  usuarioId: number;
  nombre: string;
  creadoEn: string;
  actualizadoEn: string;
};

export const CuentasAPI = {
  listar: (usuarioId?: number) => api.get<Cuenta[]>(usuarioId ? `/cuentas?usuarioId=${usuarioId}` : '/cuentas'),
  crear: (data: { nombre: string }) => api.post<Cuenta>('/cuentas', data),
  actualizar: (id: number, nombre: string) => api.patch<Cuenta>(`/cuentas/${id}`, { nombre }),
  eliminar: (id: number) => api.delete<void>(`/cuentas/${id}`),
};
