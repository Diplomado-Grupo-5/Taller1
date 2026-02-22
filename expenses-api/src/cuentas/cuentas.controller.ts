import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CuentasService } from './cuentas.service';

@UseGuards(AuthGuard('jwt'))
@Controller('cuentas')
export class CuentasController {
  constructor(private readonly servicio: CuentasService) {}

  @Post()
  crear(@Request() req: any, @Body() cuerpo: { nombre: string }) {
    const usuarioId = req.user.id;
    return this.servicio.crear({ usuarioId, nombre: cuerpo.nombre });
  }

  @Get()
  obtenerTodos(@Request() req: any) {
    const usuarioId = req.user.id;
    return this.servicio.obtenerTodos(usuarioId);
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.servicio.obtenerUno(Number(id));
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() cuerpo: { nombre?: string }) {
    return this.servicio.actualizar(Number(id), { nombre: cuerpo.nombre });
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.servicio.eliminar(Number(id));
  }
}
