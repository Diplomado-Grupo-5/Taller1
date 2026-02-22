import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IngresosService } from './ingresos.service';

@UseGuards(AuthGuard('jwt'))
@Controller('ingresos')
export class IngresosController {
  constructor(private readonly servicio: IngresosService) {}

  @Post()
  crear(
    @Request() req: any,
    @Body()
    cuerpo: {
      descripcion: string;
      monto: number;
      fecha: string;
      cuentaId?: number | null;
      usuarioId?: number;
    },
  ) {
    const usuarioId = req.user.id;
    return this.servicio.crear({ ...cuerpo, usuarioId });
  }

  @Get()
  listar(@Request() req: any) {
    const usuarioId = req.user.id;
    return this.servicio.listar(usuarioId);
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.servicio.obtenerUno(Number(id));
  }

  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body() cuerpo: {
      descripcion?: string;
      monto?: number;
      fecha?: string;
      cuentaId?: number | null;
    },
  ) {
    return this.servicio.actualizar(Number(id), cuerpo);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.servicio.eliminar(Number(id));
  }
}
