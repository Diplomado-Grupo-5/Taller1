import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import { Prisma } from '@prisma/client';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('login')
  async iniciarSesion(@Body() cuerpo: any) {
    const usuario = await this.autenticacionService.validarUsuario(cuerpo.correo, cuerpo.contrasena);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.autenticacionService.iniciarSesion(usuario);
  }

  @Post('register')
  async registrarse(@Body() cuerpo: { nombre: string; correo: string; contrasena: string }) {
    return this.autenticacionService.registrarse(cuerpo);
  }
}
