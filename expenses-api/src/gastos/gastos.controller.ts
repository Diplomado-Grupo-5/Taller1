import { Body, Controller, Delete, Get, Param, Patch, Post, BadRequestException, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GastosService } from './gastos.service';

@UseGuards(AuthGuard('jwt'))
@Controller('gastos')
export class GastosController {
  constructor(private readonly servicio: GastosService) {}

  @Post()
  crear(
    @Request() req: any,
    @Body()
    cuerpo: {
      descripcion: string;
      monto: number;
      fecha: string;
      categoriaId?: number | null;
      cuentaId?: number | null;
      comercio?: string | null;
    },
  ) {
    if (cuerpo.monto < 0) {
      throw new BadRequestException('El monto no puede ser negativo');
    }
    const usuarioId = req.user.id;
    return this.servicio.crear({ ...cuerpo, usuarioId });
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
  actualizar(
    @Param('id') id: string,
    @Body()
    cuerpo: {
      descripcion?: string;
      monto?: number;
      fecha?: string;
      categoriaId?: number | null;
      cuentaId?: number | null;
      comercio?: string | null;
    },
  ) {
    if (cuerpo.monto !== undefined && cuerpo.monto < 0) {
      throw new BadRequestException('El monto no puede ser negativo');
    }
    return this.servicio.actualizar(Number(id), cuerpo);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.servicio.eliminar(Number(id));
  }
}
