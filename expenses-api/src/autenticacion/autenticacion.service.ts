import { Injectable, ConflictException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class AutenticacionService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async validarUsuario(correo: string, contrasena: string): Promise<any> {
    const usuario = await this.usuariosService.buscarPorCorreo(correo);
    if (usuario && (await bcrypt.compare(contrasena, usuario.contrasena))) {
      const { contrasena, ...resultado } = usuario;
      return resultado;
    }
    return null;
  }

  async iniciarSesion(usuario: any) {
    const payload = { correo: usuario.correo, sub: usuario.id };
    return {
      access_token: this.jwtService.sign(payload),
      usuario: usuario,
    };
  }

  async registrarse(data: { nombre: string; correo: string; contrasena: string }) {
    const existente = await this.usuariosService.buscarPorCorreo(data.correo);
    if (existente) {
      throw new ConflictException('El correo ya está registrado');
    }
    const salt = await bcrypt.genSalt();
    const contrasenaHasheada = await bcrypt.hash(data.contrasena, salt);
    const usuario = await this.usuariosService.crear({
      nombre: data.nombre,
      correo: data.correo,
      contrasena: contrasenaHasheada,
    });
    const { contrasena, ...resultado } = usuario;
    return resultado;
  }
}
