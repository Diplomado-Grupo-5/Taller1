import { api } from './client';

export interface Usuario {
  id: number;
  correo: string;
  nombre: string;
}

export interface RespuestaAutenticacion {
  access_token: string;
  usuario: Usuario;
}

export const AutenticacionAPI = {
  iniciarSesion: (data: any) => api.post<RespuestaAutenticacion>('/autenticacion/login', data),
  registrarse: (data: any) => api.post<Usuario>('/autenticacion/register', data),
};
