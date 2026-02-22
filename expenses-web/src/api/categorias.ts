import { api } from './client';

export type Categoria = {
  id: number;
  nombre: string;
  creadoEn: string;
  actualizadoEn: string;
};

export const CategoriasAPI = {
  listar: () => api.get<Categoria[]>('/categorias'),
  crear: (nombre: string) => api.post<Categoria>('/categorias', { nombre }),
  actualizar: (id: number, nombre: string) => api.patch<Categoria>(`/categorias/${id}`, { nombre }),
  eliminar: (id: number) => api.delete<void>(`/categorias/${id}`),
};
